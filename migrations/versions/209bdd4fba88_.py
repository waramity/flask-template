"""empty message

Revision ID: 209bdd4fba88
Revises: 6c1b995c5ed4
Create Date: 2023-01-13 03:15:05.856235

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '209bdd4fba88'
down_revision = '6c1b995c5ed4'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_foreign_key(None, 'prompt', 'prompt_sub_category', ['prompt_sub_category_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'prompt', type_='foreignkey')
    # ### end Alembic commands ###
