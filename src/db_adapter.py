"""
Dual-Engine Real Database Adapter for ONE FOR ALL (little-ong)
Supports:
1. Local SQLite (data/one_for_all.db) for Intranet / Local Server speed & reliability
2. Turso Cloud SQLite over HTTPS for Vercel Serverless & multi-device Cloud persistence
"""

import os
import json
import sqlite3
import ssl
import urllib.request
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple, Union

BASE_DIR = Path(__file__).resolve().parent.parent
LOCAL_DB_PATH = BASE_DIR / "data" / "one_for_all.db"


def load_dotenv_if_present():
    env_path = BASE_DIR / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                k = k.strip().lstrip("\ufeff")
                v = v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v


load_dotenv_if_present()


def get_turso_credentials() -> Tuple[str, str]:
    url = os.getenv("TURSO_DATABASE_URL", "").strip()
    token = os.getenv("TURSO_AUTH_TOKEN", "").strip()
    return url, token


class TursoClient:
    """Executes SQL statements against Turso Cloud HTTP v2 Pipeline API."""

    def __init__(self, url: str, token: str):
        clean_url = url.replace("libsql://", "https://").rstrip("/")
        if not clean_url.startswith("http"):
            clean_url = f"https://{clean_url}"
        self.endpoint = f"{clean_url}/v2/pipeline"
        self.token = token

    def _convert_arg(self, val: Any) -> Dict[str, Any]:
        if val is None:
            return {"type": "null"}
        elif isinstance(val, bool):
            return {"type": "integer", "value": "1" if val else "0"}
        elif isinstance(val, int):
            return {"type": "integer", "value": str(val)}
        elif isinstance(val, float):
            return {"type": "float", "value": val}
        else:
            return {"type": "text", "value": str(val)}

    def execute(self, sql: str, params: Union[Tuple, List] = ()) -> List[Dict[str, Any]]:
        args = [self._convert_arg(p) for p in params]
        payload = {
            "requests": [
                {"type": "execute", "stmt": {"sql": sql, "args": args}},
                {"type": "close"}
            ]
        }
        req = urllib.request.Request(
            self.endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            },
        )
        ssl_ctx = ssl.create_default_context()
        try:
            import certifi
            ssl_ctx.load_verify_locations(certifi.where())
        except Exception:
            ssl_ctx.check_hostname = False
            ssl_ctx.verify_mode = ssl.CERT_NONE

        with urllib.request.urlopen(req, context=ssl_ctx, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        results = data.get("results", [])
        if not results:
            return []
        res_obj = results[0]
        if res_obj.get("type") == "error":
            err_msg = res_obj.get("error", {}).get("message", "Unknown Turso Error")
            raise RuntimeError(f"Turso SQL Error: {err_msg}")

        stmt_res = res_obj.get("response", {}).get("result", {})
        cols = [c.get("name") for c in stmt_res.get("cols", [])]
        rows = []
        for r in stmt_res.get("rows", []):
            row_dict = {}
            for idx, cell in enumerate(r):
                col_name = cols[idx] if idx < len(cols) else f"col_{idx}"
                t = cell.get("type")
                if t == "null":
                    row_dict[col_name] = None
                elif t == "integer":
                    row_dict[col_name] = int(cell.get("value", 0))
                elif t == "float":
                    row_dict[col_name] = float(cell.get("value", 0.0))
                else:
                    row_dict[col_name] = cell.get("value")
            rows.append(row_dict)
        return rows


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS one_for_all_apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    description TEXT DEFAULT '',
    environment_type TEXT NOT NULL DEFAULT 'INTRANET',
    category TEXT NOT NULL DEFAULT 'ทั่วไป',
    protocol TEXT DEFAULT 'http',
    host_or_url TEXT NOT NULL DEFAULT '',
    port TEXT DEFAULT '',
    path TEXT DEFAULT '',
    full_url TEXT NOT NULL,
    intranet_url TEXT DEFAULT '',
    hostname_url TEXT DEFAULT '',
    https_url TEXT DEFAULT '',
    cloud_url TEXT DEFAULT '',
    local_folder TEXT DEFAULT '',
    icon_name TEXT DEFAULT 'rocket',
    icon_emoji TEXT DEFAULT '🚀',
    icon_color TEXT DEFAULT 'from-indigo-500 to-purple-600',
    is_pinned INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 100,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
"""

META_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS one_for_all_meta (
    meta_key TEXT PRIMARY KEY,
    meta_value TEXT NOT NULL
);
"""


def get_local_sqlite_conn() -> Optional[sqlite3.Connection]:
    if os.getenv("VERCEL"):
        return None
    LOCAL_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(LOCAL_DB_PATH), timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn


def get_turso_client() -> Optional[TursoClient]:
    url, token = get_turso_credentials()
    if url and token:
        return TursoClient(url, token)
    return None


def init_databases() -> Dict[str, Any]:
    """Initializes schema on both Local SQLite and Turso Cloud (if configured)."""
    status = {
        "local_sqlite": False,
        "turso_cloud": False,
        "mode": "DISCONNECTED",
        "errors": [],
    }
    # 1. Local SQLite
    try:
        conn = get_local_sqlite_conn()
        if conn is not None:
            conn.execute(SCHEMA_SQL)
            conn.execute(META_SCHEMA_SQL)
            conn.commit()
            conn.close()
            status["local_sqlite"] = True
    except Exception as e:
        status["errors"].append(f"Local SQLite: {e}")

    # 2. Turso Cloud
    try:
        turso = get_turso_client()
        if turso is not None:
            turso.execute(SCHEMA_SQL)
            turso.execute(META_SCHEMA_SQL)
            status["turso_cloud"] = True
    except Exception as e:
        status["errors"].append(f"Turso Cloud: {e}")

    if status["turso_cloud"] and status["local_sqlite"]:
        status["mode"] = "HYBRID_CLOUD_AND_LOCAL"
    elif status["turso_cloud"]:
        status["mode"] = "TURSO_CLOUD"
    elif status["local_sqlite"]:
        status["mode"] = "LOCAL_SQLITE"
    else:
        status["mode"] = "DISCONNECTED"

    return status


def query_all_apps() -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Fetches all applications ordered by is_pinned DESC, sort_order ASC, name ASC.
    Reads from Turso Cloud when on Vercel (or syncs between Local SQLite & Turso).
    """
    db_status = init_databases()
    sql = """
        SELECT * FROM one_for_all_apps
        ORDER BY is_pinned DESC, sort_order ASC, name ASC
    """
    # Prefer Local SQLite on local machine for 1ms latency, fallback to Turso Cloud
    if db_status["local_sqlite"]:
        conn = get_local_sqlite_conn()
        cur = conn.execute(sql)
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        if rows:
            return rows, db_status
        # If local is empty but Turso has data, pull from Turso into local!
        if db_status["turso_cloud"]:
            try:
                turso_rows = get_turso_client().execute(sql)
                if turso_rows:
                    for r in turso_rows:
                        upsert_app_record(r, sync_cloud=False)
                    return turso_rows, db_status
            except Exception:
                pass
        return rows, db_status

    if db_status["turso_cloud"]:
        rows = get_turso_client().execute(sql)
        return rows, db_status

    raise RuntimeError("ไม่สามารถเชื่อมต่อฐานข้อมูลได้ (Database Disconnected)")


def upsert_app_record(app_data: Dict[str, Any], sync_cloud: bool = True) -> Dict[str, Any]:
    """Inserts or updates an application record in both Local SQLite and Turso Cloud."""
    sql = """
    INSERT INTO one_for_all_apps (
        id, name, subtitle, description, environment_type, category,
        protocol, host_or_url, port, path, full_url,
        intranet_url, hostname_url, https_url, cloud_url, local_folder,
        icon_name, icon_emoji, icon_color, is_pinned, sort_order, updated_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        subtitle = excluded.subtitle,
        description = excluded.description,
        environment_type = excluded.environment_type,
        category = excluded.category,
        protocol = excluded.protocol,
        host_or_url = excluded.host_or_url,
        port = excluded.port,
        path = excluded.path,
        full_url = excluded.full_url,
        intranet_url = excluded.intranet_url,
        hostname_url = excluded.hostname_url,
        https_url = excluded.https_url,
        cloud_url = excluded.cloud_url,
        local_folder = excluded.local_folder,
        icon_name = excluded.icon_name,
        icon_emoji = excluded.icon_emoji,
        icon_color = excluded.icon_color,
        is_pinned = excluded.is_pinned,
        sort_order = excluded.sort_order,
        updated_at = datetime('now')
    """
    params = (
        str(app_data["id"]),
        str(app_data.get("name", "")),
        str(app_data.get("subtitle", "")),
        str(app_data.get("description", "")),
        str(app_data.get("environment_type", "INTRANET")),
        str(app_data.get("category", "ทั่วไป")),
        str(app_data.get("protocol", "http")),
        str(app_data.get("host_or_url", "")),
        str(app_data.get("port", "")),
        str(app_data.get("path", "")),
        str(app_data.get("full_url", "")),
        str(app_data.get("intranet_url", "")),
        str(app_data.get("hostname_url", "")),
        str(app_data.get("https_url", "")),
        str(app_data.get("cloud_url", "")),
        str(app_data.get("local_folder", "")),
        str(app_data.get("icon_name", "rocket")),
        str(app_data.get("icon_emoji", "🚀")),
        str(app_data.get("icon_color", "from-indigo-500 to-purple-600")),
        1 if app_data.get("is_pinned") else 0,
        int(app_data.get("sort_order", 100)),
    )

    conn = get_local_sqlite_conn()
    if conn is not None:
        conn.execute(sql, params)
        conn.commit()
        conn.close()

    if sync_cloud:
        turso = get_turso_client()
        if turso is not None:
            try:
                turso.execute(sql, params)
            except Exception as e:
                if os.getenv("VERCEL"):
                    raise e

    return app_data


def delete_app_record(app_id: str) -> bool:
    sql = "DELETE FROM one_for_all_apps WHERE id = ?"
    conn = get_local_sqlite_conn()
    if conn is not None:
        conn.execute(sql, (app_id,))
        conn.commit()
        conn.close()

    turso = get_turso_client()
    if turso is not None:
        try:
            turso.execute(sql, (app_id,))
        except Exception as e:
            if os.getenv("VERCEL"):
                raise e
    return True


def get_meta(key: str) -> Optional[str]:
    sql = "SELECT meta_value FROM one_for_all_meta WHERE meta_key = ?"
    conn = get_local_sqlite_conn()
    if conn is not None:
        row = conn.execute(sql, (key,)).fetchone()
        conn.close()
        if row:
            return row["meta_value"]
    turso = get_turso_client()
    if turso is not None:
        try:
            rows = turso.execute(sql, (key,))
            if rows:
                return str(rows[0].get("meta_value", ""))
        except Exception:
            pass
    return None


def set_meta(key: str, value: str):
    sql = """
    INSERT INTO one_for_all_meta (meta_key, meta_value) VALUES (?, ?)
    ON CONFLICT(meta_key) DO UPDATE SET meta_value = excluded.meta_value
    """
    conn = get_local_sqlite_conn()
    if conn is not None:
        conn.execute(sql, (key, value))
        conn.commit()
        conn.close()
    turso = get_turso_client()
    if turso is not None:
        try:
            turso.execute(sql, (key, value))
        except Exception:
            pass

