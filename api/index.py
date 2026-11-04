"""
ONE FOR ALL (little-ong) — Unified Cloud & Intranet Application Launchpad API
Compatible with:
1. Local / Intranet Server (FastAPI + Uvicorn on Port 8090)
2. Vercel Serverless Python (@vercel/python)
"""

import os
import sys
import uuid
import time
import socket
import ssl
import urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse, PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.db_adapter import (
    init_databases,
    query_all_apps,
    upsert_app_record,
    delete_app_record,
)
from src.data_guardrail import (
    validate_application_payload,
    filter_verified_records,
)
from src.seed_real_projects import seed_if_empty

app = FastAPI(
    title="ONE FOR ALL (little-ong) — Application Portal API",
    description="Unified Cloud (Vercel) & Intranet (IP:Port) App Launchpad",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = BASE_DIR / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


def get_host_network_info() -> Dict[str, str]:
    hostname = socket.gethostname()
    lan_ip = "192.168.3.186"
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("192.168.0.1", 80))
        detected = s.getsockname()[0]
        s.close()
        if detected and not detected.startswith("127."):
            lan_ip = detected
    except Exception:
        pass
    return {
        "hostname": hostname,
        "lan_ip": lan_ip,
        "runtime": "VERCEL_CLOUD" if os.getenv("VERCEL") else "INTRANET_SERVER",
    }


def build_urls_from_payload(data: Dict[str, Any]) -> Dict[str, Any]:
    """Automatically constructs full_url, intranet_url, hostname_url if IP+Port are provided."""
    protocol = str(data.get("protocol") or "http").strip().lower()
    host = str(data.get("host_or_url") or "").strip()
    port = str(data.get("port") or "").strip()
    path = str(data.get("path") or "").strip()
    if path and not path.startswith("/"):
        path = "/" + path

    full_url = str(data.get("full_url") or "").strip()
    if not full_url and host:
        if host.startswith("http://") or host.startswith("https://"):
            full_url = host
        else:
            port_part = f":{port}" if port else ""
            full_url = f"{protocol}://{host}{port_part}{path}"

    data["full_url"] = full_url

    env_type = str(data.get("environment_type") or "INTRANET").upper()
    if env_type in ("INTRANET", "HYBRID") and not data.get("intranet_url"):
        if port:
            data["intranet_url"] = f"{protocol}://192.168.3.186:{port}{path}"
            if not data.get("hostname_url"):
                data["hostname_url"] = f"{protocol}://drug-330:{port}{path}"
    elif env_type == "VERCEL" and not data.get("cloud_url"):
        data["cloud_url"] = full_url

    return data


@app.get("/", response_class=HTMLResponse)
async def serve_portal_home():
    index_file = STATIC_DIR / "index.html"
    if not index_file.exists():
        return HTMLResponse("<h1>ONE FOR ALL Portal UI not found</h1>", status_code=404)
    return HTMLResponse(index_file.read_text(encoding="utf-8"))


@app.get("/api/apps")
async def api_list_apps():
    try:
        seed_if_empty(force=False)
        rows, db_status = query_all_apps()
        verified_rows = filter_verified_records(rows)
        return {
            "status": "ok",
            "count": len(verified_rows),
            "empty_message": "ไม่มีรายการแอปพลิเคชัน (0 รายการ)" if len(verified_rows) == 0 else None,
            "apps": verified_rows,
            "db_status": db_status,
            "host_info": get_host_network_info(),
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "message": f"ไม่สามารถเชื่อมต่อฐานข้อมูลได้: {e}",
                "count": 0,
                "apps": [],
                "db_status": {"mode": "DISCONNECTED", "errors": [str(e)]},
                "host_info": get_host_network_info(),
            },
        )


@app.post("/api/apps")
async def api_create_or_update_app(request: Request):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="รูปแบบข้อมูล JSON ไม่ถูกต้อง")

    if not body.get("id"):
        slug = "".join(c if c.isalnum() else "-" for c in str(body.get("name", "app")).lower()).strip("-")
        body["id"] = f"{slug}-{uuid.uuid4().hex[:6]}"

    body = build_urls_from_payload(body)
    is_valid, err_msg = validate_application_payload(body)
    if not is_valid:
        raise HTTPException(status_code=422, detail=err_msg)

    try:
        saved = upsert_app_record(body, sync_cloud=True)
        return {"status": "ok", "app": saved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"บันทึกข้อมูลลงฐานข้อมูลล้มเหลว: {e}")


@app.put("/api/apps/{app_id}")
async def api_update_app(app_id: str, request: Request):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="รูปแบบข้อมูล JSON ไม่ถูกต้อง")

    rows, _ = query_all_apps()
    existing = next((r for r in rows if r["id"] == app_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="ไม่พบแอปพลิเคชันที่ต้องการแก้ไข")

    merged = {**existing, **body, "id": app_id}
    merged = build_urls_from_payload(merged)
    is_valid, err_msg = validate_application_payload(merged)
    if not is_valid:
        raise HTTPException(status_code=422, detail=err_msg)

    saved = upsert_app_record(merged, sync_cloud=True)
    return {"status": "ok", "app": saved}


@app.delete("/api/apps/{app_id}")
async def api_delete_app(app_id: str):
    try:
        delete_app_record(app_id)
        return {"status": "ok", "deleted_id": app_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ลบข้อมูลไม่สำเร็จ: {e}")


@app.post("/api/apps/reorder")
async def api_reorder_apps(request: Request):
    try:
        body = await request.json()
        ordered_ids = body.get("ordered_ids", [])
    except Exception:
        raise HTTPException(status_code=400, detail="รูปแบบ JSON ไม่ถูกต้อง")

    if not isinstance(ordered_ids, list):
        raise HTTPException(status_code=400, detail="ordered_ids ต้องเป็น Array")

    rows, _ = query_all_apps()
    row_map = {r["id"]: r for r in rows}
    updated = 0
    for idx, app_id in enumerate(ordered_ids, start=1):
        if app_id in row_map:
            rec = dict(row_map[app_id])
            rec["sort_order"] = idx
            upsert_app_record(rec, sync_cloud=True)
            updated += 1
    return {"status": "ok", "updated": updated}


@app.post("/api/apps/sync-machine")
async def api_sync_machine_projects():
    try:
        res = seed_if_empty(force=True)
        rows, db_status = query_all_apps()
        return {
            "status": "ok",
            "message": f"ซิงค์โปรเจกต์จริงในเครื่องสำเร็จ ({res['seeded']} รายการ)",
            "count": len(rows),
            "apps": filter_verified_records(rows),
            "db_status": db_status,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ซิงค์ข้อมูลไม่สำเร็จ: {e}")


@app.post("/api/apps/import")
async def api_import_apps(request: Request):
    try:
        body = await request.json()
        items = body.get("apps", body if isinstance(body, list) else [])
    except Exception:
        raise HTTPException(status_code=400, detail="ไฟล์ JSON ไม่ถูกต้อง")

    if not isinstance(items, list):
        raise HTTPException(status_code=400, detail="ข้อมูลที่นำเข้าต้องเป็นรายการ (Array)")

    imported_count = 0
    for item in items:
        if not isinstance(item, dict):
            continue
        if not item.get("id"):
            item["id"] = f"import-{uuid.uuid4().hex[:8]}"
        item = build_urls_from_payload(item)
        ok, err = validate_application_payload(item)
        if not ok:
            raise HTTPException(status_code=422, detail=err)
        upsert_app_record(item, sync_cloud=True)
        imported_count += 1

    rows, db_status = query_all_apps()
    return {
        "status": "ok",
        "imported": imported_count,
        "apps": filter_verified_records(rows),
        "db_status": db_status,
    }


def _probe_single_app(app_item: Dict[str, Any]) -> Dict[str, Any]:
    """Probes intranet TCP port and/or Cloud HTTP URL to report real health status."""
    app_id = app_item.get("id", "")
    port_str = str(app_item.get("port") or "").strip()
    intranet_url = str(app_item.get("intranet_url") or "").strip()
    cloud_url = str(app_item.get("cloud_url") or "").strip()
    full_url = str(app_item.get("full_url") or "").strip()

    result = {
        "id": app_id,
        "intranet_online": None,
        "cloud_online": None,
        "online": False,
        "latency_ms": None,
        "checked_target": "",
    }

    t0 = time.perf_counter()

    # 1. Check local/intranet port if running on intranet server and port is specified
    if port_str.isdigit() and not os.getenv("VERCEL"):
        port_num = int(port_str)
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(1.5)
            s.connect(("127.0.0.1", port_num))
            s.close()
            result["intranet_online"] = True
            result["online"] = True
            result["latency_ms"] = round((time.perf_counter() - t0) * 1000)
            result["checked_target"] = f"Port {port_num}"
        except Exception:
            result["intranet_online"] = False

    # 2. Check Cloud URL if available
    target_http = cloud_url or (full_url if full_url.startswith("https://") and "192.168." not in full_url else "")
    if target_http:
        t1 = time.perf_counter()
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            req = urllib.request.Request(target_http, headers={"User-Agent": "OneForAll-HealthMonitor/1.0"})
            with urllib.request.urlopen(req, timeout=3.5, context=ctx) as resp:
                code = resp.status
                is_up = 200 <= code < 400
                result["cloud_online"] = is_up
                if is_up:
                    result["online"] = True
                    if result["latency_ms"] is None:
                        result["latency_ms"] = round((time.perf_counter() - t1) * 1000)
                    result["checked_target"] = target_http
        except urllib.error.HTTPError as e:
            # Even 401/403 means server is reachable, 500/404 means error
            is_up = e.code in (401, 403)
            result["cloud_online"] = is_up
            if is_up:
                result["online"] = True
        except Exception:
            result["cloud_online"] = False

    return result


@app.get("/api/health-check")
async def api_health_check():
    rows, _ = query_all_apps()
    verified = filter_verified_records(rows)
    if not verified:
        return {"status": "ok", "results": {}}

    with ThreadPoolExecutor(max_workers=8) as pool:
        probes = list(pool.map(_probe_single_app, verified))

    results_map = {p["id"]: p for p in probes}
    online_count = sum(1 for p in probes if p["online"])
    return {
        "status": "ok",
        "total": len(probes),
        "online_count": online_count,
        "results": results_map,
        "checked_at": time.strftime("%H:%M:%S"),
    }


@app.get("/api/scanner-script.py", response_class=PlainTextResponse)
async def serve_remote_scanner_py():
    scanner_path = BASE_DIR / "src" / "remote_pc_scanner.py"
    if not scanner_path.exists():
        raise HTTPException(status_code=404, detail="Scanner script not found")
    return PlainTextResponse(
        content=scanner_path.read_text(encoding="utf-8"),
        media_type="text/x-python; charset=utf-8",
    )


@app.get("/api/scanner-script.bat")
async def serve_remote_scanner_bat():
    bat_content = (
        "@echo off\r\n"
        "chcp 65001 > nul\r\n"
        "title ONE FOR ALL — Auto-Scanner รวบรวมโปรเจกต์จากเครื่องนี้ขึ้น Cloud\r\n"
        "color 0B\r\n"
        "echo ===========================================================================\r\n"
        "echo   📡 ONE FOR ALL (little-ong) — Auto-Scanner สำหรับเครื่องนี้\r\n"
        "echo   กำลังดึงสคริปต์สแกนพอร์ตและโปรเจกต์เพื่อส่งขึ้น Cloud Portal...\r\n"
        "echo ===========================================================================\r\n"
        "powershell -NoProfile -ExecutionPolicy Bypass -Command \"irm 'https://one-for-all-little-ong.vercel.app/api/scanner-script.py' -OutFile '$env:TEMP\\ofa_scanner.py'\"\r\n"
        "python \"%TEMP%\\ofa_scanner.py\"\r\n"
        "echo.\r\n"
        "pause\r\n"
    )
    return Response(
        content=bat_content.encode("utf-8"),
        media_type="application/octet-stream",
        headers={"Content-Disposition": 'attachment; filename="Scan_This_PC_To_OneForAll.bat"'},
    )

