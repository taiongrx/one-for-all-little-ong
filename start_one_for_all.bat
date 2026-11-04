@echo off
chcp 65001 > nul
title ONE FOR ALL (little-ong) — Unified Cloud & Intranet App Launchpad (Port 8090)
color 0B

cd /d "d:\TAIONG\ONE FOR ALL little-ong"
echo ===========================================================================
echo   ⚡ ONE FOR ALL (little-ong) — Unified Cloud & Intranet App Launchpad
echo   Access URL: http://192.168.3.186:8090  or  http://localhost:8090
echo ===========================================================================
start http://localhost:8090
python run_portal.py
pause
