
from flask import Blueprint, render_template, redirect, url_for, request, flash, g, current_app, jsonify, make_response
from flask_babel import _
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from app import db, app, google_client, user_db, spaces_client, User
from werkzeug.datastructures import CombinedMultiDict

import requests
import json
import uuid
import datetime, pytz
import time

import base64
from PIL import Image
import io

import re

auth = Blueprint('auth', __name__, template_folder='templates', url_prefix='/<lang_code>')

# Multiligual Start
@auth.url_defaults
def add_language_code(endpoint, values):
    values.setdefault('lang_code', g.lang_code)

@auth.url_value_preprocessor
def pull_lang_code(endpoint, values):
    g.lang_code = values.pop('lang_code')

@auth.before_request
def before_request():
    if g.lang_code not in current_app.config['LANGUAGES']:
        adapter = app.url_map.bind('')
        try:
            endpoint, args = adapter.match(
                '/en' + request.full_path.rstrip('/ ?'))
            return redirect(url_for(endpoint, **args), 301)
        except:
            abort(404)

    dfl = request.url_rule.defaults
    if 'lang_code' in dfl:
        if dfl['lang_code'] != request.full_path.split('/')[1]:
            abort(404)
# Multiligual End

# Function Start
# Function End

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))

def get_google_provider_cfg():
    return requests.get(app.config['GOOGLE_DISCOVERY_URL']).json()

@auth.route("/google-auth")
def google_auth():
    # Find out what URL to hit for Google login
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    # Use library to construct the request for Google login and provide
    # scopes that let you retrieve user's profile from Google
    request_uri = google_client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email"],
    )
    return redirect(request_uri)

@auth.route("/google-auth/callback")
def google_auth_callback():
    code = request.args.get("code")

    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]

    token_url, headers, body = google_client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(app.config['GOOGLE_CLIENT_ID'], app.config['GOOGLE_CLIENT_SECRET']),
    )

    google_client.parse_request_body_response(json.dumps(token_response.json()))

    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = google_client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)

    if userinfo_response.json().get("email_verified"):
        social_auth_id = userinfo_response.json()["sub"]
    else:
        return "User email not available or not verified by Google.", 400

    user = user_db.profile.find_one({'social_auth.social_auth_id': social_auth_id})

    if not user:

        slug = uuid.uuid4().hex[:11]
        while user_db.profile.find_one({'slug': slug}):
            slug = uuid.uuid4().hex[:11]

        user = {
            'registered_on': datetime.datetime.now(),
            'slug': slug,
            'social_auth': {
                'social_auth_id': social_auth_id,
                'social_provider': 'google'
            },
            'description': '',
            'image_url': '',
            'profile_name': '',
            'total_engagement': {
                'likes': 0,
                'bookmarks': 0,
                'comments': 0,
                'followers': 0,
                'followings': 0
            }
        }

        # Insert the new user document into the collection
        result = user_db.profile.insert_one(user)
        user['_id'] = str(result.inserted_id)
    else:
        user['_id'] = str(user['_id'])

    user = User(user)
    login_user(user)
    return redirect(url_for('main.index'))
