from collections.abc import Sequence

from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_by_nombre(self, nombre: str) -> Producto | None:
        return self.session.exec(select(Producto).where(Producto.nombre == nombre)).first()

    def get_by_id_for_update(self, producto_id: int) -> Producto | None:
        # FOR UPDATE bloquea la fila hasta el commit: dos pedidos simultáneos no pueden
        # leer el mismo stock y venderlo dos veces. SQLite lo ignora.
        stmt = select(Producto).where(Producto.id == producto_id).with_for_update()
        return self.session.exec(stmt).first()

    def search(
        self,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, Sequence[Producto]]:
        """Listado de productos activos con filtros. Devuelve (total sin paginar, página)."""
        filtros = [Producto.activo == True]  # noqa: E712
        if search:
            filtros.append(Producto.nombre.ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        items = self.session.exec(
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        ).all()
        return total, items
