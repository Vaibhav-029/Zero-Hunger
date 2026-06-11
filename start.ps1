# FoodRescue AI - start all services (Windows PowerShell)
$ErrorActionPreference = "Continue"
$Root = $PSScriptRoot
$UseDevDb = $false

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }

function Test-PortOpen($port) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $port)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

function Wait-ForPort($port, $timeoutSec = 60) {
    $deadline = (Get-Date).AddSeconds($timeoutSec)
    while ((Get-Date) -lt $deadline) {
        if (Test-PortOpen $port) { return $true }
        Start-Sleep -Seconds 2
    }
    return $false
}

function Test-DockerRunning {
    try {
        docker info 2>$null | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Start-DockerDesktop {
    $dockerExe = "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
    if (-not (Test-Path $dockerExe)) { return $false }
    Write-Host "Starting Docker Desktop (may take 1-2 minutes)..."
    Start-Process $dockerExe | Out-Null
    $deadline = (Get-Date).AddMinutes(3)
    while ((Get-Date) -lt $deadline) {
        if (Test-DockerRunning) { return $true }
        Start-Sleep -Seconds 5
    }
    return $false
}

Write-Step "Checking database"
Set-Location $Root

if (Test-DockerRunning) {
    docker compose up -d 2>$null
    if (Wait-ForPort 5432 30) {
        Write-Host "PostgreSQL ready (Docker)." -ForegroundColor Green
        $UseDevDb = $false
    } else {
        Write-Warning "Docker is running but PostgreSQL is not ready. Using embedded H2."
        $UseDevDb = $true
    }
} else {
    if (Start-DockerDesktop) {
        docker compose up -d 2>$null
        if (Wait-ForPort 5432 90) {
            Write-Host "PostgreSQL ready (Docker)." -ForegroundColor Green
            $UseDevDb = $false
        } else {
            Write-Warning "PostgreSQL not ready. Using embedded H2."
            $UseDevDb = $true
        }
    } else {
        Write-Warning "Docker unavailable. Using embedded H2 (no Docker required)."
        $UseDevDb = $true
    }
}

$zeroHungerCmd = if ($UseDevDb) {
    "Set-Location '$Root\zero-hunger'; `$env:SPRING_PROFILES_ACTIVE='dev'; .\mvnw.cmd spring-boot:run"
} else {
    "Set-Location '$Root\zero-hunger'; `$env:SPRING_PROFILES_ACTIVE=''; `$env:DB_URL='jdbc:postgresql://localhost:5432/epoch_db'; `$env:DB_USER='postgres'; `$env:DB_PASS='postgres'; .\mvnw.cmd spring-boot:run"
}

$donationCmd = if ($UseDevDb) {
    "Set-Location '$Root\smart-donation-module\backend'; `$env:SPRING_PROFILES_ACTIVE='dev'; .\mvnw.cmd spring-boot:run"
} else {
    "Set-Location '$Root\smart-donation-module\backend'; `$env:SPRING_PROFILES_ACTIVE=''; `$env:DB_URL='jdbc:postgresql://localhost:5432/foodrescue_donations'; `$env:DB_USER='postgres'; `$env:DB_PASS='postgres'; `$env:CORS_ALLOWED_ORIGINS='http://localhost:3005'; .\mvnw.cmd spring-boot:run"
}

Write-Step "Starting zero-hunger backend (port 8080)"
Start-Process powershell -ArgumentList @("-NoExit", "-Command", $zeroHungerCmd) | Out-Null

Write-Step "Starting smart-donation backend (port 8085)"
Start-Process powershell -ArgumentList @("-NoExit", "-Command", $donationCmd) | Out-Null

Write-Step "Starting ML service (port 8000)"
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$Root\ml-service'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
) | Out-Null

Write-Step "Waiting for backends..."
if (-not (Wait-ForPort 8080 150)) { Write-Warning "zero-hunger backend (8080) not ready yet - check its window" }
if (-not (Wait-ForPort 8085 150)) { Write-Warning "smart-donation backend (8085) not ready yet - check its window" }
if (-not (Wait-ForPort 8000 60)) { Write-Warning "ML service (8000) not ready yet - check its window" }

Write-Step "Starting main frontend (port 5173)"
if (-not (Test-Path "$Root\frontend\node_modules")) {
    Set-Location "$Root\frontend"; npm ci
}
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$Root\frontend'; npm run dev"
) | Out-Null

Write-Step "Starting donation frontend (port 3005)"
if (-not (Test-Path "$Root\smart-donation-module\frontend\node_modules")) {
    Set-Location "$Root\smart-donation-module\frontend"; npm ci
}
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$Root\smart-donation-module\frontend'; npm run dev"
) | Out-Null

Set-Location $Root

$dbMode = if ($UseDevDb) { "embedded H2" } else { "PostgreSQL (Docker)" }
Write-Host "`n========================================" -ForegroundColor Green
Write-Host " FoodRescue AI is starting!" -ForegroundColor Green
Write-Host " Database: $dbMode" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host " Main site:       http://localhost:5173"
Write-Host " Donations:       http://localhost:3005/donate"
Write-Host " ML Pipeline:     http://localhost:5173/pipeline"
Write-Host "`nDemo logins: donor/donor123, ngo/ngo123, driver/driver123"
Write-Host "Stop with: .\stop.ps1`n"
