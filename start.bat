@echo off
SETLOCAL

where pnpm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
  echo pnpm is required but not installed.
  EXIT /B 1
)

IF NOT EXIST node_modules (
  echo Installing dependencies...
  pnpm install
)

IF NOT EXIST build (
  echo Building project...
  pnpm build
)

echo Starting server...
node build

ENDLOCAL