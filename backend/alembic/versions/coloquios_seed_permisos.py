"""Seed permiso evaluacion:gestionar para ADMIN y COORDINADOR

Revision ID: coloquios_seed_permisos
Revises: coloquios_23
Create Date: 2026-06-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'coloquios_seed_permisos'
down_revision = ('c270cd264cf9', 'coloquios_23')
branch_labels = None
depends_on = None

PERMISO = 'evaluacion:gestionar'
ROLES = ('ADMIN', 'COORDINADOR')


def upgrade() -> None:
    conn = op.get_bind()

    # Insertar permiso si no existe
    conn.execute(sa.text("""
        INSERT INTO permiso (id, nombre, created_at, updated_at)
        VALUES (gen_random_uuid(), :nombre, now(), now())
        ON CONFLICT (nombre) DO NOTHING
    """), {"nombre": PERMISO})

    # Asignar permiso a los roles indicados (para todos los tenants que los tengan)
    for rol_nombre in ROLES:
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
        """), {"rol_nombre": rol_nombre, "permiso": PERMISO})


def downgrade() -> None:
    conn = op.get_bind()

    # Quitar asignaciones
    conn.execute(sa.text("""
        DELETE FROM rol_permiso
        WHERE permiso_id = (SELECT id FROM permiso WHERE nombre = :permiso)
    """), {"permiso": PERMISO})

    # Quitar permiso
    conn.execute(sa.text("""
        DELETE FROM permiso WHERE nombre = :permiso
    """), {"permiso": PERMISO})
