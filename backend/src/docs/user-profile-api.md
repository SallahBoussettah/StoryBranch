# User Profile Management API Documentation

This document outlines the API endpoints for user profile management in the Interactive Branching Stories platform.

## Base URL

All endpoints are prefixed with `/api/users`.

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Get Basic Profile

Retrieves the basic profile information for the authenticated user.

- **URL**: `/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: Authenticated user

**Success Response:**
- **Code**: 200 OK
- **Content Example**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "username": "username",
      "role": "READER",
      "preferences": {
        "theme": "dark",
        "notifications": true
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Detailed Profile

Retrieves detailed profile information including achievements and reading statistics.

- **URL**: `/me/detailed`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: Authenticated user

**Success Response:**
- **Code**: 200 OK
- **Content Example**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "username": "username",
      "role": "READER",
      "preferences": {
        "theme": "dark",
        "notifications": true
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "statistics": {
      "storiesStarted": 5,
      "storiesCompleted": 3,
      "totalAchievements": 10,
      "completionRate": 60
    },
    "achievements": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "name": "Story Master",
        "description": "Completed all endings in a story",
        "iconUrl": "/icons/story-master.png",
        "earnedAt": "2023-01-15T00:00:00.000Z",
        "story": {
          "id": "123e4567-e89b-12d3-a456-426614174002",
          "title": "The Lost City",
          "coverImageUrl": "/covers/lost-city.jpg"
        }
      }
    ],
    "readingProgress": [
      {
        "storyId": "123e4567-e89b-12d3-a456-426614174002",
        "storyTitle": "The Lost City",
        "coverImageUrl": "/covers/lost-city.jpg",
        "startedAt": "2023-01-10T00:00:00.000Z",
        "lastActiveAt": "2023-01-15T00:00:00.000Z",
        "completedAt": "2023-01-15T00:00:00.000Z",
        "isCompleted": true,
        "discoveredEndings": 3
      }
    ]
  }
}
```

### Update Profile

Updates the profile information for the authenticated user.

- **URL**: `/me`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Permissions**: Authenticated user

**Request Body:**
```json
{
  "username": "newUsername",
  "email": "newemail@example.com",
  "preferences": {
    "theme": "light",
    "notifications": false
  }
}
```

**Success Response:**
- **Code**: 200 OK
- **Content Example**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "newemail@example.com",
      "username": "newUsername",
      "role": "READER",
      "preferences": {
        "theme": "light",
        "notifications": false
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Change Password

Changes the password for the authenticated user.

- **URL**: `/me/password`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Permissions**: Authenticated user

**Request Body:**
```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "newPassword123"
}
```

**Success Response:**
- **Code**: 200 OK
- **Content Example**:
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

### Delete Account

Deletes the authenticated user's account.

- **URL**: `/me`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Permissions**: Authenticated user

**Success Response:**
- **Code**: 204 No Content

## Role Management

### Request Role Upgrade

Requests an upgrade from reader to writer role.

- **URL**: `/me/role-upgrade`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: Reader role

**Success Response:**
- **Code**: 200 OK
- **Content Example**:
```json
{
  "status": "success",
  "message": "Role upgrade request submitted successfully",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "username": "username",
      "role": "READER",
      "preferences": {
        "theme": "dark",
        "notifications": true,
        "roleUpgradeRequested": true,
        "roleUpgradeRequestedAt": "2023-01-20T00:00:00.000Z"
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-20T00:00:00.000Z"
    }
  }
}
```

### Get Role Upgrade Requests (Admin Only)

Retrieves all pending role upgrade requests.

- **URL**: `/role-upgrade-requests`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: Admin role

**Success Response:**
- **Code**: 200 OK
- **Content Example**:
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "users": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user1@example.com",
        "username": "user1",
        "role": "READER",
        "preferences": {
          "theme": "dark",
          "notifications": true,
          "roleUpgradeRequested": true,
          "roleUpgradeRequestedAt": "2023-01-20T00:00:00.000Z"
        },
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-20T00:00:00.000Z"
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "email": "user2@example.com",
        "username": "user2",
        "role": "READER",
        "preferences": {
          "theme": "light",
          "notifications": false,
          "roleUpgradeRequested": true,
          "roleUpgradeRequestedAt": "2023-01-19T00:00:00.000Z"
        },
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-19T00:00:00.000Z"
      }
    ]
  }
}
```

### Update User Role (Admin Only)

Updates a user's role.

- **URL**: `/:id/role`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Permissions**: Admin role

**Request Body:**
```json
{
  "role": "WRITER"
}
```

**Success Response:**
- **Code**: 200 OK
- **Content Example**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "username": "username",
      "role": "WRITER",
      "preferences": {
        "theme": "dark",
        "notifications": true
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-20T00:00:00.000Z"
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": [
    { "field": "email", "message": "Must be a valid email address" }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "You are not logged in. Please log in to get access."
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "code": "FORBIDDEN",
  "message": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Something went wrong"
}
```