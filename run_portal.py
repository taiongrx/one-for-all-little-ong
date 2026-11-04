"""
Launcher for ONE FOR ALL (little-ong) — Unified Cloud & Intranet Application Portal
Runs on http://0.0.0.0:8090 (Intranet LAN: http://192.168.3.186:8090)
"""

import os
import sys
import uvicorn

if sys.stdout is not None and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from src.seed_real_projects import seed_if_empty
from api.index import get_host_network_info


def main():
    port = int(os.getenv("PORT", "8090"))
    info = get_host_network_info()
    res = seed_if_empty(force=False)

    print("=" * 75)
    print("  ⚡ ONE FOR ALL (little-ong) — Unified Cloud & Intranet App Launchpad")
    print(f"  Database Mode : {res['db_status'].get('mode')} ({res['total']} Verified Apps)")
    print(f"  Local URL     : http://localhost:{port}")
    print(f"  Intranet IP   : http://{info['lan_ip']}:{port}")
    print(f"  Hostname URL  : http://{info['hostname'].lower()}:{port}")
    print("=" * 75)

    uvicorn.run("api.index:app", host="0.0.0.0", port=port, reload=False)


if __name__ == "__main__":
    main()
