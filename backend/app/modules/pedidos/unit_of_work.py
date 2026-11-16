from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Pedidos y productos comparten sesión: el descuento y la restitución de stock
    quedan en la misma transacción que el pedido."""

    pedidos: PedidoRepository
    productos: ProductoRepository

    def _init_repositories(self, session: Session) -> None:
        self.pedidos = PedidoRepository(session)
        self.productos = ProductoRepository(session)
