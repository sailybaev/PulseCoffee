Guard Consistency: Most controllers use JwtOrRefreshGuard but auth controller uses JwtAuthGuard - consider standardizing
Error Handling: Guards could benefit from custom error messages
Token Validation: Consider implementing token blacklisting for logout
Rate Limiting: Add rate limiting guards for sensitive endpoints
Admin Protection: Consider additional security layers for admin-only operations