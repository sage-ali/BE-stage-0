# HNG-14 Backend Stage 0: Name Gender Classification API

This is a Node.js-based RESTful API that classifies names by gender using the Genderize.io API. Built with Express and TypeScript, it features input validation, global error handling, and robust testing with Vitest.

## Features

- **Name Gender Classification**: Accurately predict the gender of a name.
- **Input Validation**: Ensures query parameters are valid strings.
- **Global Error Handling**: Consistent JSON error responses across the entire application.
- **CORS Support**: Configured to handle requests from any origin.
- **Unit & Integration Testing**: Comprehensive test coverage for services, middleware, and API routes.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/be-stage-0.git
   cd be-stage-0
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory (optional, defaults to port 3000):
   ```env
   PORT=3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Start production server:**
   ```bash
   npm start
   ```

## API Documentation

### 1. Health Check
Checks if the server is running.

- **Endpoint:** `GET /` or `GET /health`
- **Response:**
  ```json
  { "status": "ok" }
  ```

### 2. Name Classification
Classifies a given name by gender.

- **Endpoint:** `GET /api/classify`
- **Query Parameter:**
  - `name` (required, string): The name to be classified.
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "name": "luc",
      "gender": "male",
      "probability": 0.98,
      "sample_size": 1500,
      "is_confident": true,
      "processed_at": "2026-04-13T19:35:18.000Z"
    }
  }
  ```
- **Error Responses:**
  - **400 Bad Request:** Missing or empty name parameter.
  - **422 Unprocessable Entity:** Invalid name format or no prediction available.
  - **502 Bad Gateway:** External API error.
  - **504 Gateway Timeout:** External API timeout.

## Testing

Run the test suite using Vitest:
```bash
npm test
```

## Directory Structure

```text
src/
├── errors/       # Custom error classes
├── middleware/   # Express middleware (validation, error handler)
├── services/     # Business logic (API integration)
├── types/        # TypeScript interfaces and types
└── index.ts      # Application entry point and routes
```
