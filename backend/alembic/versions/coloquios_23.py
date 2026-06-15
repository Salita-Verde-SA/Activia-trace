"""Add reserva coloquio

Revision ID: coloquios_23
Revises: coloquios_22
Create Date: 2026-06-15 20:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'coloquios_23'
down_revision = 'coloquios_22'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Enum type
    estado_reserva_enum = postgresql.ENUM('Reservada', 'Cancelada', 'Asistió', 'No Asistió', name='estadoreserva', create_type=False)
    estado_reserva_enum.create(op.get_bind(), checkfirst=True)

    # ReservaColoquio
    op.create_table('reserva_coloquio',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('convocatoria_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('turno_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('usuario_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('estado', estado_reserva_enum, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['convocatoria_id'], ['convocatoria_coloquio.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenant.id'], ),
        sa.ForeignKeyConstraint(['turno_id'], ['turno_coloquio.id'], ),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuario.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'convocatoria_id', 'usuario_id', name='uq_reserva_coloquio_usuario')
    )
    op.create_index(op.f('ix_reserva_coloquio_convocatoria_id'), 'reserva_coloquio', ['convocatoria_id'], unique=False)
    op.create_index(op.f('ix_reserva_coloquio_tenant_id'), 'reserva_coloquio', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_reserva_coloquio_turno_id'), 'reserva_coloquio', ['turno_id'], unique=False)
    op.create_index(op.f('ix_reserva_coloquio_usuario_id'), 'reserva_coloquio', ['usuario_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_reserva_coloquio_usuario_id'), table_name='reserva_coloquio')
    op.drop_index(op.f('ix_reserva_coloquio_turno_id'), table_name='reserva_coloquio')
    op.drop_index(op.f('ix_reserva_coloquio_tenant_id'), table_name='reserva_coloquio')
    op.drop_index(op.f('ix_reserva_coloquio_convocatoria_id'), table_name='reserva_coloquio')
    op.drop_table('reserva_coloquio')

    postgresql.ENUM(name='estadoreserva').drop(op.get_bind(), checkfirst=True)
