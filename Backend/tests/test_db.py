import pytest
from unittest.mock import patch
from api.db import get_db
import pymysql
from flask import Flask


@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['MYSQL_HOST'] = 'localhost'
    app.config['MYSQL_USER'] = 'testuser'
    app.config['MYSQL_PASSWORD'] = 'testpass'
    app.config['MYSQL_DB'] = 'testdb'
    return app


def test_get_db_success(app, monkeypatch):
    class DummyConnection:
        def cursor(self):
            return None
        def close(self):
            pass

    def dummy_connect(*args, **kwargs):
        return DummyConnection()

    monkeypatch.setattr(pymysql, "connect", dummy_connect)

    with app.app_context():
        conn = get_db()
        assert conn is not None
        assert hasattr(conn, "cursor")
        assert hasattr(conn, "close")
        conn.close()


def test_get_db_raises_on_connection_failure(app):
    with patch('pymysql.connect', side_effect=Exception("Connection failed")):
        with app.app_context():
            with pytest.raises(Exception) as exc_info:
                get_db()
            assert "Connection failed" in str(exc_info.value)
