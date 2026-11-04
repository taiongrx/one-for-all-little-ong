"""
ONE FOR ALL (little-ong) — Cross-Machine Project & Port Auto-Scanner
Run this script on ANY computer to automatically discover:
1. Active web/application ports (Python, Node, Docker, PHP, IIS, Apache, Streamlit, FastAPI, Vite)
2. Local project folders containing .vercel/project.json, package.json, docker-compose.yml, requirements.txt
3. Automatically registers discovered projects to the central ONE FOR ALL Cloud Portal:
   https://one-for-all-little-ong.vercel.app
"""

import os
import sys
import json
import glob
import socket
import subprocess
import urllib.request
import urllib.error

if sys.stdout is not None and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

PORTAL_CLOUD_URL = os.getenv("ONE_FOR_ALL_URL", "https://one-for-all-little-ong.vercel.app")

# Standard Windows/System ports to ignore when scanning for web apps
IGNORED_PORTS = {
    21, 22, 23, 25, 53, 110, 135, 137, 138, 139, 143, 443, 445,
    548, 587, 993, 995, 1433, 1521, 3306, 3389, 5040, 5130, 5354,
    5432, 5530, 5531, 6379, 7070, 7680, 8218, 9900, 18888, 27017, 49160
}

IGNORED_PROCESSES = {
    "svchost.exe", "system", "lsass.exe", "wininit.exe", "services.exe",
    "spoolsv.exe", "mdnsresponder.exe", "anydesk.exe", "ehpclientagent.exe",
    "jhi_service.exe", "antigravity.exe", "language_server.exe", "code.exe",
    "explorer.exe", "searchhost.exe", "mysqld.exe", "postgres.exe"
}


def get_this_pc_info():
    hostname = socket.gethostname()
    lan_ip = "127.0.0.1"
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("192.168.0.1", 80))
        lan_ip = s.getsockname()[0]
        s.close()
    except Exception:
        try:
            lan_ip = socket.gethostbyname(hostname)
        except Exception:
            pass
    return hostname, lan_ip


def check_http_title(port: int) -> str:
    """Attempts a fast HTTP GET on 127.0.0.1:port to extract <title> if it is a web server."""
    import re
    for proto in ("http", "https"):
        try:
            import ssl
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            req = urllib.request.Request(
                f"{proto}://127.0.0.1:{port}/",
                headers={"User-Agent": "OneForAll-Scanner/1.0"}
            )
            with urllib.request.urlopen(req, timeout=1.5, context=ctx if proto == "https" else None) as resp:
                html = resp.read(16384).decode("utf-8", errors="ignore")
                m = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
                if m:
                    title = " ".join(m.group(1).strip().split())
                    if title:
                        return title[:80]
                return f"Web Service (Port {port})"
        except Exception:
            continue
    return ""


def scan_active_web_ports(hostname: str, lan_ip: str):
    """Scans listening TCP ports that belong to web/app processes."""
    discovered = []
    if os.name != "nt":
        return discovered

    res = subprocess.run("netstat -ano", capture_output=True, text=True, shell=True)
    seen_ports = set()

    for line in res.stdout.splitlines():
        if "LISTENING" not in line:
            continue
        parts = line.split()
        if len(parts) < 5:
            continue
        local_addr, pid = parts[1], parts[4]
        if local_addr.startswith("127.0.0.1:") or local_addr.startswith("[::1]:"):
            # Skip loopback-only internal ports unless it's a known dev port
            port_str = local_addr.split(":")[-1]
            if port_str not in ("3000", "5173", "8000", "8050", "8080", "8501"):
                continue
        else:
            port_str = local_addr.split(":")[-1]

        if not port_str.isdigit():
            continue
        port = int(port_str)
        if port in IGNORED_PORTS or port >= 49152 or port in seen_ports:
            continue

        # Identify process name
        proc_name = "unknown"
        try:
            p_res = subprocess.run(f'tasklist /fi "PID eq {pid}" /fo csv /nh', capture_output=True, text=True, shell=True)
            out = p_res.stdout.strip()
            if out and not out.startswith("INFO:"):
                proc_name = out.split(",")[0].replace('"', '').strip()
        except Exception:
            pass

        if proc_name.lower() in IGNORED_PROCESSES:
            continue

        seen_ports.add(port)
        page_title = check_http_title(port)
        if not page_title and proc_name.lower() not in ("python.exe", "pythonw.exe", "node.exe", "com.docker.backend.exe", "uvicorn.exe"):
            continue

        app_title = page_title or f"{proc_name} App (:{port})"
        slug = f"{hostname.lower()}-port-{port}"
        proto = "https" if port in (443, 8443) else "http"

        discovered.append({
            "id": slug,
            "name": f"{app_title} [{hostname}]",
            "subtitle": f"เครื่อง {hostname} ({lan_ip}:{port}) • {proc_name}",
            "description": f"ตรวจพบอัตโนมัติบนเครื่อง {hostname} (IP: {lan_ip} พอร์ต {port} โปรเซส {proc_name})",
            "environment_type": "INTRANET",
            "category": f"เครื่อง {hostname} ({lan_ip})",
            "protocol": proto,
            "host_or_url": lan_ip,
            "port": str(port),
            "path": "/",
            "full_url": f"{proto}://{lan_ip}:{port}",
            "intranet_url": f"{proto}://{lan_ip}:{port}",
            "hostname_url": f"{proto}://{hostname.lower()}:{port}",
            "https_url": "",
            "cloud_url": "",
            "local_folder": f"Host: {hostname}",
            "icon_name": "server",
            "icon_emoji": "🖥️",
            "icon_color": "from-cyan-500 via-blue-500 to-indigo-600",
            "is_pinned": 1,
            "sort_order": 50,
        })

    return discovered


def scan_vercel_and_local_folders(hostname: str, lan_ip: str):
    """Scans common drives/folders for .vercel/project.json to find deployed Vercel apps on this PC."""
    discovered = []
    search_roots = [
        os.path.expanduser("~"),
        os.path.join(os.path.expanduser("~"), "Desktop"),
        os.path.join(os.path.expanduser("~"), "Documents"),
        os.path.join(os.path.expanduser("~"), "Downloads"),
        "C:\\",
        "D:\\",
    ]
    visited_Vercel = set()

    for root_dir in search_roots:
        if not os.path.exists(root_dir):
            continue
        # Only walk up to depth 3 for speed
        for current_root, dirs, files in os.walk(root_dir):
            rel_depth = current_root[len(root_dir):].count(os.sep)
            if rel_depth > 3:
                dirs[:] = []
                continue
            dirs[:] = [
                d for d in dirs
                if not d.startswith(".") or d == ".vercel"
                if d.lower() not in ("node_modules", "windows", "program files", "program files (x86)", "appdata", "venv", ".venv", "__pycache__", "$recycle.bin")
            ]
            if ".vercel" in dirs:
                vp = os.path.join(current_root, ".vercel", "project.json")
                if os.path.exists(vp):
                    try:
                        vdata = json.load(open(vp, encoding="utf-8"))
                        proj_name = vdata.get("projectName")
                        if proj_name and proj_name not in visited_Vercel and proj_name != "one-for-all-little-ong":
                            visited_Vercel.add(proj_name)
                            cloud_url = f"https://{proj_name}.vercel.app"
                            discovered.append({
                                "id": f"vercel-{proj_name}",
                                "name": f"{proj_name} (Vercel Cloud)",
                                "subtitle": f"Vercel Project จากเครื่อง {hostname}",
                                "description": f"โปรเจกต์ Vercel ที่พบในโฟลเดอร์ {current_root} บนเครื่อง {hostname}",
                                "environment_type": "VERCEL",
                                "category": f"เครื่อง {hostname} ({lan_ip})",
                                "protocol": "https",
                                "host_or_url": f"{proj_name}.vercel.app",
                                "port": "",
                                "path": "/",
                                "full_url": cloud_url,
                                "intranet_url": "",
                                "hostname_url": "",
                                "https_url": "",
                                "cloud_url": cloud_url,
                                "local_folder": f"[{hostname}] {current_root}",
                                "icon_name": "cloud",
                                "icon_emoji": "☁️",
                                "icon_color": "from-indigo-500 via-purple-500 to-pink-500",
                                "is_pinned": 1,
                                "sort_order": 40,
                            })
                    except Exception:
                        pass
    return discovered


def main():
    hostname, lan_ip = get_this_pc_info()
    print("=" * 75)
    print(f"  📡 ONE FOR ALL — Auto-Scanner สำหรับรวมโปรเจกต์จากเครื่อง: {hostname} ({lan_ip})")
    print(f"  เป้าหมาย Cloud Portal: {PORTAL_CLOUD_URL}")
    print("=" * 75)

    print("\n[1/3] กำลังสแกนพอร์ตเว็บแอปพลิเคชันที่เปิดทำงานอยู่ในเครื่องนี้...")
    port_apps = scan_active_web_ports(hostname, lan_ip)
    print(f"      -> พบ {len(port_apps)} พอร์ตเว็บที่กำลังออนไลน์")

    print("[2/3] กำลังสแกนหาโปรเจกต์ Vercel (.vercel/project.json) ในเครื่องนี้...")
    vercel_apps = scan_vercel_and_local_folders(hostname, lan_ip)
    print(f"      -> พบ {len(vercel_apps)} โปรเจกต์ Vercel")

    all_found = port_apps + vercel_apps
    if not all_found:
        print("\n[!] ไม่พบพอร์ตเว็บหรือโปรเจกต์ใหม่ที่เปิดทำงานอยู่ในขณะนี้")
        return

    print("\nรายการที่ตรวจพบบนเครื่องนี้:")
    for idx, app in enumerate(all_found, 1):
        print(f"  {idx}. {app['name']} -> {app['full_url']} ({app['local_folder']})")

    print(f"\n[3/3] กำลังส่งรายการโปรเจกต์ขึ้นไปยัง {PORTAL_CLOUD_URL}/api/apps/import ...")
    req = urllib.request.Request(
        f"{PORTAL_CLOUD_URL}/api/apps/import",
        data=json.dumps({"apps": all_found}).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "OneForAll-Scanner/1.0"},
        method="POST",
    )
    try:
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            print(f"\n✅ สำเร็จ! ซิงค์โปรเจกต์จากเครื่อง {hostname} ({lan_ip}) จำนวน {res_data.get('imported', len(all_found))} รายการ ขึ้น Cloud เรียบร้อยแล้ว!")
            print(f"🌐 เปิดดูได้ที่: {PORTAL_CLOUD_URL}")
    except Exception as e:
        print(f"\n❌ เกิดข้อผิดพลาดในการส่งข้อมูลขึ้น Cloud: {e}")


if __name__ == "__main__":
    main()
