param(
  [Parameter(Mandatory = $true)]
  [string]$Password,

  [string]$Host = "localhost",
  [int]$Port = 5432,
  [string]$User = "postgres",
  [string]$Database = "englexa"
)

$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
if (-not (Test-Path $psql)) {
  Write-Error "psql not found at $psql. Install PostgreSQL or adjust the path in this script."
  exit 1
}

$env:PGPASSWORD = $MyP@$$w0rd

Write-Host "Creating database '$Database' on ${Host}:${Port}..."
& $psql -h $Host -p $Port -U $User -d postgres -c "CREATE DATABASE $Database;" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Database may already exist — continuing."
}

$encodedPassword = [uri]::EscapeDataString($Password)
$databaseUrl = "postgresql://${User}:${encodedPassword}@${Host}:${Port}/${Database}?schema=public"

$envPath = Join-Path $PSScriptRoot "..\.env"
$content = Get-Content $envPath -Raw
$content = $content -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$databaseUrl`""
Set-Content -Path $envPath -Value $content -NoNewline

Write-Host "Updated backend/.env with your local PostgreSQL connection."
Write-Host "Next:"
Write-Host "  cd backend"
Write-Host "  npm run prisma:migrate"
Write-Host "  npm run db:seed"
