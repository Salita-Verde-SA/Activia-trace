"""Seed permisos comunicacion:escribir y comunicacion:leer para PROFESOR y COORDINADOR

Revision ID: comunicacion_seed_permisos
Revises: coloquios_seed_permiso_reservar
Create Date: 2026-06-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'comunicacion_seed_permisos'
down_revision = 'coloquios_seed_permiso_reservar'
branch_labels = None
depends_on = None

PERMISOS_ROLES = {
    'comunicacion:escribir': ('PROFESOR', 'COORDINADOR', 'ADMIN'),
    'comunicacion:leer': ('PROFESOR', 'TUTOR', 'COORDINADOR', 'ADMIN'),
    'comunicacion:aprobar': ('COORDINADOR', 'ADMIN'),
}


def upgrade() -> None:
    conn = op.get_bind()

    for permiso, roles in PERMISOS_ROLES.items():
        conn.execute(sa.text("""
            INSERT INTO permiso (id, nombre, created_at, updated_at)
            VALUES (gen_random_uuid(), :nombre, now(), now())
            ON CONFLICT (nombre) DO NOTHING
        """), {"nombre": permiso})

        for rol_nombre in roles:
            conn.execute(sa.text("""
                INSERT INTO rol_permiso (id, rol_id, permiso_id, tenant_id, created_at, updated_at)
                SELECT
                    gen_random_uuid(),
                    r.id,
                    p.id,
                    r.tenant_id,
                    now(),
                    now()
                FROM rol r
                CROSS JOIN permiso p
                WHERE r.nombre = :rol_nombre
                  AND p.nombre = :permiso
                  AND r.deleted_at IS NULL
                ON CONFLICT (rol_id, permiso_id) DO NOTHING
            """), {"rol_nombre": rol_nombre, "permiso": permiso})


def downgrade() -> None:
    conn = op.get_bind()

    for permiso in PERMISOS_ROLES:
        conn.execute(sa.text("""
            DELETE FROM rol_permiso
            WHERE permiso_id = (SELECT id FROM permiso WHERE nombre = :permiso)
        """), {"permiso": permiso})

        conn.execute(sa.text("""
            DELETE FROM permiso WHERE nombre = :permiso
        """), {"permiso": permiso})
