param(
  [string]$EnvPath = (Join-Path $PSScriptRoot "..\.env")
)

function Get-EnvMap([string]$Path) {
  $map = @{}
  if (-not (Test-Path $Path)) { return $map }
  Get-Content $Path | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
    $parts = $_ -split '=', 2
    $k = $parts[0].Trim()
    $v = if ($parts.Count -gt 1) { $parts[1].Trim().Trim('"').Trim("'") } else { '' }
    $map[$k] = $v
  }
  return $map
}

Write-Host "=== EngLexa .env audit: $EnvPath ===" -ForegroundColor Cyan
$envMap = Get-EnvMap $EnvPath
if ($envMap.Count -eq 0) {
  Write-Host "ERROR: file missing or empty" -ForegroundColor Red
  exit 1
}

$script:fail = $false

function Check-Var {
  param(
    [string]$Key,
    [int]$MinLen = 1,
    [switch]$Secret
  )
  $val = $envMap[$Key]
  if (-not $val) {
    Write-Host ("  {0,-22} MISSING" -f $Key) -ForegroundColor Red
    $script:fail = $true
    return
  }
  if ($val.Length -lt $MinLen) {
    Write-Host ("  {0,-22} TOO SHORT (len={1})" -f $Key, $val.Length) -ForegroundColor Red
    $script:fail = $true
    return
  }
  if ($Secret) {
    Write-Host ("  {0,-22} set (len={1})" -f $Key, $val.Length) -ForegroundColor Green
  } else {
    Write-Host ("  {0,-22} {1}" -f $Key, $val) -ForegroundColor Green
  }
}

Check-Var -Key DATABASE_URL -MinLen 10 -Secret
Check-Var -Key JWT_ACCESS_SECRET -MinLen 32 -Secret
Check-Var -Key JWT_REFRESH_SECRET -MinLen 32 -Secret
Check-Var -Key PORT
Check-Var -Key NODE_ENV

$hasOpenAi = $envMap['OPENAI_API_KEY'] -and $envMap['OPENAI_API_KEY'].Length -ge 20
$hasSpeech = $envMap['SPEECH_API_KEY'] -and $envMap['SPEECH_API_KEY'].Length -ge 20
if ($hasOpenAi) {
  Check-Var -Key OPENAI_API_KEY -MinLen 20 -Secret
} else {
  Write-Host "  OPENAI_API_KEY         EMPTY/MISSING" -ForegroundColor Red
}
if ($hasSpeech) {
  Check-Var -Key SPEECH_API_KEY -MinLen 20 -Secret
} else {
  Write-Host "  SPEECH_API_KEY         (optional, empty)"
}
if (-not $hasOpenAi -and -not $hasSpeech) {
  Write-Host "  >> AI routes will return 500 until OPENAI_API_KEY is set" -ForegroundColor Red
  $script:fail = $true
}

Write-Host ""
if ($script:fail) {
  Write-Host "RESULT: ISSUES FOUND" -ForegroundColor Red
  exit 1
}
Write-Host "RESULT: OK" -ForegroundColor Green
