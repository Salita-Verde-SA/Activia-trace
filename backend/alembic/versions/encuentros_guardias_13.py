"""encuentros_guardias

Revision ID: encuentros_guardias_13
Revises: comunicaciones_12
Create Date: 2026-06-07 23:54:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'encuentros_guardias_13'
down_revision = 'comunicaciones_12'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # slots_encuentros
    op.create_table('slots_encuentros',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('asignacion_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('materia_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('titulo', sa.String(length=255), nullable=False),
        sa.Column('hora', sa.Time(), nullable=False),
        sa.Column('dia_semana', sa.Enum('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO', name='diasemana'), nullable=True),
        sa.Column('fecha_inicio', sa.Date(), nullable=True),
        sa.Column('cant_semanas', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('fecha_unica', sa.Date(), nullable=True),
        sa.Column('meet_url', sa.String(length=255), nullable=True),
        sa.Column('vig_desde', sa.Date(), nullable=True),
        sa.Column('vig_hasta', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['asignacion_id'], ['asignacion.id'], ),
        sa.ForeignKeyConstraint(['materia_id'], ['materia.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_slots_encuentros_id'), 'slots_encuentros', ['id'], unique=False)
    op.create_index(op.f('ix_slots_encuentros_tenant_id'), 'slots_encuentros', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_slots_encuentros_asignacion_id'), 'slots_encuentros', ['asignacion_id'], unique=False)
    op.create_index(op.f('ix_slots_encuentros_materia_id'), 'slots_encuentros', ['materia_id'], unique=False)

    # instancias_encuentros
    op.create_table('instancias_encuentros',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('slot_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('materia_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('fecha', sa.Date(), nullable=False),
        sa.Column('hora', sa.Time(), nullable=False),
        sa.Column('titulo', sa.String(length=255), nullable=False),
        sa.Column('estado', sa.Enum('PROGRAMADO', 'REALIZADO', 'CANCELADO', name='estadoinstancia'), nullable=False),
        sa.Column('meet_url', sa.String(length=255), nullable=True),
        sa.Column('video_url', sa.String(length=255), nullable=True),
        sa.Column('comentario', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['materia_id'], ['materia.id'], ),
        sa.ForeignKeyConstraint(['slot_id'], ['slots_encuentros.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_instancias_encuentros_id'), 'instancias_encuentros', ['id'], unique=False)
    op.create_index(op.f('ix_instancias_encuentros_tenant_id'), 'instancias_encuentros', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_instancias_encuentros_slot_id'), 'instancias_encuentros', ['slot_id'], unique=False)
    op.create_index(op.f('ix_instancias_encuentros_materia_id'), 'instancias_encuentros', ['materia_id'], unique=False)

    # guardias
    op.create_table('guardias',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('asignacion_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('materia_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('carrera_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('cohorte_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('dia', sa.Enum('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO', name='diasemana_guardia', create_type=False), nullable=False),
        sa.Column('horario', sa.String(length=50), nullable=False),
        sa.Column('estado', sa.Enum('PENDIENTE', 'REALIZADA', 'CANCELADA', name='estadoguardia'), nullable=False),
        sa.Column('comentarios', sa.Text(), nullable=True),
        sa.Column('creada_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['asignacion_id'], ['asignacion.id'], ),
        sa.ForeignKeyConstraint(['carrera_id'], ['carrera.id'], ),
        sa.ForeignKeyConstraint(['cohorte_id'], ['cohorte.id'], ),
        sa.ForeignKeyConstraint(['materia_id'], ['materia.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_guardias_id'), 'guardias', ['id'], unique=False)
    op.create_index(op.f('ix_guardias_tenant_id'), 'guardias', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_guardias_asignacion_id'), 'guardias', ['asignacion_id'], unique=False)
    op.create_index(op.f('ix_guardias_materia_id'), 'guardias', ['materia_id'], unique=False)

def downgrade() -> None:
    op.drop_table('guardias')
    op.drop_table('instancias_encuentros')
    op.drop_table('slots_encuentros')
    sa.Enum(name='diasemana').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='estadoinstancia').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='estadoguardia').drop(op.get_bind(), checkfirst=True)
