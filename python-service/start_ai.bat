@echo off
set PYTHON_EXE="C:\Users\singh\AppData\Local\Programs\Python\Python312\python.exe"

echo [1/2] Installing dependencies...
%PYTHON_EXE% -m pip install flask flask-cors pandas python-dotenv

echo [2/2] Starting Python AI Service...
%PYTHON_EXE% app.py
pause
