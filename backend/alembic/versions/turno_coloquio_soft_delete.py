"""Add deleted_at to turno_coloquio (soft delete)

Revision ID: turno_coloquio_soft_delete
Revises: coloquios_seed_permisos
Create Date: 2026-06-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'turno_coloquio_soft_delete'
down_revision = 'coloquios_seed_permisos'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('turno_coloquio',
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('turno_coloquio', 'deleted_at')
