from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import EstadoPedido, PedidoCreate, PedidoRead
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado


class ReglaDeNegocioError(Exception):
    """Base de las violaciones de reglas de negocio que el router traduce a 400."""


class StockInsuficiente(ReglaDeNegocioError):
    pass


class ProductoNoDisponible(ReglaDeNegocioError):
    pass


class ProductoRepetido(ReglaDeNegocioError):
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
