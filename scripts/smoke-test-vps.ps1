$base = "http://145.223.90.247:3000/api/v1"
$results = @()

function Add-Result($Name, $Status, $Pass, $Note) {
  $script:results += [pscustomobject]@{ Test = $Name; Status = $Status; Pass = $Pass; Note = $Note }
}

function Test-Route {
  param(
    [string]$Name,
    [string]$Method,
    [string]$Path,
    [hashtable]$Headers = @{},
    [object]$Body = $null,
    [int[]]$AcceptStatus = @(200)
  )
  $uri = "$base$Path"
  try {
    $params = @{ Uri = $uri; Method = $Method; UseBasicParsing = $true; Headers = $Headers }
    if ($null -ne $Body) {
      $params.ContentType = "application/json"
      $params.Body = ($Body | ConvertTo-Json -Depth 8)
    }
    $resp = Invoke-WebRequest @params
    $code = [int]$resp.StatusCode
    $note = $resp.Content
    if ($note.Length -gt 140) { $note = $note.Substring(0, 140) + "..." }
    Add-Result $Name $code ($AcceptStatus -contains $code) $note
    return $resp
  } catch {
    $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { $null }
    Add-Result $Name $code ($AcceptStatus -contains $code) "HTTP $code"
    return $null
  }
}

Write-Host "=== EngLexa VPS Smoke Test ===" -ForegroundColor Cyan
Write-Host "Target: $base`n"

Test-Route "GET /health" GET "/health" -AcceptStatus @(200) | Out-Null
Test-Route "GET /health/live" GET "/health/live" -AcceptStatus @(200, 404) | Out-Null

Test-Route "POST /spoken-english/ask (no auth)" POST "/spoken-english/ask" -Body @{ text = "hi" } -AcceptStatus @(401) | Out-Null
Test-Route "POST /spoken-english/voice (no auth)" POST "/spoken-english/voice" -Body @{ audioBase64 = "abc" } -AcceptStatus @(401) | Out-Null
Test-Route "POST /spoken-english/practice (no auth)" POST "/spoken-english/practice" -Body @{ userResponse = "hi" } -AcceptStatus @(401) | Out-Null
Test-Route "GET /confidence/history (no auth)" GET "/spoken-english/confidence/history" -AcceptStatus @(401) | Out-Null
Test-Route "GET /home/home-data (no auth)" GET "/home/home-data" -AcceptStatus @(401) | Out-Null
Test-Route "GET /home/quote-of-the-day (no auth)" GET "/home/quote-of-the-day" -AcceptStatus @(401) | Out-Null
Test-Route "GET /reading/beginner/daily_life (no auth)" GET "/reading/beginner/daily_life" -AcceptStatus @(401) | Out-Null
Test-Route "GET /reading/questions (no auth)" GET "/reading/questions" -AcceptStatus @(401, 404) | Out-Null

$email = "smoke_$((Get-Date).ToString('yyyyMMddHHmmss'))@englexa.test"
$token = $null
try {
  $reg = Invoke-RestMethod -Uri "$base/auth/register" -Method POST -ContentType "application/json" -Body (@{
      email    = $email
      password = "SmokeTest123!"
      country  = "US"
    } | ConvertTo-Json)
  $token = $reg.data.tokens.accessToken
  Add-Result "POST /auth/register" 201 $true $email
} catch {
  Add-Result "POST /auth/register" 400 $false "register failed"
}

if ($token) {
  $auth = @{ Authorization = "Bearer $token" }

  $homeResp = Test-Route "GET /home/home-data" GET "/home/home-data" -Headers $auth -AcceptStatus @(200)
  if ($homeResp) {
    $hj = $homeResp.Content | ConvertFrom-Json
    Add-Result "home-data.word_of_the_day" "-" ([bool]$hj.data.word_of_the_day.word) $hj.data.word_of_the_day.word
  }

  $quote = Test-Route "GET /home/quote-of-the-day" GET "/home/quote-of-the-day" -Headers $auth -AcceptStatus @(200)
  if ($quote) {
    $qj = $quote.Content | ConvertFrom-Json
    Add-Result "quote.text present" "-" ([bool]$qj.data.quote) ($qj.data.quote.ToString().Substring(0, [Math]::Min(60, $qj.data.quote.Length)))
  }

  Test-Route "GET /reading/questions?level=beginner" GET "/reading/questions?level=beginner" -Headers $auth -AcceptStatus @(200, 404) | Out-Null
  Test-Route "GET /reading/beginner/daily_life" GET "/reading/beginner/daily_life" -Headers $auth -AcceptStatus @(200, 400, 404) | Out-Null

  $ask = Test-Route "POST /spoken-english/ask" POST "/spoken-english/ask" -Headers $auth -Body @{
    text = "Explain present tense in one sentence."
  } -AcceptStatus @(200, 503)
  if ($ask) {
    $aj = $ask.Content | ConvertFrom-Json
    Add-Result "ask.english present" "-" ([bool]$aj.data.english) ("len=" + $aj.data.english.Length)
    Add-Result "ask envelope timestamp" "-" ([bool]$aj.timestamp) $aj.timestamp
  }

  $practice = Test-Route "POST /spoken-english/practice" POST "/spoken-english/practice" -Headers $auth -Body @{
    userResponse = "I practice English every morning."
    level        = "beginner"
  } -AcceptStatus @(200, 503)
  if ($practice) {
    $pj = $practice.Content | ConvertFrom-Json
    Add-Result "practice.prompt present" "-" ([bool]$pj.data.prompt) $pj.data.prompt
    Add-Result "practice.feedback present" "-" ([bool]($pj.data.feedback -or $pj.data.overallFeedback)) "ok"
    Add-Result "practice.confidenceScore" "-" ($null -ne $pj.data.confidenceScore) $pj.data.confidenceScore
  }

  $hist = Test-Route "GET /confidence/history" GET "/spoken-english/confidence/history" -Headers $auth -AcceptStatus @(200)
  if ($hist) {
    $hj = $hist.Content | ConvertFrom-Json
    Add-Result "history is array" "-" ($hj.data.history -is [Array]) ("count=" + $hj.data.history.Count)
  }

  Test-Route "POST /spoken-english/voice (invalid audio)" POST "/spoken-english/voice" -Headers $auth -Body @{
    audioBase64 = "not-valid-audio"
    mimeType    = "audio/mp4"
  } -AcceptStatus @(400, 500, 503) | Out-Null
}

$results | Format-Table -AutoSize
$passed = ($results | Where-Object { $_.Pass }).Count
Write-Host "`nSUMMARY: $passed / $($results.Count) checks passed" -ForegroundColor $(if ($passed -eq $results.Count) { "Green" } else { "Yellow" })
