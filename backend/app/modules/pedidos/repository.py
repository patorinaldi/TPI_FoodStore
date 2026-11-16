from collections.abc import Sequence
from datetime import datetime
from typing import Any

from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def get_con_items(self, pedido_id: int) -> Pedido | None:
        stmt = select(Pedido).where(Pedido.id == pedido_id).options(selectinload(Pedido.items))
        return self.session.exec(stmt).first()

    def list_by_usuario(
        self, usuario_id: int, estado: str | None = None, skip: int = 0, limit: int = 20
    ) -> tuple[int, Sequence[Pedido]]:
        filtros: list[Any] = [Pedido.usuario_id == usuario_id]
        if estado is not None:
            filtros.append(Pedido.estado == estado)
        return self._paginar(filtros, skip, limit)

    def list_all(
        self, estado: str | None = None, skip: int = 0, limit: int = 20
    ) -> tuple[int, Sequence[Pedido]]:
        filtros: list[Any] = []
        if estado is not None:
            filtros.append(Pedido.estado == estado)
        return self._paginar(filtros, skip, limit)

    def count_by_estado(self) -> dict[str, int]:
        stmt = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        return {estado: cantidad for estado, cantidad in self.session.exec(stmt).all()}

    def count_desde(self, desde: datetime) -> int:
        stmt = select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        return self.session.exec(stmt).one()

    def sum_total_por_estado(self, estado: str) -> float:
        stmt = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(stmt).one())

    def _paginar(
        self, filtros: list[Any], skip: int, limit: int
    ) -> tuple[int, Sequence[Pedido]]:
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        items = self.session.exec(
            select(Pedido)
            .where(*filtros)
            .options(selectinload(Pedido.items))
            .order_by(Pedido.created_at.desc(), Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return total, items
