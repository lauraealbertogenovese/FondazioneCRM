# Script PowerShell per eseguire tutti i test con coverage report
# Fondazione CRM - Test Suite Completa

Write-Host "🧪 Fondazione CRM - Test Suite Completa" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

$testResults = @()
$overallSuccess = $true

# Funzione per eseguire test di un servizio
function Run-ServiceTests {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [string]$TestCommand = "npm test -- --watchAll=false"
    )
    
    Write-Host "`n🔍 Testing $ServiceName..." -ForegroundColor Yellow
    Write-Host "Path: $ServicePath" -ForegroundColor Gray
    
    if (Test-Path $ServicePath) {
        Push-Location $ServicePath
        
        try {
            # Verifica se package.json esiste
            if (Test-Path "package.json") {
                # Installa dipendenze se node_modules non esiste
                if (!(Test-Path "node_modules")) {
                    Write-Host "Installing dependencies..." -ForegroundColor Blue
                    npm install
                }
                
                # Esegui test
                Write-Host "Running tests..." -ForegroundColor Blue
                $output = & cmd /c "npm run test:coverage 2>&1"
                $exitCode = $LASTEXITCODE
                
                if ($exitCode -eq 0) {
                    Write-Host "✅ $ServiceName tests PASSED" -ForegroundColor Green
                    $script:testResults += [PSCustomObject]@{
                        Service = $ServiceName
                        Status = "PASSED"
                        Coverage = "Available in coverage/"
                    }
                } else {
                    Write-Host "❌ $ServiceName tests FAILED" -ForegroundColor Red
                    Write-Host $output -ForegroundColor Red
                    $script:testResults += [PSCustomObject]@{
                        Service = $ServiceName
                        Status = "FAILED"
                        Coverage = "N/A"
                    }
                    $script:overallSuccess = $false
                }
            } else {
                Write-Host "⚠️ No package.json found in $ServiceName" -ForegroundColor Yellow
                $script:testResults += [PSCustomObject]@{
                    Service = $ServiceName
                    Status = "SKIPPED"
                    Coverage = "No package.json"
                }
            }
        }
        catch {
            Write-Host "❌ Error testing $ServiceName`: $_" -ForegroundColor Red
            $script:testResults += [PSCustomObject]@{
                Service = $ServiceName
                Status = "ERROR"
                Coverage = "Error occurred"
            }
            $script:overallSuccess = $false
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Host "⚠️ Service path not found: $ServicePath" -ForegroundColor Yellow
        $script:testResults += [PSCustomObject]@{
            Service = $ServiceName
            Status = "NOT_FOUND"
            Coverage = "Path not found"
        }
    }
}

# Test Backend Services
Write-Host "`n🔧 Backend Services Testing" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

Run-ServiceTests "Auth Service" "backend/services/auth"
Run-ServiceTests "Patient Service" "backend/services/patient"  
Run-ServiceTests "Clinical Service" "backend/services/clinical"
Run-ServiceTests "Group Service" "backend/services/group"

# Test Frontend
Write-Host "`n🎨 Frontend Testing" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

Run-ServiceTests "Frontend" "frontend" "npm run test:ci"

# Test API Gateway (se ha test)
Write-Host "`n🚪 API Gateway Testing" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

Run-ServiceTests "API Gateway" "backend/api-gateway"

# Risultati finali
Write-Host "`n📊 Test Results Summary" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor Magenta

$testResults | Format-Table -AutoSize

# Coverage Report Links
Write-Host "`n📈 Coverage Reports:" -ForegroundColor Blue
Write-Host "- Auth Service: backend/services/auth/coverage/index.html" -ForegroundColor Gray
Write-Host "- Patient Service: backend/services/patient/coverage/index.html" -ForegroundColor Gray  
Write-Host "- Clinical Service: backend/services/clinical/coverage/index.html" -ForegroundColor Gray
Write-Host "- Group Service: backend/services/group/coverage/index.html" -ForegroundColor Gray
Write-Host "- Frontend: frontend/coverage/lcov-report/index.html" -ForegroundColor Gray

# Statistiche finali
$passedTests = ($testResults | Where-Object { $_.Status -eq "PASSED" }).Count
$totalTests = $testResults.Count
$successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)

Write-Host "`n📈 Overall Statistics:" -ForegroundColor Blue
Write-Host "- Total Services: $totalTests" -ForegroundColor Gray
Write-Host "- Passed: $passedTests" -ForegroundColor Green
Write-Host "- Success Rate: $successRate%" -ForegroundColor $(if($successRate -ge 80) { "Green" } else { "Yellow" })

if ($overallSuccess) {
    Write-Host "`n🎉 All tests completed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n💥 Some tests failed. Check the results above." -ForegroundColor Red
    exit 1
}

# Note per miglioramento continuo
Write-Host "`n💡 Next Steps for Test Improvement:" -ForegroundColor Yellow
Write-Host "- Aim for 80%+ coverage on all services" -ForegroundColor Gray
Write-Host "- Add integration tests for API endpoints" -ForegroundColor Gray
Write-Host "- Implement E2E tests with Cypress" -ForegroundColor Gray
Write-Host "- Set up automated testing in CI/CD pipeline" -ForegroundColor Gray
