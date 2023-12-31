"""empty message

Revision ID: 3b1f51de1a95
Revises: 
Create Date: 2022-08-02 23:50:40.412295

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3b1f51de1a95'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('username', sa.String(length=100), nullable=True))
    op.add_column('user', sa.Column('display_name', sa.String(length=1000), nullable=True))
    op.create_unique_constraint(None, 'user', ['username'])
    op.drop_column('user', 'name')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('name', sa.VARCHAR(length=1000), nullable=True))
    op.drop_constraint(None, 'user', type_='unique')
    op.drop_column('user', 'display_name')
    op.drop_column('user', 'username')
    # ### end Alembic commands ###
