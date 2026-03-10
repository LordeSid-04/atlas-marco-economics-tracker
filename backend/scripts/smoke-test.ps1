param(
  [string]$BaseUrl = "http://127.0.0.1:8000",
  [string]$BearerToken = "",
  [switch]$SkipStooq
)

$ErrorActionPreference = "Stop"

function Invoke-Endpoint {
  param(
    [string]$Name,
    [string]$Method,
    [string]$Url,
    [string]$Body = ""
  )

  $headers = @{}
  if ($BearerToken) {
    $headers["Authorization"] = "Bearer $BearerToken"
  }

  try {
    if ($Method -eq "GET") {
      $resp = Invoke-RestMethod -Method Get -Uri $Url -Headers $headers -TimeoutSec 20
    } elseif ($Method -eq "POST") {
      $resp = Invoke-RestMethod -Method Post -Uri $Url -Headers $headers -ContentType "application/json" -Body $Body -TimeoutSec 20
    } else {
      throw "Unsupported method: $Method"
    }
    Write-Host "[PASS] $Name -> $Url" -ForegroundColor Green
    return $resp
  } catch {
    Write-Host "[FAIL] $Name -> $Url" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    throw
  }
}

Write-Host "Running smoke tests against $BaseUrl" -ForegroundColor Cyan

Invoke-Endpoint -Name "Health" -Method "GET" -Url "$BaseUrl/health" | Out-Null
if (-not $SkipStooq) {
  try {
    Invoke-Endpoint -Name "Stooq proxy" -Method "GET" -Url "$BaseUrl/api/stooq?symbol=cl.f" | Out-Null
  } catch {
    Write-Host "[WARN] Stooq is unavailable or quota-limited; continuing remaining checks." -ForegroundColor Yellow
  }
}
Invoke-Endpoint -Name "World Pulse" -Method "GET" -Url "$BaseUrl/api/v1/world-pulse/live" | Out-Null
Invoke-Endpoint -Name "Market feed status" -Method "GET" -Url "$BaseUrl/api/v1/market/feed-status" | Out-Null
Invoke-Endpoint -Name "Scenario options" -Method "GET" -Url "$BaseUrl/api/v1/scenario/options" | Out-Null

$scenarioBody = @{
  driver = "Interest Rates"
  event = "Rate Hike +100bp"
  region = "United States"
  severity = 70
  horizon = "12 Months"
} | ConvertTo-Json

Invoke-Endpoint -Name "Scenario run" -Method "POST" -Url "$BaseUrl/api/v1/scenario/run" -Body $scenarioBody | Out-Null
Invoke-Endpoint -Name "Historical analogues" -Method "GET" -Url "$BaseUrl/api/v1/historical/analogues" | Out-Null
Invoke-Endpoint -Name "Risk radar" -Method "GET" -Url "$BaseUrl/api/v1/risk-radar/live" | Out-Null

Write-Host "All smoke tests passed." -ForegroundColor Green
