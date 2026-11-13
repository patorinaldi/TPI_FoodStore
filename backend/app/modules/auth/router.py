from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import CurrentUser
from app.modules.auth.schemas import MensajeResponse
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

COOKIE_NAME = "access_token"

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: AuthServiceDep) -> UserPublic:
    try:
        return service.registrar(data)
    except UsuarioDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/token", response_model=MensajeResponse)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: AuthServiceDep,
) -> MensajeResponse:
    try:
        token = service.autenticar(form.username, form.password)
    except CredencialesInvalidas as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except CuentaDesactivada as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # en producción con HTTPS va en True
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return MensajeResponse(message="Login exitoso")


@router.post("/logout", response_model=MensajeResponse)
def logout(response: Response) -> MensajeResponse:
    response.delete_cookie(key=COOKIE_NAME, path="/", httponly=True, samesite="lax")
    return MensajeResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: CurrentUser) -> UserPublic:
    return usuario