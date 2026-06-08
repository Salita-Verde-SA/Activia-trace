import httpx
from typing import Any, Dict, List
import logging

logger = logging.getLogger(__name__)

class MoodleAPIError(Exception):
    """Excepción base para errores de comunicación con Moodle."""
    def __init__(self, message: str, errorcode: str | None = None):
        self.message = message
        self.errorcode = errorcode
        super().__init__(self.message)

class MoodleClient:
    """Cliente para interactuar con los Web Services REST de Moodle."""
    
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.endpoint = f"{self.base_url}/webservice/rest/server.php"

    async def _request(self, wsfunction: str, params: Dict[str, Any] | None = None) -> Any:
        if params is None:
            params = {}
            
        params.update({
            "wstoken": self.token,
            "wsfunction": wsfunction,
            "moodlewsrestformat": "json",
        })

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.endpoint, data=params, timeout=30.0)
                response.raise_for_status()
            except httpx.RequestError as e:
                logger.error(f"Error conectando a Moodle: {e}")
                raise MoodleAPIError(f"Error de conexión con Moodle: {e}")
            except httpx.HTTPStatusError as e:
                logger.error(f"Error HTTP {e.response.status_code} desde Moodle: {e}")
                raise MoodleAPIError(f"Error HTTP desde Moodle: {e.response.status_code}")

            try:
                data = response.json()
            except Exception as e:
                logger.error(f"Error decodificando JSON de Moodle: {e}")
                raise MoodleAPIError("Respuesta de Moodle no es un JSON válido")
            
            # Moodle muchas veces retorna 200 OK pero con un payload de error si algo falla internamente.
            if isinstance(data, dict) and "exception" in data:
                logger.error(f"Excepción de negocio desde Moodle: {data}")
                raise MoodleAPIError(
                    message=data.get("message", "Error desconocido de Moodle"),
                    errorcode=data.get("errorcode")
                )
            
            return data

    async def fetch_padron(self, course_id: int) -> List[Dict[str, Any]]:
        """
        Obtiene la lista de usuarios matriculados en un curso dado usando core_enrol_get_enrolled_users.
        """
        params = {
            "courseid": course_id
        }
        return await self._request("core_enrol_get_enrolled_users", params)
