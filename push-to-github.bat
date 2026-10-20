@echo off
setlocal enabledelayedexpansion

title Salem Entrepreneurs Club - One-Click GitHub Push
echo =====================================================================
echo          Salem Entrepreneurs Club - 1-Click GitHub Push Tool
echo =====================================================================
echo.

:: Detect Git Executable
set "GIT_EXE=git"
set "GHD_PATH=%LOCALAPPDATA%\GitHubDesktop\app-3.6.5\resources\app\git\cmd\git.exe"

if exist "%GHD_PATH%" (
    set "GIT_EXE=%GHD_PATH%"
) else (
    for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do (
        if exist "%%D\resources\app\git\cmd\git.exe" (
            set "GIT_EXE=%%D\resources\app\git\cmd\git.exe"
        )
    )
)

echo [*] Using Git: "!GIT_EXE!"
echo.

:: Check if repository is initialized
if not exist ".git" (
    echo [*] Initializing Git repository...
    "!GIT_EXE!" init -b main
    echo.
)

:: Ensure user identity is set
"!GIT_EXE!" config user.name >nul 2>&1
if errorlevel 1 (
    "!GIT_EXE!" config user.name "Salem Entrepreneurs Club"
    "!GIT_EXE!" config user.email "admin@salementrepreneursclub.com"
)

:: Check remote origin
"!GIT_EXE!" remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo [!] No GitHub remote found for this project.
    set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/repo.git): "
    if "!REPO_URL!"=="" (
        echo [ERROR] No URL entered. Aborting push.
        pause
        exit /b 1
    )
    "!GIT_EXE!" remote add origin "!REPO_URL!"
)

echo [*] Staging all files...
"!GIT_EXE!" add .

echo.
set /p COMMIT_MSG="Enter commit message (Press Enter for default: 'Update Salem Entrepreneurs Club'): "
if "!COMMIT_MSG!"=="" (
    set "COMMIT_MSG=Update Salem Entrepreneurs Club platform"
)

echo [*] Committing changes...
"!GIT_EXE!" commit -m "!COMMIT_MSG!"

echo.
echo [*] Pushing to GitHub (main branch)...
"!GIT_EXE!" branch -M main
"!GIT_EXE!" push -u origin main

if errorlevel 1 (
    echo.
    echo [!] Push failed or requires authentication.
    echo If your repository is private, use a Personal Access Token in the remote URL:
    echo   git remote set-url origin https://YOUR_TOKEN@github.com/username/repo.git
) else (
    echo.
    echo =====================================================================
    echo [SUCCESS] Your project has been pushed to GitHub successfully!
    echo =====================================================================
)

echo.
pause
