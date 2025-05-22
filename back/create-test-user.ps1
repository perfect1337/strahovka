# PowerShell script to create a test user via API call
Write-Host "Creating test user via API..."

$url = "http://localhost:8081/api/auth/create-test-user"
$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -ErrorAction Stop
    Write-Host "Success! Test user created/updated"
    Write-Host "Email: $($response.email)"
    Write-Host "Password: password123"
    Write-Host "ID: $($response.id)"
} catch {
    Write-Host "Error creating test user: $_"
}

Write-Host "Done! You can now log in with:"
Write-Host "Email: test@example.com"
Write-Host "Password: password123" 