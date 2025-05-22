@echo off
echo Starting Spring Boot application...
cd /d %~dp0
if exist mvnw.cmd (
  echo Found mvnw wrapper, using it to start the application...
  call mvnw.cmd spring-boot:run
) else (
  echo Maven wrapper not found, checking for Maven...
  where mvn >nul 2>nul
  if %ERRORLEVEL% equ 0 (
    echo Maven found, using it to start the application...
    call mvn spring-boot:run
  ) else (
    echo Maven not found. Please install Maven or make sure it's in your PATH.
    echo You can download Maven from https://maven.apache.org/download.cgi
    pause
    exit /b 1
  )
) 