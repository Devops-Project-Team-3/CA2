Write-Host ""
Write-Host "========================================"
Write-Host " StudySpark Environment Check"
Write-Host "========================================"
Write-Host ""

$allChecksPassed = $true
$projectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "Checking Docker installation..."

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "[PASS] Docker is installed."
}
else {
    Write-Host "[FAIL] Docker is not installed."
    $allChecksPassed = $false
}

Write-Host "Checking whether Docker Desktop is running..."

docker info *> $null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[PASS] Docker Desktop is running."
}
else {
    Write-Host "[FAIL] Docker Desktop is not running."
    $allChecksPassed = $false
}

Write-Host "Checking Docker Compose..."

docker compose version *> $null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[PASS] Docker Compose is available."
}
else {
    Write-Host "[FAIL] Docker Compose is not available."
    $allChecksPassed = $false
}

$frontendPath = Join-Path $projectRoot "frontend"

if (Test-Path $frontendPath) {
    Write-Host "[PASS] Frontend folder exists."
}
else {
    Write-Host "[FAIL] Frontend folder is missing."
    $allChecksPassed = $false
}

$backendPath = Join-Path $projectRoot "backend"

if (Test-Path $backendPath) {
    Write-Host "[PASS] Backend folder exists."
}
else {
    Write-Host "[FAIL] Backend folder is missing."
    $allChecksPassed = $false
}

$composePath = Join-Path $projectRoot "docker-compose.yml"

if (Test-Path $composePath) {
    Write-Host "[PASS] docker-compose.yml exists."
}
else {
    Write-Host "[FAIL] docker-compose.yml is missing."
    $allChecksPassed = $false
}

$envExamplePath = Join-Path $projectRoot ".env.example"

if (Test-Path $envExamplePath) {
    Write-Host "[PASS] .env.example exists."
}
else {
    Write-Host "[FAIL] .env.example is missing."
    $allChecksPassed = $false
}

Write-Host ""

if ($allChecksPassed) {
    Write-Host "========================================"
    Write-Host " All environment checks passed."
    Write-Host " StudySpark is ready to run."
    Write-Host "========================================"
    exit 0
}
else {
    Write-Host "========================================"
    Write-Host " Some environment checks failed."
    Write-Host " Fix the failed checks before continuing."
    Write-Host "========================================"
    exit 1
}