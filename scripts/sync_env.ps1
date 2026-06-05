# Copy Neon URLs from .ENV into Prisma-standard .env
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$src = Join-Path $root ".ENV"
$dst = Join-Path $root ".env"
if (-not (Test-Path $src)) { Write-Error ".ENV not found"; exit 1 }
$lines = Get-Content $src | Where-Object { $_.Trim() -match '^postgresql://' }
if ($lines.Count -lt 2) { Write-Error "Expected 2 postgresql URLs in .ENV"; exit 1 }
@"
DATABASE_URL="$($lines[0].Trim())"
DIRECT_URL="$($lines[1].Trim())"
"@ | Set-Content $dst -Encoding utf8
Write-Host "Wrote .env with DATABASE_URL and DIRECT_URL"
