from flask import Flask, g, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_babel import Babel
# from flask_redis import FlaskRedis
from redis import Redis
from pymongo import MongoClient

from config import Config

from oauthlib.oauth2 import WebApplicationClient

from flask_login import UserMixin

from flask_limiter import Limiter

from bson import ObjectId

# from redis import Redis

# FOr test google authentication
import os
import boto3

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = Flask(__name__)

app.config.from_object(Config)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///db.sqlite3')
app.config['REDIS_URL'] = os.environ.get('REDIS_URL', 'redis://localhost:6379')
app.config['MONGO_URI'] = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/mydatabase')

app.config['GOOGLE_CLIENT_ID'] = os.environ.get('GOOGLE_CLIENT_ID', 'your_google_client_id')
app.config['GOOGLE_CLIENT_SECRET'] = os.environ.get('GOOGLE_CLIENT_SECRET', 'your_google_client_secret')
app.config['GOOGLE_DISCOVERY_URL'] = "https://accounts.google.com/.well-known/openid-configuration"

app.config['SPACES_KEY'] = os.environ.get('SPACES_KEY', 'your_spaces_key')
app.config['SPACES_SECRET'] = os.environ.get('SPACES_SECRET', 'your_spaces_secret')


spaces_session = boto3.session.Session()
spaces_client = spaces_session.client('s3',
                        region_name='sgp1',
                        endpoint_url='https://sgp1.digitaloceanspaces.com',
                        aws_access_key_id=app.config['SPACES_KEY'],
                        aws_secret_access_key=app.config['SPACES_SECRET'])

mongo_client = MongoClient(app.config['MONGO_URI'])
user_db = mongo_client["user"]
feature_db = mongo_client["feature"]
google_client = WebApplicationClient(app.config['GOOGLE_CLIENT_ID'])
db = SQLAlchemy(app)
redis = Redis.from_url(app.config['REDIS_URL'])
migrate = Migrate(app, db)
limiter = Limiter(
    app,
    storage_uri=app.config['REDIS_URL'],
    default_limits=["100 per minute"]
)

from apscheduler.schedulers.background import BackgroundScheduler
scheduler = BackgroundScheduler()

login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.init_app(app)

# from app.models import User

@login_manager.user_loader
def load_user(user_id):
    user_id = ObjectId(user_id)
    user_json = user_db.profile.find_one({'_id': user_id})
    if not user_json:
        return None
    return User(user_json)

class User(UserMixin):
    def __init__(self, user_json):
        # user_json['_id'] = str(user_json.get('_id'))
        self.user_json = user_json

    def get_id(self):
        object_id = self.user_json.get('_id')
        return object_id

    def get_slug(self):
        slug = self.user_json.get('slug')
        return slug

    def get_profile_name(self):
        profile_name = self.user_json.get('profile_name')
        if not profile_name:
            return None
        return str(profile_name)

    def get_profile_image(self):
        profile_image = self.user_json.get('image_url')
        if not profile_image:
            return None
        return str(profile_image)

    def is_authenticated():
        return True

    def is_active():
        return True

    def is_anonymous():
        return True

from app.features.auth import auth as auth_blueprint
app.register_blueprint(auth_blueprint)

from app.features.profile import profile as profile_blueprint
app.register_blueprint(profile_blueprint)

from app.features.main import main as main_blueprint
app.register_blueprint(main_blueprint)

from app.features.prompt_builder import prompt_builder as prompt_builder_blueprint
app.register_blueprint(prompt_builder_blueprint)

from app.features.prompt_collection import prompt_collection as prompt_collection_blueprint
app.register_blueprint(prompt_collection_blueprint)

from app.features.multilingual import multilingual as multilingual_blueprint
app.register_blueprint(multilingual_blueprint)

from app.features.comment import comment as comment_blueprint
app.register_blueprint(comment_blueprint)

babel = Babel(app)


@babel.localeselector
def get_locale():
    if not g.get('lang_code', None):
        g.lang_code = request.accept_languages.best_match(
            app.config['LANGUAGES']) or app.config['LANGUAGES'][0]
    return g.lang_code

@app.route('/')
def index():
    if not g.get('lang_code', None):
        get_locale()
    return redirect(url_for('main.index'))

with app.app_context():

    from app.features.management import add_prompt_category, add_prompt_sub_category, add_prompt_detail_category, add_prompt, destroy_db, create_db, add_prompt_set, add_model_card
    import csv

    # feature_db.prompt_builder.delete_many({})
    # feature_db.prompt_collection.delete_many({})
    # feature_db.engagement.delete_many({})
    # feature_db.comment.delete_many({})
    #
    # user_db.follow.delete_many({})
    # user_db.profile.delete_many({})


from app.features.management import sync_copies
scheduler.add_job(sync_copies, 'interval', minutes=1)
scheduler.start()
