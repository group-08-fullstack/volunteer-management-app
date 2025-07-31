import os
from dotenv import load_dotenv


# Load in env
basedir = os.path.abspath(os.path.dirname(__file__))
dotenv_path = os.path.join(basedir, '.env')
load_dotenv(dotenv_path)


# config.py
class Config:
    MYSQL_HOST = 'mydemoserver-quickstart.mysql.database.azure.com'
    MYSQL_USER = 'mydemouser'
    MYSQL_PASSWORD = os.getenv("database_password")
    MYSQL_DB = 'volunteermgnt'

class TestConfig(Config):
    MYSQL_HOST = 'mydemoserver-quickstart.mysql.database.azure.com'
    MYSQL_USER = 'mydemouser'
    MYSQL_PASSWORD = os.getenv("database_password")
    MYSQL_DB = 'test_db'
