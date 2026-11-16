from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import AdminUser, CurrentUser
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ReglaDeNegocioError,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

ErroresDePedido = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocioError)


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


PedidoServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]


def _a_http(error: Exception) -> HTTPException:
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        codigo = status.HTTP_404_NOT_FOUND
    elif isinstance(error, PedidoAjeno):
        codigo = status.HTTP_403_FORBIDDEN
    else:
        codigo = status.HTTP_400_BAD_REQUEST
    return HTTPException(status_code=codigo, detail=str(error))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, usuario: CurrentUser, service: PedidoServiceDep) -> PedidoRead:
    try:
        return service.crear(data, usuario.id)
    except ErroresDePedido as e:
        raise _a_http(e)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: CurrentUser,
    service: PedidoServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    return service.listar(usuario, estado, skip, limit)


# Tiene que ir antes de /{pedido_id}; si no, FastAPI intenta parsear "resumen" como id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_: AdminUser, service: PedidoServiceDep) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, usuario: CurrentUser, service: PedidoServiceDep) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except ErroresDePedido as e:
        raise _a_http(e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    pedido_id: int, data: CambioEstado, _: AdminUser, service: PedidoServiceDep
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except ErroresDePedido as e:
        raise _a_http(e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, usuario: CurrentUser, service: PedidoServiceDep) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario)
    except ErroresDePedido as e:
        raise _a_http(e)
