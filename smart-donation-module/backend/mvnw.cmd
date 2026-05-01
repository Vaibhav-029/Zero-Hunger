@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.4
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%

set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"

if not exist %WRAPPER_PROPERTIES% (
  echo [ERROR] Missing %WRAPPER_PROPERTIES%
  exit /b 1
)

@REM Prefer using "only-script" wrapper distribution logic if present, otherwise fall back to jar
for /f "usebackq tokens=1,* delims==" %%A in (%WRAPPER_PROPERTIES%) do (
  if "%%A"=="distributionType" set DISTRIBUTION_TYPE=%%B
)

if "%DISTRIBUTION_TYPE%"=="only-script" (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$p='%WRAPPER_PROPERTIES%';" ^
    "$props=Get-Content $p | Where-Object {$_ -match '='} | ForEach-Object { $k,$v=$_.Split('=',2); @{$k=$v} };" ^
    "$map=@{}; foreach($h in $props){ foreach($k in $h.Keys){$map[$k]=$h[$k]} };" ^
    "$url=$map['distributionUrl']; if(-not $url){ throw 'distributionUrl missing' }" ^
    "$mvnwHome=Join-Path $env:USERPROFILE '.mvnw'; New-Item -Force -ItemType Directory $mvnwHome | Out-Null;" ^
    "$file=Join-Path $mvnwHome (Split-Path $url -Leaf);" ^
    "if(-not (Test-Path $file)){ Invoke-WebRequest -Uri $url -OutFile $file }" ^
    "$dest=Join-Path $mvnwHome 'apache-maven';" ^
    "if(-not (Test-Path $dest)){ New-Item -Force -ItemType Directory $dest | Out-Null }" ^
    "$marker=Join-Path $dest 'bin\\mvn.cmd';" ^
    "if(-not (Test-Path $marker)){" ^
    "  $tmp=Join-Path $mvnwHome 'tmp'; if(Test-Path $tmp){ Remove-Item -Recurse -Force $tmp }" ^
    "  New-Item -Force -ItemType Directory $tmp | Out-Null;" ^
    "  Expand-Archive -Path $file -DestinationPath $tmp -Force;" ^
    "  $mvnDir=Get-ChildItem $tmp | Where-Object {$_.PSIsContainer} | Select-Object -First 1;" ^
    "  if(Test-Path $dest){ Remove-Item -Recurse -Force $dest }" ^
    "  Move-Item -Force $mvnDir.FullName $dest" ^
    "}" ^
    "& (Join-Path $dest 'bin\\mvn.cmd') -f \"%MAVEN_PROJECTBASEDIR%\\pom.xml\" %*"
  exit /b %ERRORLEVEL%
)

@REM Jar-based wrapper (requires maven-wrapper.jar to exist)
if not exist %WRAPPER_JAR% (
  echo [ERROR] Missing %WRAPPER_JAR%
  echo        If you want a lighter wrapper, set distributionType=only-script in maven-wrapper.properties.
  exit /b 1
)

set JAVA_EXE=java
if defined JAVA_HOME set JAVA_EXE=%JAVA_HOME%\bin\java

"%JAVA_EXE%" -jar %WRAPPER_JAR% -f "%MAVEN_PROJECTBASEDIR%\pom.xml" %*
exit /b %ERRORLEVEL%

