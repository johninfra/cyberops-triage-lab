@echo off
setlocal
cd /d "%~dp0"
set "LAB_NODE=node"
where node >nul 2>nul
if errorlevel 1 (
  set "LAB_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)
if exist ".tools\package\bin\npm-cli.js" (
  if not exist "node_modules\vite\bin\vite.js" "%LAB_NODE%" .tools\package\bin\npm-cli.js install
  "%LAB_NODE%" .tools\package\bin\npm-cli.js run dev
) else (
  where npm >nul 2>nul
  if errorlevel 1 (
    echo Install Node.js with npm, then run this launcher again.
    pause
    exit /b 1
  )
  if not exist "node_modules\vite\bin\vite.js" call npm install
  call npm run dev
)
endlocal
