param(
    [string]$Message = "mise a jour de l'application Salve Regina"
)

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  Chorale Salve Regina - Build & Deploy Auto  " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 1. Compilation du Frontend Angular
Write-Host "`n[1/4] Compilation du Frontend Angular..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du build Angular." -ForegroundColor Red
    Set-Location -Path "$PSScriptRoot"
    exit 1
}

# 2. Synchronisation du dist vers le Backend static
Write-Host "`n[2/4] Synchronisation des fichiers statiques vers Spring Boot..." -ForegroundColor Yellow
Copy-Item -Path "$PSScriptRoot\frontend\dist\frontend\browser\*" -Destination "$PSScriptRoot\backend\src\main\resources\static\" -Recurse -Force

# 3. Compilation du Backend Spring Boot
Write-Host "`n[3/4] Compilation du Backend Spring Boot..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"
.\gradlew.bat bootJar -x test
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du build Spring Boot." -ForegroundColor Red
    Set-Location -Path "$PSScriptRoot"
    exit 1
}

# 4. Commit et Push Git vers GitHub (Déclenchement Render)
Write-Host "`n[4/4] Envoi vers GitHub pour déploiement Render..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot"
git add -A
git commit -m "$Message"
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du push Git." -ForegroundColor Red
    exit 1
}

Write-Host "`nSucces ! Les modifications sont en ligne sur GitHub et en cours de deploiement sur Render." -ForegroundColor Green
