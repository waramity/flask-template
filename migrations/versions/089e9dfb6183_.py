"""empty message

Revision ID: 089e9dfb6183
Revises: 328cc480f939
Create Date: 2023-01-13 01:12:02.650780

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '089e9dfb6183'
down_revision = '328cc480f939'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('email', sa.VARCHAR(length=100), nullable=True),
    sa.Column('password', sa.VARCHAR(length=100), nullable=True),
    sa.Column('name', sa.VARCHAR(length=1000), nullable=True),
    sa.Column('username', sa.VARCHAR(length=100), nullable=True),
    sa.Column('display_name', sa.VARCHAR(length=1000), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    # ### end Alembic commands ###
