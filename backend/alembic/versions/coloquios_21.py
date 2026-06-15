"""Add coloquios models

Revision ID: coloquios_21
Revises: mensajeria_interna_20
Create Date: 2026-06-15 20:25:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'coloquios_21'
down_revision = 'mensajeria_interna_20'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Enum types
    estado_convocatoria_enum = postgresql.ENUM('Borrador', 'Publicada', 'Cerrada', 'Cancelada', name='estadoconvocatoria', create_type=False)
    estado_convocatoria_enum.create(op.get_bind(), checkfirst=True)
    
    estado_turno_enum = postgresql.ENUM('Activo', 'Cancelado', name='estadoturno', create_type=False)
    estado_turno_enum.create(op.get_bind(), checkfirst=True)

    # ConvocatoriaColoquio
    op.create_table('convocatoria_coloquio',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('materia_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=False),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('fecha_apertura_reservas', sa.DateTime(timezone=True), nullable=True),
        sa.Column('fecha_cierre_reservas', sa.DateTime(timezone=True), nullable=True),
        sa.Column('estado', estado_convocatoria_enum, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['materia_id'], ['materia.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenant.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_convocatoria_coloquio_materia_id'), 'convocatoria_coloquio', ['materia_id'], unique=False)
    op.create_index(op.f('ix_convocatoria_coloquio_tenant_id'), 'convocatoria_coloquio', ['tenant_id'], unique=False)

    # TurnoColoquio
    op.create_table('turno_coloquio',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('convocatoria_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('fecha_hora_inicio', sa.DateTime(timezone=True), nullable=False),
        sa.Column('fecha_hora_fin', sa.DateTime(timezone=True), nullable=False),
        sa.Column('cupo_maximo', sa.Integer(), nullable=False),
        sa.Column('cupos_ocupados', sa.Integer(), nullable=False),
        sa.Column('estado', estado_turno_enum, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['convocatoria_id'], ['convocatoria_coloquio.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenant.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_turno_coloquio_convocatoria_id'), 'turno_coloquio', ['convocatoria_id'], unique=False)
    op.create_index(op.f('ix_turno_coloquio_tenant_id'), 'turno_coloquio', ['tenant_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_turno_coloquio_tenant_id'), table_name='turno_coloquio')
    op.drop_index(op.f('ix_turno_coloquio_convocatoria_id'), table_name='turno_coloquio')
    op.drop_table('turno_coloquio')
    
    op.drop_index(op.f('ix_convocatoria_coloquio_tenant_id'), table_name='convocatoria_coloquio')
    op.drop_index(op.f('ix_convocatoria_coloquio_materia_id'), table_name='convocatoria_coloquio')
    op.drop_table('convocatoria_coloquio')

    postgresql.ENUM(name='estadoturno').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name='estadoconvocatoria').drop(op.get_bind(), checkfirst=True)
