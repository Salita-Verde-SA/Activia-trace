"""Seed permiso estructura:gestionar para ADMIN y COORDINADOR

Revision ID: estructura_seed_permisos
Revises: turno_coloquio_soft_delete
Create Date: 2026-06-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'estructura_seed_permisos'
down_revision = 'turno_coloquio_soft_delete'
branch_labels = None
depends_on = None

PERMISO = 'estructura:gestionar'
ROLES = ('ADMIN', 'COORDINADOR')


def upgrade() -> None:
    conn = op.get_bind()

    conn.execute(sa.text("""
        INSERT INTO permiso (id, nombre, created_at, updated_at)
        VALUES (gen_random_uuid(), :nombre, now(), now())
        ON CONFLICT (nombre) DO NOTHING
    """), {"nombre": PERMISO})

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

    conn.execute(sa.text("""
        DELETE FROM rol_permiso
        WHERE permiso_id = (SELECT id FROM permiso WHERE nombre = :permiso)
    """), {"permiso": PERMISO})

    conn.execute(sa.text("""
        DELETE FROM permiso WHERE nombre = :permiso
    """), {"permiso": PERMISO})
