"""Merge heads

Revision ID: 071c08f3e6d7
Revises: e483d139959a, mensajeria_interna_20
Create Date: 2026-06-08 02:58:20.435405

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '071c08f3e6d7'
down_revision: Union[str, Sequence[str], None] = ('e483d139959a', 'mensajeria_interna_20')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
