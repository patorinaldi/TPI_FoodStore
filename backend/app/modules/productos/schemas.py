from typing import Annotated, TypeVar

from pydantic import StringConstraints, field_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead

NombreProducto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=150)]

T = TypeVar("T")


class ProductoCreate(SQLModel):
    categoria_id: int
    nombre: NombreProducto
    descripcion: str | None = Field(default=None, max_length=1000)
    precio_base: float = Field(ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True


class ProductoUpdate(SQLModel):
    categoria_id: int | None = None
    nombre: NombreProducto | None = None
    descripcion: str | None = Field(default=None, max_length=1000)
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None

    # Igual que en CategoriaUpdate: null solo se admite en las columnas opcionales.
    @field_validator("categoria_id", "nombre", "precio_base", "stock", "disponible")
    @classmethod
    def rechazar_null(cls, valor: T | None) -> T:
        if valor is None:
            raise ValueError("no puede ser null")
        return valor


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
