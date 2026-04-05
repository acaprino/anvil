@echo off
setlocal

set "NODE_BIN=C:\Program Files\nodejs"
set "CARGO_BIN=C:\Users\%USERNAME%\.cargo\bin"
set "PATH=%NODE_BIN%;%CARGO_BIN%;%PATH%"

where node >nul 2>&1
if errorlevel 1 (
    echo Node.js not found. Installing via winget...
    choice /M "Install Node.js LTS?"
    if errorlevel 2 (
        echo Aborted. Install Node.js from https://nodejs.org
        exit /b 1
    )
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    if errorlevel 1 (
        echo ERROR: Node.js installation failed.
        exit /b 1
    )
    set "PATH=%NODE_BIN%;%PATH%"
    echo Node.js installed successfully.
    echo.
)

where cargo >nul 2>&1
if errorlevel 1 (
    echo Cargo not found. Installing Rust via rustup...
    choice /M "Install Rust?"
    if errorlevel 2 (
        echo Aborted. Install Rust from https://rustup.rs
        exit /b 1
    )
    curl -sSf -o "%TEMP%\rustup-init.exe" https://win.rustup.rs/x86_64
    if errorlevel 1 (
        echo ERROR: Failed to download rustup. Install manually from https://rustup.rs
        exit /b 1
    )
    "%TEMP%\rustup-init.exe" -y --default-toolchain stable
    if errorlevel 1 (
        echo ERROR: Rust installation failed.
        exit /b 1
    )
    del "%TEMP%\rustup-init.exe" >nul 2>&1
    set "PATH=%CARGO_BIN%;%PATH%"
    echo Rust installed successfully.
    echo.
)

cd /d "%~dp0app"

if not exist "node_modules" call npm install

echo Starting Tauri dev...
call npx tauri dev
