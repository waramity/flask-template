"""empty message

Revision ID: f3ae2833350d
Revises: 956d237cd3fb
Create Date: 2023-01-13 03:15:49.824022

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f3ae2833350d'
down_revision = '956d237cd3fb'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('prompt', sa.Column('prompt_sub_category_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'prompt', 'prompt_sub_category', ['prompt_sub_category_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'prompt', type_='foreignkey')
    op.drop_column('prompt', 'prompt_sub_category_id')
    # ### end Alembic commands ###