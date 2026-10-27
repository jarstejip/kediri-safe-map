@echo off
title Kediri Safe Map Server
echo ========================================================
echo  Menjalankan Kediri Safe Map Server di Port 8080...
echo  (Dibutuhkan untuk otentikasi Google OAuth localhost:8080)
echo ========================================================
echo.
start http://localhost:8080
python -m http.server 8080
pause
