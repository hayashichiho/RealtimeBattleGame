from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'e01ff2196a5c'
down_revision = '1579ec593a11'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('player', schema=None) as batch_op:
        batch_op.add_column(sa.Column('player_id', sa.String(length=10), nullable=False))
        batch_op.create_unique_constraint('uq_player_player_id', ['player_id'])  # 制約に名前を指定

def downgrade():
    with op.batch_alter_table('player', schema=None) as batch_op:
        batch_op.drop_constraint('uq_player_player_id', type_='unique')  # 制約の名前を指定して削除
        batch_op.drop_column('player_id')
