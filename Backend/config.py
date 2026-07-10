"""
Configuration File
Democratizing Sports Talent Assessment
"""

import os

class Config:
    # Flask Settings
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")

    # Database Settings
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///sports_talent.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Upload Settings
    UPLOAD_FOLDER = "uploads"
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MB

    # Allowed File Types
    ALLOWED_EXTENSIONS = {"mp4", "avi", "mov", "jpg", "jpeg", "png"}

    # API Settings
    API_VERSION = "v1"

    # Debug Mode
    DEBUG = True
