from collections.abc import Callable
from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Agrupa todas las operaciones de un caso de uso en una sola transacción.

    Se usa como context manager: si el bloque termina bien se hace commit, si se
    lanza cualquier excepción se hace rollback. Es el único lugar del proyecto
    donde se llama a commit().
    """

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory) -> None:
        self._session_factory = session_factory
        self._session: Session | None = None

    @property
    def session(self) -> Session:
        if self._session is None:
            raise RuntimeError("La sesión solo existe dentro del bloque 'with'")
        return self._session

    def __enter__(self) -> Self:
        self._session = self._session_factory()
        self._init_repositories(self._session)
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
            self._session = None

    def _init_repositories(self, session: Session) -> None:
        """Cada UoW concreto instancia acá sus repositorios sobre la sesión compartida."""
