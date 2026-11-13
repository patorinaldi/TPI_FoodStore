from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite no deja compartir la conexión entre hilos por defecto y FastAPI
# atiende cada request en un hilo del pool, así que hay que desactivar el chequeo.
_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def create_all_tables() -> None:
    # Importar el registro carga todos los modelos en la metadata antes de crear las tablas.
    import app.db.models_registry  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)
