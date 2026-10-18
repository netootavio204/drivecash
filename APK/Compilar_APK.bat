@echo off
chcp 65001 > nul
echo ========================================================
echo       Meta Driver — Compilador Automático de APK
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Compilando assets web e sincronizando...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Falha ao compilar com npm run build.
    pause
    exit /b %ERRORLEVEL%
)

call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Falha ao sincronizar com Capacitor.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Compilando APK via Gradle...
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Falha na compilação do Gradle.
    pause
    exit /b %ERRORLEVEL%
)

cd ..

echo.
echo [3/3] Copiando APK gerado para a pasta principal...
copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "MetaDriver-v2.0.0.apk" > nul

echo.
echo ========================================================
echo  APK gerado com SUCESSO!
echo  Arquivo: APK\MetaDriver-v2.0.0.apk
echo ========================================================
echo.
pause
