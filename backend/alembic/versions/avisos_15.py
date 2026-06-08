"""avisos 15

Revision ID: 15_avisos
Revises: 14_evaluaciones
Create Date: 2026-06-08 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '15_avisos'
down_revision = '14_evaluaciones'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # severidad_aviso_enum
    severidad_aviso_enum = postgresql.ENUM('INFO', 'WARNING', 'CRITICAL', name='severidad_aviso_enum')
    severidad_aviso_enum.create(op.get_bind(), checkfirst=True)

    # alcance_aviso_enum
    alcance_aviso_enum = postgresql.ENUM('GLOBAL', 'MATERIA', 'COHORTE', 'ROL', name='alcance_aviso_enum')
    alcance_aviso_enum.create(op.get_bind(), checkfirst=True)

    # avisos
    op.create_table(
        'avisos',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('titulo', sa.String(), nullable=False),
        sa.Column('cuerpo', sa.Text(), nullable=False),
        sa.Column('severidad', postgresql.ENUM('INFO', 'WARNING', 'CRITICAL', name='severidad_aviso_enum', create_type=False), nullable=False),
        sa.Column('fecha_inicio', sa.DateTime(timezone=True), nullable=False),
        sa.Column('fecha_fin', sa.DateTime(timezone=True), nullable=True),
        sa.Column('requiere_ack', sa.Boolean(), nullable=False),
        sa.Column('alcance', postgresql.ENUM('GLOBAL', 'MATERIA', 'COHORTE', 'ROL', name='alcance_aviso_enum', create_type=False), nullable=False),
        sa.Column('materia_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('cohorte_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('rol_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_avisos_tenant_id'), 'avisos', ['tenant_id'], unique=False)

    # acknowledgments_avisos
    op.create_table(
        'acknowledgments_avisos',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('aviso_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('usuario_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('fecha_hora', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['aviso_id'], ['avisos.id'], ),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_acknowledgments_avisos_tenant_id'), 'acknowledgments_avisos', ['tenant_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_acknowledgments_avisos_tenant_id'), table_name='acknowledgments_avisos')
    op.drop_table('acknowledgments_avisos')
    op.drop_index(op.f('ix_avisos_tenant_id'), table_name='avisos')
    op.drop_table('avisos')
    postgresql.ENUM(name='alcance_aviso_enum').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name='severidad_aviso_enum').drop(op.get_bind(), checkfirst=True)
