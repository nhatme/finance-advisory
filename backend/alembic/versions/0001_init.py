"""init products table

Revision ID: 0001_init
Revises:
Create Date: 2026-06-04 06:00:00
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001_init"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("provider", sa.String(128), nullable=False, index=True),
        sa.Column("type", sa.String(32), nullable=False, index=True),
        sa.Column("risk_level", sa.String(16), nullable=False, index=True),
        sa.Column("interest_rate_pct", sa.Float(), nullable=True),
        sa.Column("expected_return_pct", sa.Float(), nullable=True),
        sa.Column("annual_fee_vnd", sa.Float(), nullable=True),
        sa.Column("min_amount_vnd", sa.Float(), nullable=True),
        sa.Column("min_income_vnd", sa.Float(), nullable=True),
        sa.Column("min_age", sa.Integer(), nullable=False, server_default="18"),
        sa.Column("term_months", sa.Integer(), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("source_url", sa.String(512), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("products")
