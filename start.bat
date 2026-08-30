@echo off
setlocal
cd /d "%~dp0"
title vyper.lol

:: Enrich PATH with standard Node.js, npm and pnpm paths
set "PATH=%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\pnpm;%USERPROFILE%\AppData\Local\pnpm;%USERPROFILE%\.pnpm;%LOCALAPPDATA%\Programs\node;%LOCALAPPDATA%\fnm;%USERPROFILE%\.nvm;%PATH%"

echo Starting vyper.lol development server...
echo.

:: 1. Check for native pnpm
where pnpm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Running with pnpm...
    call pnpm run dev
    goto :end
)

:: 2. Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Running with npm...
    call npm run dev
    goto :end
)

:: 3. Check for npx
where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Running with npx pnpm...
    call npx pnpm run dev
    goto :end
)

echo [ERROR] Neither pnpm, npm, nor Node.js was detected in your PATH.
echo Looked into:
echo   - %ProgramFiles%\nodejs
echo   - %APPDATA%\npm
echo.
echo Please ensure Node.js is installed properly.

:end
if %ERRORLEVEL% neq 0 (
    echo.
    echo Server process ended with error code %ERRORLEVEL%.
)
pause
