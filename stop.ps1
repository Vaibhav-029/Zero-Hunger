# FoodRescue AI - stop services (Windows PowerShell)
$Root = $PSScriptRoot

Write-Host "Stopping Docker PostgreSQL..." -ForegroundColor Cyan
Set-Location $Root
docker compose down 2>$null

Write-Host "Stopping Java/Node/Python dev processes on project ports..." -ForegroundColor Cyan
$ports = @(5173, 3005, 8080, 8085, 8000)
foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        if ($conn.OwningProcess -and $conn.OwningProcess -ne 0) {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Done. Close any remaining PowerShell windows that were opened by start.ps1." -ForegroundColor Green
