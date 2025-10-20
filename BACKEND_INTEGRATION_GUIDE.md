# Breedify Frontend - Backend Integration Guide

## Overview
The Breedify frontend is fully configured to integrate with a FastAPI backend. This guide outlines all the API endpoints your backend team needs to implement.

## Base Configuration
- **API Base URL**: `http://localhost:8000/api` (configurable via `NEXT_PUBLIC_API_URL` environment variable)
- **Authentication**: JWT Bearer tokens stored in localStorage as `breedify_token`
- **Content-Type**: All requests use `application/json` except file uploads which use `multipart/form-data`

## Authentication Endpoints

### POST /auth/login
Login with email or phone number
**Request:**
\`\`\`json
{
  "email_or_phone": "officer@breedify.gov.in or 9876543210",
  "password": "demo123"
}
\`\`\`
**Response:**
\`\`\`json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Officer Name",
    "email": "officer@breedify.gov.in",
    "phone": "9876543210",
    "role": "field_officer"
  }
}
\`\`\`

### POST /auth/signup
Create new user account
**Request:**
\`\`\`json
{
  "email": "newuser@breedify.gov.in",
  "password": "secure_password",
  "name": "User Name",
  "role": "field_officer"
}
\`\`\`
**Response:** Same as login endpoint

### POST /auth/logout
Logout current user (requires Bearer token)
**Response:**
\`\`\`json
{
  "message": "Logged out successfully"
}
\`\`\`

### GET /auth/me
Get current authenticated user info (requires Bearer token)
**Response:**
\`\`\`json
{
  "id": "user_id",
  "name": "Officer Name",
  "email": "officer@breedify.gov.in",
  "phone": "9876543210",
  "role": "field_officer"
}
\`\`\`

## Image Analysis Endpoints

### POST /analysis/upload
Upload image for analysis
**Request:** multipart/form-data
- `image`: File (image file)
- `animal_type`: String ("cattle" or "buffalo")

**Response:**
\`\`\`json
{
  "image_id": "img_12345",
  "upload_status": "success",
  "message": "Image uploaded successfully"
}
\`\`\`

### POST /analysis/analyze
Start AI analysis on uploaded image
**Request:**
\`\`\`json
{
  "image_id": "img_12345"
}
\`\`\`
**Response:**
\`\`\`json
{
  "analysis_id": "analysis_12345",
  "status": "processing",
  "progress": 0
}
\`\`\`

### GET /analysis/{analysisId}
Get analysis results
**Response:**
\`\`\`json
{
  "analysis_id": "analysis_12345",
  "status": "completed",
  "animal_type": "cattle",
  "breed": "Holstein",
  "overall_score": 85,
  "confidence": 95,
  "measurements": {
    "body_length": 180,
    "height_at_withers": 145,
    "chest_width": 65,
    "rump_angle": 35
  },
  "traits": {
    "body_conformation": 82,
    "dairy_character": 88,
    "udder_quality": 85,
    "locomotion": 80
  }
}
\`\`\`

### POST /analysis/save
Save analysis results to database
**Request:**
\`\`\`json
{
  "analysis_id": "analysis_12345",
  "user_id": "user_id",
  "animal_type": "cattle",
  "breed": "Holstein",
  "overall_score": 85,
  "measurements": {...},
  "traits": {...}
}
\`\`\`
**Response:**
\`\`\`json
{
  "record_id": "record_12345",
  "message": "Analysis saved successfully"
}
\`\`\`

## Records Management Endpoints

### GET /records
Fetch livestock records with optional filters
**Query Parameters:**
- `animal_type`: "cattle" or "buffalo"
- `breed`: breed name
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD
- `limit`: number of records (default: 50)
- `offset`: pagination offset (default: 0)

**Response:**
\`\`\`json
{
  "records": [
    {
      "id": "record_12345",
      "user_id": "user_id",
      "animal_type": "cattle",
      "breed": "Holstein",
      "overall_score": 85,
      "created_at": "2025-10-19T10:30:00Z",
      "measurements": {...},
      "traits": {...}
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
\`\`\`

### GET /records/{recordId}
Get specific record details
**Response:** Single record object (same structure as above)

### POST /records
Create new record manually
**Request:**
\`\`\`json
{
  "animal_type": "cattle",
  "breed": "Holstein",
  "overall_score": 85,
  "measurements": {...},
  "traits": {...}
}
\`\`\`
**Response:**
\`\`\`json
{
  "id": "record_12345",
  "message": "Record created successfully"
}
\`\`\`

### PUT /records/{recordId}
Update existing record
**Request:** Same as POST /records
**Response:** Updated record object

### DELETE /records/{recordId}
Delete a record
**Response:**
\`\`\`json
{
  "message": "Record deleted successfully"
}
\`\`\`

### GET /records/analytics
Get analytics data for dashboard
**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD

**Response:**
\`\`\`json
{
  "total_records": 150,
  "cattle_count": 95,
  "buffalo_count": 55,
  "daily_data": [
    {
      "date": "2025-10-19",
      "cattle": 5,
      "buffalo": 3
    }
  ],
  "breed_distribution": {
    "Holstein": 45,
    "Jersey": 30,
    "Murrah": 25
  }
}
\`\`\`

## Dashboard Endpoints

### GET /dashboard/stats
Get dashboard statistics
**Response:**
\`\`\`json
{
  "total_analyses": 150,
  "cattle_analyzed": 95,
  "buffalo_analyzed": 55,
  "average_score": 82.5,
  "high_quality_count": 120
}
\`\`\`

### GET /dashboard/recent
Get recent analyses
**Query Parameters:**
- `limit`: number of records (default: 5)

**Response:**
\`\`\`json
{
  "recent": [
    {
      "id": "analysis_12345",
      "animal_type": "cattle",
      "breed": "Holstein",
      "score": 85,
      "created_at": "2025-10-19T10:30:00Z"
    }
  ]
}
\`\`\`

### GET /dashboard/trends
Get trend data for charts
**Query Parameters:**
- `days`: number of days to fetch (default: 7)

**Response:**
\`\`\`json
{
  "trends": [
    {
      "date": "2025-10-19",
      "cattle": 10,
      "buffalo": 5,
      "average_score": 83
    }
  ]
}
\`\`\`

## BPA Integration Endpoints

### POST /bpa/sync/{recordId}
Sync record to BPA system
**Response:**
\`\`\`json
{
  "bpa_id": "bpa_12345",
  "sync_status": "success",
  "message": "Record synced to BPA successfully"
}
\`\`\`

### GET /bpa/status/{recordId}
Get BPA sync status
**Response:**
\`\`\`json
{
  "record_id": "record_12345",
  "bpa_id": "bpa_12345",
  "sync_status": "synced",
  "last_sync": "2025-10-19T10:30:00Z"
}
\`\`\`

## Error Handling

All endpoints should return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (invalid/expired token)
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

Error response format:
\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
\`\`\`

## Environment Variables

Frontend expects these environment variables:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:8000/api
\`\`\`

## Authentication Flow

1. User logs in with email/phone and password
2. Backend returns JWT token
3. Frontend stores token in localStorage as `breedify_token`
4. All subsequent requests include `Authorization: Bearer {token}` header
5. If token expires (401 response), frontend clears token and redirects to login

## File Upload Handling

Image uploads use multipart/form-data:
- Maximum file size: 10MB (configure on backend)
- Supported formats: JPEG, PNG, WebP
- Field name: `image`

## Demo Credentials for Testing

\`\`\`
Email: officer@breedify.gov.in
Phone: 9876543210
Password: demo123

Email: vet@breedify.gov.in
Phone: 9876543211
Password: demo123

Email: admin@breedify.gov.in
Phone: 9876543212
Password: demo123
\`\`\`

## Testing the Integration

1. Start your FastAPI backend on `http://localhost:8000`
2. Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in your environment
3. The frontend will automatically use your backend instead of demo data
4. All API calls will be logged in browser console for debugging

## Notes

- All timestamps should be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- Phone numbers should be stored as strings (10 digits for India)
- Implement proper CORS headers to allow requests from frontend domain
- Use JWT with appropriate expiration time (recommend 24 hours)
- Implement rate limiting to prevent abuse
- All sensitive data should be validated and sanitized on backend
