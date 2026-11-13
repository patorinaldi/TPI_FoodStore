from collections.abc import Sequence
from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Acceso a datos genérico. Solo consultas: las reglas de negocio quedan en el Service."""

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model, entity_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[T]:
        return self.session.exec(select(self.model).offset(skip).limit(limit)).all()

    def add(self, entity: T) -> T:
        # flush manda el INSERT sin cerrar la transacción, así tenemos el id
        # generado y podemos armar el schema de salida dentro del mismo bloque.
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
