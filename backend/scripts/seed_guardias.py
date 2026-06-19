"""
Seed de guardias de prueba.
Uso: python backend/scripts/seed_guardias.py
Requiere la API corriendo en localhost:47121.
"""
import httpx
import sys

BASE = "http://localhost:47121"
TUTOR_EMAIL = "tutor@activia.edu.ar"
PASSWORD = "password123"

GUARDIAS = [
    {"dia": "Lunes",     "horario": "08:00–08:45", "comentarios": "Sin novedades"},
    {"dia": "Martes",    "horario": "10:00–10:45", "comentarios": None},
    {"dia": "Miércoles", "horario": "14:00–14:45", "comentarios": "Consulta de parcial"},
    {"dia": "Jueves",    "horario": "09:00–09:45", "comentarios": None},
    {"dia": "Viernes",   "horario": "16:00–16:45", "comentarios": "Repaso TP final"},
]


def log(msg: str):
    print(msg, flush=True)


def main():
    with httpx.Client(base_url=BASE, timeout=15) as client:
        # 1. Login
        log("=> Login como tutor...")
        resp = client.post("/api/auth/login", json={"email": TUTOR_EMAIL, "password": PASSWORD})
        if resp.status_code != 200:
            log(f"ERR Login fallido ({resp.status_code}): {resp.text}")
            sys.exit(1)
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        log("OK Token obtenido")

        # 2. Obtener asignaciones con UUIDs
        log("=> Obteniendo asignaciones...")
        resp = client.get("/api/equipos/mis-equipos", headers=headers)
        if resp.status_code != 200:
            log(f"ERR mis-equipos fallido ({resp.status_code}): {resp.text}")
            sys.exit(1)
        asignaciones = resp.json()
        if not asignaciones:
            log("ERR No hay asignaciones para este tutor. Corré seed_rbac.py primero.")
            sys.exit(1)

        # 3. Obtener nombres para mostrar
        resp2 = client.get("/api/equipos/mis-equipos-detalle", headers=headers)
        detalles = resp2.json() if resp2.status_code == 200 else []
        detalle_map = {d["asignacion_id"]: d for d in detalles}

        asig = asignaciones[0]
        asig_id = asig["id"]
        materia_id = asig.get("materia_id")
        carrera_id = asig.get("carrera_id")
        cohorte_id = asig.get("cohorte_id")

        det = detalle_map.get(asig_id, {})
        materia_nombre = det.get("materia_nombre", "Sin nombre")
        log(f"OK Usando asignación: {materia_nombre} (id={asig_id[:8]}…)")

        if not materia_id:
            log("ERR La asignación no tiene materia_id. No se puede registrar guardia.")
            sys.exit(1)

        # 4. Registrar guardias
        log(f"=> Registrando {len(GUARDIAS)} guardias...")
        ok = 0
        for g in GUARDIAS:
            payload = {
                "materia_id": materia_id,
                "carrera_id": carrera_id,
                "cohorte_id": cohorte_id,
                "dia": g["dia"],
                "horario": g["horario"],
                "comentarios": g["comentarios"],
            }
            resp = client.post(
                f"/api/v1/guardias/asignaciones/{asig_id}/guardias",
                json=payload,
                headers=headers,
            )
            if resp.status_code in (200, 201):
                log(f"  OK {g['dia']} {g['horario']}")
                ok += 1
            else:
                log(f"  ERR {g['dia']} {g['horario']} => {resp.status_code}: {resp.text[:120]}")

        log(f"\nOK {ok}/{len(GUARDIAS)} guardias creadas")
        log("  => Ahora entrá como ADMIN/COORDINADOR a /admin/guardias, buscá por fecha y exportá el CSV.")


if __name__ == "__main__":
    main()
