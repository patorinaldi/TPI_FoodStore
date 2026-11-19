from typing import Annotated

from pydantic import StringConstraints, field_validator
from sqlmodel import Field, SQLModel

# Se recorta antes de medir el largo: "   " no cuenta como un nombre de 3 caracteres.
NombreCategoria = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]


class CategoriaCreate(SQLModel):
    nombre: NombreCategoria
    descripcion: str | None = Field(default=None, max_length=500)


class CategoriaUpdate(SQLModel):
    nombre: NombreCategoria | None = None
    descripcion: str | None = Field(default=None, max_length=500)

    # Omitir el campo lo deja como está; mandarlo en null se rechaza con 422 (la columna es NOT NULL).
    # El validador no corre sobre el default, solo cuando el cliente envía el valor.
    @field_validator("nombre")
    @classmethod
    def rechazar_null(cls, valor: str | None) -> str:
        if valor is None:
            raise ValueError("no puede ser null")
        return valor


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
