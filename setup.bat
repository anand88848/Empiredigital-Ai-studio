@echo off
echo Setting up Empiredigital AI Studio...

:: Create .env.local
(
echo # Anthropic API Key
echo ANTHROPIC_API_KEY=your_api_key_here
echo.
echo # Higgsfield AI
echo HIGGSFIELD_CREDENTIALS=1b1b35d6-7505-48b8-84f9-26c3084768de:c5cc5e60b5dba6b900ddda090eb0e0447390ac5facbcf34a7ab154ac43d43672
echo.
echo NEXT_PUBLIC_APP_URL=http://localhost:3000
) > .env.local

echo .env.local created!

:: Install dependencies
echo Installing dependencies...
call npm install

:: Start the app
echo Starting app...
start http://localhost:3000/higgsfield
call npm run dev
