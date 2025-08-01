import pytest
from unittest.mock import patch
from api.db import get_db
import pymysql

def test_get_db_success(monkeypatch):
    
    class DummyConnection:
        def cursor(self):
            return None
        def close(self):
            pass

    def dummy_connect(*args, **kwargs):
        return DummyConnection()

    monkeypatch.setattr(pymysql, "connect", dummy_connect)

    conn = get_db()
    assert conn is not None
    
    assert hasattr(conn, "cursor")
    assert hasattr(conn, "close")
    conn.close()

def test_get_db_raises_on_connection_failure():
    with patch('pymysql.connect', side_effect=Exception("Connection failed")):
        with pytest.raises(Exception) as exc_info:
            get_db()
        assert "Connection failed" in str(exc_info.value)
