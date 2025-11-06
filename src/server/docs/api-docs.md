# 🔐 Authentication API Documentation

## POST /api/auth/login
Authenticates a user and returns a JWT token.

### Request Body
```json
{
  "accountNumber": "1234567890",
  "password": "yourPassword"
}