# Script per testare automaticamente il frontend e i servizi
Write-Host "🔍 FONDAZIONE CRM - TEST AUTOMATICO" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Test 1: Verifica servizi attivi
Write-Host "`n1. Verifico servizi..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3006" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend (3006): $($frontend.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend (3006): NON RAGGIUNGIBILE" -ForegroundColor Red
}

try {
    $auth = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Auth Service (3001): $($auth.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Auth Service (3001): NON RAGGIUNGIBILE" -ForegroundColor Red
}

try {
    $gateway = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ API Gateway (3000): $($gateway.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Gateway (3000): NON RAGGIUNGIBILE" -ForegroundColor Red
}

# Test 2: Test login utenti
Write-Host "`n2. Test login utenti..." -ForegroundColor Yellow
$users = @(
    @{username="admin2"; role="admin"},
    @{username="psicologo"; role="psychologist"},
    @{username="dottore"; role="doctor"},
    @{username="testuser2"; role="operator"}
)

foreach($user in $users) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -Body "{`"username`":`"$($user.username)`",`"password`":`"password123`"}" -ContentType "application/json" -ErrorAction Stop
        Write-Host "✅ $($user.username) ($($user.role)): LOGIN OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($user.username) ($($user.role)): LOGIN FAILED" -ForegroundColor Red
    }
}

# Test 3: Test database
Write-Host "`n3. Test database..." -ForegroundColor Yellow
try {
    $pazienti = docker exec fondazione-crm-postgres psql -U crm_user -d fondazione_crm -t -c "SELECT COUNT(*) FROM patient.patients;" 2>$null
    Write-Host "✅ Pazienti nel database: $($pazienti.Trim())" -ForegroundColor Green
    
    $cartelle = docker exec fondazione-crm-postgres psql -U crm_user -d fondazione_crm -t -c "SELECT COUNT(*) FROM clinical.clinical_records;" 2>$null
    Write-Host "✅ Cartelle cliniche: $($cartelle.Trim())" -ForegroundColor Green
    
    $visite = docker exec fondazione-crm-postgres psql -U crm_user -d fondazione_crm -t -c "SELECT COUNT(*) FROM clinical.visits;" 2>$null
    Write-Host "✅ Visite/Sessioni: $($visite.Trim())" -ForegroundColor Green
} catch {
    Write-Host "❌ Errore nel test database" -ForegroundColor Red
}

# Test 4: Test API Gateway routing
Write-Host "`n4. Test API Gateway routing..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -Body '{"username":"admin2","password":"password123"}' -ContentType "application/json"
    $token = $loginResponse.accessToken
    
    # Test Patient Service via API Gateway
    try {
        $patients = Invoke-RestMethod -Uri "http://localhost:3000/patients" -Headers @{Authorization="Bearer $token"} -TimeoutSec 5
        Write-Host "✅ Patient Service via API Gateway: OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ Patient Service via API Gateway: FAILED" -ForegroundColor Red
    }
    
    # Test Clinical Service via API Gateway  
    try {
        $clinical = Invoke-RestMethod -Uri "http://localhost:3000/clinical/records" -Headers @{Authorization="Bearer $token"} -TimeoutSec 5
        Write-Host "✅ Clinical Service via API Gateway: OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ Clinical Service via API Gateway: FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Impossibile ottenere token per test API Gateway" -ForegroundColor Red
}

Write-Host "`n🎯 Test completato!" -ForegroundColor Cyan
Write-Host "Usa questo script per verificare rapidamente lo stato del sistema." -ForegroundColor Gray
