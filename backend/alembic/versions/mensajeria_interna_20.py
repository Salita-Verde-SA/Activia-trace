"""Add mensajeria interna

Revision ID: mensajeria_interna_20
Revises: liquidaciones_18
Create Date: 2026-06-08 01:21:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'mensajeria_interna_20'
down_revision = 'liquidaciones_18'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # hilo_mensaje_interno
    op.create_table('hilo_mensaje_interno',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('asunto', sa.String(length=255), nullable=True),
        sa.Column('creado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['creado_por_id'], ['usuario.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_hilo_mensaje_interno_tenant_id'), 'hilo_mensaje_interno', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_hilo_mensaje_interno_updated_at'), 'hilo_mensaje_interno', ['updated_at'], unique=False)

    # hilo_usuario
    op.create_table('hilo_usuario',
        sa.Column('hilo_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('usuario_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['hilo_id'], ['hilo_mensaje_interno.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuario.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('hilo_id', 'usuario_id')
    )

    # mensaje_interno
    op.create_table('mensaje_interno',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('hilo_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('emisor_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('contenido', sa.String(), nullable=False),
        sa.Column('leido', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['emisor_id'], ['usuario.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['hilo_id'], ['hilo_mensaje_interno.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mensaje_interno_tenant_id'), 'mensaje_interno', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_mensaje_interno_hilo_id'), 'mensaje_interno', ['hilo_id'], unique=False)
    op.create_index(op.f('ix_mensaje_interno_created_at'), 'mensaje_interno', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_mensaje_interno_created_at'), table_name='mensaje_interno')
    op.drop_index(op.f('ix_mensaje_interno_hilo_id'), table_name='mensaje_interno')
    op.drop_index(op.f('ix_mensaje_interno_tenant_id'), table_name='mensaje_interno')
    op.drop_table('mensaje_interno')

    op.drop_table('hilo_usuario')

    op.drop_index(op.f('ix_hilo_mensaje_interno_updated_at'), table_name='hilo_mensaje_interno')
    op.drop_index(op.f('ix_hilo_mensaje_interno_tenant_id'), table_name='hilo_mensaje_interno')
    op.drop_table('hilo_mensaje_interno')
