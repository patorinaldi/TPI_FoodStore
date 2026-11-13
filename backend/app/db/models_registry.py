# Importa todos los modelos en un solo lugar. SQLAlchemy resuelve las relaciones
# declaradas con strings ("Pedido", "Producto"...) recién cuando todas las clases
# están registradas, así que cualquier punto de entrada (app, seed) importa este módulo.
from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

__all__ = ["Categoria", "DetallePedido", "Pedido", "Producto", "Usuario"]
