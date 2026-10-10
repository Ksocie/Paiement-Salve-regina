Write-Host "==============================================" -ForegroundColor Green
Write-Host "  Deploiement en Production (Merge dev -> main) " -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# 1. Verification qu'il n'y a pas de modifications non commitees
$status = git status --porcelain
if ($status) {
    Write-Host "Attention : Vous avez des modifications non commitees." -ForegroundColor Red
    Write-Host "Commitez d'abord vos modifications avec .\build-and-push.ps1 avant de deployer." -ForegroundColor Yellow
    exit 1
}

# 2. Bascule sur la branche main
Write-Host "`n[1/4] Bascule sur la branche main..." -ForegroundColor Yellow
git checkout main
if ($LASTEXITCODE -ne 0) { exit 1 }

# 3. Synchronisation avec origin/main
Write-Host "`n[2/4] Mise a jour de la branche main..." -ForegroundColor Yellow
git pull origin main

# 4. Fusion de dev dans main
Write-Host "`n[3/4] Fusion de la branche dev dans main..." -ForegroundColor Yellow
git merge dev --no-edit
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du merge. Conflits detectes." -ForegroundColor Red
    exit 1
}

# 5. Push vers GitHub origin main (declenche Render automatiquement)
Write-Host "`n[4/4] Envoi vers GitHub origin/main (Render va deployer)..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du push sur main." -ForegroundColor Red
    exit 1
}

# 6. Rebascule automatique sur dev pour continuer a developper
Write-Host "`nRetour automatique sur la branche dev..." -ForegroundColor Cyan
git checkout dev

Write-Host "`n==================================================================" -ForegroundColor Green
Write-Host " SUCCES ! Le code a ete merge dans main et envoye a GitHub." -ForegroundColor Green
Write-Host " Render a detecte le push et lance le deploiement en production." -ForegroundColor Green
Write-Host " Vous etes actuellement repositionne sur la branche 'dev'." -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Green
