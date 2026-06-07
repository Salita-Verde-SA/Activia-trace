from repositories.base import BaseRepository
from repositories.session import SessionRepository
from repositories.usuario import UsuarioRepository
from repositories.asignacion import AsignacionRepository
from repositories.estructura import CarreraRepository, CohorteRepository, MateriaRepository

__all__ = [
    "BaseRepository",
    "SessionRepository",
    "UsuarioRepository",
    "AsignacionRepository",
    "CarreraRepository",
    "CohorteRepository",
    "MateriaRepository",
]
