"""Carga los datos iniciales. Se puede correr las veces que haga falta:
cada registro se busca por su clave natural y solo se crea si no existe.

Uso: python -m app.db.seed
"""

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

USUARIOS = [
    {
        "username": "admin",
        "full_name": "Administrador",
        "email": "admin@foodstore.com",
        "password": "Admin1234!",
        "role": "admin",
    },
    {
        "username": "cliente",
        "full_name": "Cliente Demo",
        "email": "cliente@foodstore.com",
        "password": "Cliente1234!",
        "role": "user",
    },
]


def seed_usuarios() -> int:
    creados = 0
    with UsuarioUnitOfWork() as uow:
        for datos in USUARIOS:
            if uow.usuarios.get_by_username(datos["username"]) is not None:
                continue
            uow.usuarios.add(
                Usuario(
                    username=datos["username"],
                    full_name=datos["full_name"],
                    email=datos["email"],
                    hashed_password=hash_password(datos["password"]),
                    role=datos["role"],
                )
            )
            creados += 1
    return creados


def main() -> None:
    create_all_tables()
    print(f"Usuarios creados: {seed_usuarios()}")
    print("Seed finalizado.")


if __name__ == "__main__":
    main()
