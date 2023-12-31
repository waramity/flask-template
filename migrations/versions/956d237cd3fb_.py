"""empty message

Revision ID: 956d237cd3fb
Revises: 209bdd4fba88
Create Date: 2023-01-13 03:15:33.416979

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '956d237cd3fb'
down_revision = '209bdd4fba88'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('prompt', 'prompt_sub_category_id')
    op.drop_constraint(None, 'prompt_sub_category', type_='foreignkey')
    op.drop_column('prompt_sub_category', 'prompt_category')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('prompt_sub_category', sa.Column('prompt_category', sa.INTEGER(), nullable=True))
    op.create_foreign_key(None, 'prompt_sub_category', 'prompt_category', ['prompt_category'], ['id'])
    op.add_column('prompt', sa.Column('prompt_sub_category_id', sa.INTEGER(), nullable=True))
    # ### end Alembic commands ###
