from datetime import datetime

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ReglaDeNegocioError(Exception):
    """Base de las violaciones de reglas de negocio que el router traduce a 400."""


class StockInsuficiente(ReglaDeNegocioError):
    pass


class ProductoNoDisponible(ReglaDeNegocioError):
    pass


class ProductoRepetido(ReglaDeNegocioError):
    pass


class TransicionInvalida(ReglaDeNegocioError):
    pass


class PedidoNoCancelable(ReglaDeNegocioError):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        """RN-01: si falla cualquier ítem se lanza la excepción, el UoW hace rollback
        y no queda nada persistido (ni el pedido ni el descuento de stock)."""
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Un producto no puede aparecer más de una vez en el pedido")

            pedido = Pedido(
                usuario_id=usuario_id,
                estado=EstadoPedido.PENDIENTE.value,
                forma_pago=data.forma_pago.value,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"El producto {item.producto_id} no existe")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"'{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' "
                        f"(pedido: {item.cantidad}, disponible: {producto.stock})"
                    )

                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: UserPublic, estado: EstadoPedido | None, skip: int, limit: int
    ) -> PedidosPaginados:
        filtro_estado = estado.value if estado is not None else None
        with self.uow as uow:
            if usuario.role == "admin":
                total, items = uow.pedidos.list_all(filtro_estado, skip, limit)
            else:
                total, items = uow.pedidos.list_by_usuario(usuario.id, filtro_estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No tenés acceso a este pedido")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        """RN-02 y RN-03: la transición se valida antes de tocar el pedido."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            actual = EstadoPedido(pedido.estado)
            if nuevo not in TRANSICIONES[actual]:
                raise TransicionInvalida(f"No se puede pasar de {actual.value} a {nuevo.value}")
            if nuevo is EstadoPedido.CANCELADO:
                self._restituir_stock(uow, pedido)
            self._aplicar_estado(pedido, nuevo)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """RN-03 y RN-04: el dueño cancela solo mientras el pedido está PENDIENTE."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No podés cancelar un pedido de otro usuario")
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise PedidoNoCancelable("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._restituir_stock(uow, pedido)
            self._aplicar_estado(pedido, EstadoPedido.CANCELADO)
            return PedidoRead.model_validate(pedido)

    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_con_items(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        # Se restituye aunque el producto esté dado de baja: el stock tiene que cerrar.
        for detalle in pedido.items:
            producto = uow.productos.get_by_id_for_update(detalle.producto_id)
            if producto is not None:
                producto.stock += detalle.cantidad

    @staticmethod
    def _aplicar_estado(pedido: Pedido, nuevo: EstadoPedido) -> None:
        pedido.estado = nuevo.value
        pedido.updated_at = datetime.now()
