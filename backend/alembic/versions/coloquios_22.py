"""Add candidato coloquio

Revision ID: coloquios_22
Revises: coloquios_21
Create Date: 2026-06-15 20:28:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'coloquios_22'
down_revision = 'coloquios_21'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # CandidatoColoquio
    op.create_table('candidato_coloquio',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('convocatoria_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('usuario_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('nota_previa', sa.String(length=50), nullable=True),
        sa.Column('habilitado', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['convocatoria_id'], ['convocatoria_coloquio.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenant.id'], ),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuario.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_candidato_coloquio_convocatoria_id'), 'candidato_coloquio', ['convocatoria_id'], unique=False)
    op.create_index(op.f('ix_candidato_coloquio_tenant_id'), 'candidato_coloquio', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_candidato_coloquio_usuario_id'), 'candidato_coloquio', ['usuario_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_candidato_coloquio_usuario_id'), table_name='candidato_coloquio')
    op.drop_index(op.f('ix_candidato_coloquio_tenant_id'), table_name='candidato_coloquio')
    op.drop_index(op.f('ix_candidato_coloquio_convocatoria_id'), table_name='candidato_coloquio')
    op.drop_table('candidato_coloquio')
