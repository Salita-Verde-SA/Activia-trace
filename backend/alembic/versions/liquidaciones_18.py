"""liquidaciones_y_honorarios

Revision ID: 18_liquidaciones
Revises: 16_tareas
Create Date: 2026-06-08 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '18_liquidaciones'
down_revision = '16_tareas'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Agregar clave_plus a materia
    op.add_column('materia', sa.Column('clave_plus', sa.String(length=50), nullable=True))

    # Crear enums
    sa.Enum('ABIERTA', 'CERRADA', name='estado_liquidacion_enum').create(op.get_bind())
    sa.Enum('ALUMNO', 'TUTOR', 'PROFESOR', 'COORDINADOR', 'NEXO', 'ADMIN', 'FINANZAS', name='rol_usuario_enum').create(op.get_bind())

    # Crear salarios_base
    op.create_table('salarios_base',
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('rol', postgresql.ENUM('ALUMNO', 'TUTOR', 'PROFESOR', 'COORDINADOR', 'NEXO', 'ADMIN', 'FINANZAS', name='rol_usuario_enum', create_type=False), nullable=False),
        sa.Column('monto', sa.Float(), nullable=False),
        sa.Column('fecha_desde', sa.Date(), nullable=False),
        sa.Column('fecha_hasta', sa.Date(), nullable=True),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenant.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_salarios_base_tenant_id'), 'salarios_base', ['tenant_id'], unique=False)

    # Crear salarios_plus
    op.create_table('salarios_plus',
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('clave_plus', sa.String(length=50), nullable=False),
        sa.Column('rol', postgresql.ENUM('ALUMNO', 'TUTOR', 'PROFESOR', 'COORDINADOR', 'NEXO', 'ADMIN', 'FINANZAS', name='rol_usuario_enum', create_type=False), nullable=False),
        sa.Column('monto', sa.Float(), nullable=False),
        sa.Column('fecha_desde', sa.Date(), nullable=False),
        sa.Column('fecha_hasta', sa.Date(), nullable=True),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenant.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_salarios_plus_tenant_id'), 'salarios_plus', ['tenant_id'], unique=False)

    # Crear facturas
    op.create_table('facturas',
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('usuario_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('periodo_mes', sa.Integer(), nullable=False),
        sa.Column('periodo_anio', sa.Integer(), nullable=False),
        sa.Column('monto', sa.Float(), nullable=False),
        sa.Column('detalle', sa.String(), nullable=True),
        sa.Column('comprobante_url', sa.String(), nullable=True),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenant.id'], ),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuario.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_facturas_tenant_id'), 'facturas', ['tenant_id'], unique=False)

    # Crear liquidaciones
    op.create_table('liquidaciones',
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('usuario_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('periodo_mes', sa.Integer(), nullable=False),
        sa.Column('periodo_anio', sa.Integer(), nullable=False),
        sa.Column('monto_base', sa.Float(), nullable=False),
        sa.Column('monto_plus', sa.Float(), nullable=False),
        sa.Column('monto_total', sa.Float(), nullable=False),
        sa.Column('es_nexo', sa.Boolean(), nullable=False),
        sa.Column('excluido_por_factura', sa.Boolean(), nullable=False),
        sa.Column('estado', postgresql.ENUM('ABIERTA', 'CERRADA', name='estado_liquidacion_enum', create_type=False), nullable=False),
        sa.Column('detalle_calculo', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenant.id'], ),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuario.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_liquidaciones_tenant_id'), 'liquidaciones', ['tenant_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_liquidaciones_tenant_id'), table_name='liquidaciones')
    op.drop_table('liquidaciones')
    
    op.drop_index(op.f('ix_facturas_tenant_id'), table_name='facturas')
    op.drop_table('facturas')
    
    op.drop_index(op.f('ix_salarios_plus_tenant_id'), table_name='salarios_plus')
    op.drop_table('salarios_plus')
    
    op.drop_index(op.f('ix_salarios_base_tenant_id'), table_name='salarios_base')
    op.drop_table('salarios_base')
    
    sa.Enum('ABIERTA', 'CERRADA', name='estado_liquidacion_enum').drop(op.get_bind())
    
    op.drop_column('materia', 'clave_plus')
