"""Avisos dirigidos a un alumno: alcance USUARIO + avisos.usuario_id + permiso avisos:contactar_alumno

Revision ID: avisos_dirigidos_usuario
Revises: calificacion_uq_actividad_viva
Create Date: 2026-06-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'avisos_dirigidos_usuario'
down_revision = 'calificacion_uq_actividad_viva'
branch_labels = None
depends_on = None

PERMISO = 'avisos:contactar_alumno'
ROLES = ('PROFESOR', 'TUTOR', 'COORDINADOR', 'ADMIN')


def upgrade() -> None:
    # 1. Nuevo valor de enum. ALTER TYPE ... ADD VALUE no puede correr dentro de
    #    una transacción → autocommit_block.
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE alcance_aviso_enum ADD VALUE IF NOT EXISTS 'USUARIO'")

    # 2. Columna de destino para alcance USUARIO.
    op.add_column('avisos', sa.Column('usuario_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True))
    op.create_index('ix_avisos_usuario_id', 'avisos', ['usuario_id'])
    op.create_foreign_key('fk_avisos_usuario_id_usuario', 'avisos', 'usuario', ['usuario_id'], ['id'])

    # 3. Seed del permiso fino para contactar alumno en riesgo.
    conn = op.get_bind()
    conn.execute(sa.text("""
        INSERT INTO permiso (id, nombre, created_at, updated_at)
        VALUES (gen_random_uuid(), :nombre, now(), now())
        ON CONFLICT (nombre) DO NOTHING
    """), {"nombre": PERMISO})
    for rol_nombre in ROLES:
        conn.execute(sa.text("""
            INSERT INTO rol_permiso (id, rol_id, permiso_id, tenant_id, created_at, updated_at)
            SELECT gen_random_uuid(), r.id, p.id, r.tenant_id, now(), now()
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
    conn.execute(sa.text("DELETE FROM permiso WHERE nombre = :permiso"), {"permiso": PERMISO})

    op.drop_constraint('fk_avisos_usuario_id_usuario', 'avisos', type_='foreignkey')
    op.drop_index('ix_avisos_usuario_id', table_name='avisos')
    op.drop_column('avisos', 'usuario_id')
    # El valor de enum 'USUARIO' queda inerte (PG no soporta DROP VALUE simple).
