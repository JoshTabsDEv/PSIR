@echo off
echo Fixing Prisma Client...
echo.
echo Step 1: Stopping Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Step 2: Regenerating Prisma Client...
call pnpm prisma generate
echo.
echo Step 3: Starting dev server...
start cmd /k "pnpm dev"
echo.
echo Done! The dev server is starting in a new window.
pause
