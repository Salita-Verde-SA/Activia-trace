"""tareas 16

Revision ID: 16_tareas
Revises: 15_avisos
Create Date: 2026-06-08 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '16_tareas'
down_revision = '15_avisos'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # estado_tarea_enum
    estado_tarea_enum = postgresql.ENUM('PENDIENTE', 'EN_PROGRESO', 'RESUELTA', 'CANCELADA', name='estado_tarea_enum')
    estado_tarea_enum.create(op.get_bind(), checkfirst=True)

    # prioridad_tarea_enum
    prioridad_tarea_enum = postgresql.ENUM('LOW', 'MEDIUM', 'HIGH', name='prioridad_tarea_enum')
    prioridad_tarea_enum.create(op.get_bind(), checkfirst=True)

    # tareas
    op.create_table(
        'tareas',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('titulo', sa.String(), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('prioridad', postgresql.ENUM('LOW', 'MEDIUM', 'HIGH', name='prioridad_tarea_enum', create_type=False), nullable=False),
        sa.Column('estado', postgresql.ENUM('PENDIENTE', 'EN_PROGRESO', 'RESUELTA', 'CANCELADA', name='estado_tarea_enum', create_type=False), nullable=False),
        sa.Column('asignado_a', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('asignado_por', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('contexto_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('fecha_creacion', sa.DateTime(timezone=True), nullable=False),
        sa.Column('fecha_actualizacion', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['asignado_a'], ['usuario.id'], ),
        sa.ForeignKeyConstraint(['asignado_por'], ['usuario.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tareas_tenant_id'), 'tareas', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_tareas_asignado_a'), 'tareas', ['asignado_a'], unique=False)

    # comentarios_tareas
    op.create_table(
        'comentarios_tareas',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tarea_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('usuario_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('texto', sa.Text(), nullable=False),
        sa.Column('fecha_hora', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['tarea_id'], ['tareas.id'], ),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuario.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_comentarios_tareas_tenant_id'), 'comentarios_tareas', ['tenant_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_comentarios_tareas_tenant_id'), table_name='comentarios_tareas')
    op.drop_table('comentarios_tareas')
    op.drop_index(op.f('ix_tareas_asignado_a'), table_name='tareas')
    op.drop_index(op.f('ix_tareas_tenant_id'), table_name='tareas')
    op.drop_table('tareas')
    postgresql.ENUM(name='prioridad_tarea_enum').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name='estado_tarea_enum').drop(op.get_bind(), checkfirst=True)
