# StudySpark stop script

Write-Host ""
Write-Host "========================================"
Write-Host " Stopping StudySpark"
Write-Host "========================================"
Write-Host ""

# Get the StudySpark base folder
$projectPath = Split-Path -Parent $PSScriptRoot

# Check whether Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Docker is not installed."
    exit 1
}

# Check whether Docker Desktop is running
docker info *> $null

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker Desktop is not running."
    Write-Host "Please start Docker Desktop and try again."
    exit 1
}

# Check whether docker-compose.yml exists
$composeFile = Join-Path $projectPath "docker-compose.yml"

if (-not (Test-Path $composeFile)) {
    Write-Host "[ERROR] docker-compose.yml was not found."
    exit 1
}

Set-Location $projectPath

Write-Host "[INFO] Stopping frontend and backend containers..."
Write-Host ""

docker compose down

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] StudySpark failed to stop."
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host " StudySpark stopped successfully"
Write-Host "========================================"