$body = @{
    logContent = "25 scenarios (1 failed, 24 passed)
70 steps (1 failed, 69 passed)
0m54.214s

Scenario: AMA - INC API - Negative Scenario - Validate Forbidden error response
  Given I have API credentials with restricted access
  When I send a request to a restricted resource
  Then the error message should match expected format
  Error: expect(received).toBe(expected)
  Expected: `"User is not authorized to access this resource with an explicit deny`"
  Received: `"User is not authorized to access this resource with an explicit deny in an identity-based policy`"
  at features/stepDefinitions/incident_validation.js:513:25"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/analyze' -Method Post -ContentType 'application/json' -Body $body
    Write-Host "API Response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}
