"""Unicidad de calificacion viva por (tenant, entrada_padron, actividad)

Sanea duplicados vivos (soft delete, conservando la fila mas reciente por grupo) y
crea un indice unico parcial sobre las filas vivas (deleted_at IS NULL).

Revision ID: calificacion_uq_actividad_viva
Revises: comunicacion_seed_permisos
Create Date: 2026-06-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'calificacion_uq_actividad_viva'
down_revision = 'comunicacion_seed_permisos'
branch_labels = None
depends_on = None

INDEX_NAME = 'uq_calificacion_entrada_actividad_viva'


def upgrade() -> None:
    conn = op.get_bind()

    # 1. Saneo: soft-delete de duplicados vivos, conservando la fila mas reciente
    #    por grupo (tenant_id, entrada_padron_id, actividad_nombre).
    conn.execute(sa.text("""
        WITH ranked AS (
            SELECT id,
                   row_number() OVER (
                       PARTITION BY tenant_id, entrada_padron_id, actividad_nombre
                       ORDER BY created_at DESC, id DESC
                   ) AS rn
            FROM calificacion
            WHERE deleted_at IS NULL
        )
        UPDATE calificacion AS c
        SET deleted_at = now()
        FROM ranked
        WHERE c.id = ranked.id
          AND ranked.rn > 1
    """))

    # 2. Indice unico parcial: una sola calificacion viva por alumno y actividad.
    op.create_index(
        INDEX_NAME,
        'calificacion',
        ['tenant_id', 'entrada_padron_id', 'actividad_nombre'],
        unique=True,
        postgresql_where=sa.text('deleted_at IS NULL'),
    )


def downgrade() -> None:
    # Elimina el indice. NO resucita las filas soft-deleted por el saneo
    # (siguen recuperables manualmente via deleted_at).
    op.drop_index(INDEX_NAME, table_name='calificacion')
