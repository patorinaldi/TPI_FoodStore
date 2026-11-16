"""Carga los datos iniciales. Se puede correr las veces que haga falta:
cada registro se busca por su clave natural y solo se crea si no existe.

Uso: python -m app.db.seed
"""

from urllib.parse import quote_plus

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
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

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas caseras con papas"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Dulces para cerrar la comida"),
]

# (nombre, categoría, descripción, precio, stock)
PRODUCTOS = [
    ("Hamburguesa Clásica", "Hamburguesas", "Carne, lechuga, tomate y cheddar", 8500, 25),
    ("Hamburguesa Doble Bacon", "Hamburguesas", "Doble carne, bacon crocante y cheddar", 11200, 20),
    ("Hamburguesa Veggie", "Hamburguesas", "Medallón de lentejas y vegetales grillados", 9000, 15),
    ("Pizza Muzzarella", "Pizzas", "Salsa de tomate, muzzarella y aceitunas", 9800, 18),
    ("Pizza Napolitana", "Pizzas", "Muzzarella, tomate en rodajas y ajo", 11500, 12),
    ("Pizza Fugazzeta", "Pizzas", "Rellena de muzzarella con cebolla", 12300, 10),
    ("Gaseosa Cola 500 ml", "Bebidas", "Botella individual", 2200, 60),
    ("Agua Mineral 500 ml", "Bebidas", "Sin gas", 1600, 60),
    ("Cerveza Rubia 473 ml", "Bebidas", "Lata", 3100, 40),
    ("Flan Casero", "Postres", "Con dulce de leche o crema", 4200, 15),
]


def _imagen(nombre: str) -> str:
    return f"https://placehold.co/400x300?text={quote_plus(nombre)}"


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


def seed_catalogo() -> tuple[int, int]:
    categorias_creadas = productos_creados = 0
    with ProductoUnitOfWork() as uow:
        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = uow.categorias.get_by_nombre(nombre)
            if categoria is None:
                categoria = uow.categorias.add(Categoria(nombre=nombre, descripcion=descripcion))
                categorias_creadas += 1
            categorias[nombre] = categoria

        for nombre, categoria, descripcion, precio, stock in PRODUCTOS:
            if uow.productos.get_by_nombre(nombre) is not None:
                continue
            uow.productos.add(
                Producto(
                    nombre=nombre,
                    categoria_id=categorias[categoria].id,
                    descripcion=descripcion,
                    precio_base=precio,
                    imagen_url=_imagen(nombre),
                    stock=stock,
                )
            )
            productos_creados += 1
    return categorias_creadas, productos_creados


def main() -> None:
    create_all_tables()
    print(f"Usuarios creados: {seed_usuarios()}")
    categorias, productos = seed_catalogo()
    print(f"Categorías creadas: {categorias}")
    print(f"Productos creados: {productos}")
    print("Seed finalizado.")


if __name__ == "__main__":
    main()
