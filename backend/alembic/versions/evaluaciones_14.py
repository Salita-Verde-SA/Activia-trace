"""evaluaciones 14

Revision ID: 14_evaluaciones
Revises: 13_encuentros
Create Date: 2026-06-08 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '14_evaluaciones'
down_revision = 'encuentros_guardias_13'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # tipo_evaluacion_enum
    tipo_evaluacion_enum = postgresql.ENUM('PARCIAL', 'TP', 'COLOQUIO', 'RECUPERATORIO', name='tipo_evaluacion_enum')
    tipo_evaluacion_enum.create(op.get_bind(), checkfirst=True)

    # estado_reserva_enum
    estado_reserva_enum = postgresql.ENUM('ACTIVA', 'CANCELADA', name='estado_reserva_enum')
    estado_reserva_enum.create(op.get_bind(), checkfirst=True)

    # evaluaciones
    op.create_table(
        'evaluaciones',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('materia_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('cohorte_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tipo', postgresql.ENUM('PARCIAL', 'TP', 'COLOQUIO', 'RECUPERATORIO', name='tipo_evaluacion_enum', create_type=False), nullable=False),
        sa.Column('instancia', sa.String(), nullable=False),
        sa.Column('dias_disponibles', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_evaluaciones_tenant_id'), 'evaluaciones', ['tenant_id'], unique=False)

    # reservas_evaluaciones
    op.create_table(
        'reservas_evaluaciones',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('evaluacion_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('alumno_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('fecha_hora', sa.DateTime(), nullable=False),
        sa.Column('estado', postgresql.ENUM('ACTIVA', 'CANCELADA', name='estado_reserva_enum', create_type=False), nullable=False),
        sa.ForeignKeyConstraint(['alumno_id'], ['usuario.id'], ),
        sa.ForeignKeyConstraint(['evaluacion_id'], ['evaluaciones.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reservas_evaluaciones_tenant_id'), 'reservas_evaluaciones', ['tenant_id'], unique=False)

    # resultados_evaluaciones
    op.create_table(
        'resultados_evaluaciones',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('evaluacion_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('alumno_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('nota_final', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['alumno_id'], ['usuario.id'], ),
        sa.ForeignKeyConstraint(['evaluacion_id'], ['evaluaciones.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resultados_evaluaciones_tenant_id'), 'resultados_evaluaciones', ['tenant_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_resultados_evaluaciones_tenant_id'), table_name='resultados_evaluaciones')
    op.drop_table('resultados_evaluaciones')
    op.drop_index(op.f('ix_reservas_evaluaciones_tenant_id'), table_name='reservas_evaluaciones')
    op.drop_table('reservas_evaluaciones')
    op.drop_index(op.f('ix_evaluaciones_tenant_id'), table_name='evaluaciones')
    op.drop_table('evaluaciones')
    postgresql.ENUM(name='estado_reserva_enum').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name='tipo_evaluacion_enum').drop(op.get_bind(), checkfirst=True)
