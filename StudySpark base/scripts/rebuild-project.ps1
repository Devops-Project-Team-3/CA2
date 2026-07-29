# StudySpark rebuild script

Write-Host ""
Write-Host "========================================"
Write-Host " Rebuilding StudySpark"
Write-Host "========================================"
Write-Host ""

$projectPath = Split-Path -Parent $PSScriptRoot

# Check Docker installation
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Docker is not installed."
    exit 1
}

# Check Docker Desktop
docker info *> $null

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker Desktop is not running."
    exit 1
}

$composeFile = Join-Path $projectPath "docker-compose.yml"

if (-not (Test-Path $composeFile)) {
    Write-Host "[ERROR] docker-compose.yml was not found."
    exit 1
}

Set-Location $projectPath

Write-Host "[INFO] Stopping existing containers..."
docker compose down

Write-Host ""
Write-Host "[INFO] Rebuilding and starting StudySpark..."
docker compose up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Rebuild failed."
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host " StudySpark rebuilt successfully"
Write-Host "========================================"
Write-Host ""
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:5000"