# InvesTECHy — Backend API Documentation

> **Base URL:** ` https://unvicarious-camelia-porky.ngrok-free.dev/api`
> **Authentication:** Bearer Token (JWT) — Include in `Authorization` header as `Bearer <token>`

---

## Table of Contents

1. [Authentication](#1-authentication)
   - [Register](#11-register)
   - [Login](#12-login)
   - [Google OAuth](#13-google-oauth)
   - [Forgot Password](#14-forgot-password)
   - [Verify OTP](#15-verify-otp)
   - [Reset Password](#16-reset-password)
   - [Get Profile](#17-get-profile)
   - [Update Profile](#18-update-profile)
   - [Create Admin](#19-create-admin-admin-only)
2. [Projects](#2-projects)
   - [Create Project](#21-create-project)
   - [Get All Projects](#22-get-all-projects)
   - [Get Project Detail](#23-get-project-detail)
   - [Update / Run Simulation](#24-update--run-simulation)
   - [Delete Project](#25-delete-project)
   - [Get Project Reports](#26-get-project-reports)
   - [Get Project Report Detail](#27-get-project-report-detail)
   - [Upload Project Report PDF](#28-upload-project-report-pdf)
3. [Project Chatbot](#3-project-chatbot)
   - [Get Chat History](#31-get-chat-history)
   - [Send Chat Message](#32-send-chat-message)
4. [General Chatbot](#4-general-chatbot)
5. [Consultants](#5-consultants)
   - [Get All Consultants](#51-get-all-consultants)
   - [Get Consultant by ID](#52-get-consultant-by-id)
   - [Create Consultant](#53-create-consultant-admin-only)
   - [Update Consultant](#54-update-consultant-admin-only)
   - [Delete Consultant](#55-delete-consultant-admin-only)
6. [Admin](#6-admin)
   - [Get Dashboard Stats](#61-get-dashboard-stats)
7. [User Dashboard](#7-user-dashboard)
   - [Get User Dashboard](#71-get-user-dashboard)
   - [Update Dashboard Insight](#72-update-dashboard-insight)
   - [Reset Dashboard Insight](#73-reset-dashboard-insight)
8. [Error Responses](#8-error-responses)
9. [Project Status Lifecycle](#9-project-status-lifecycle)

---

## 1. Authentication

### 1.1 Register

Creates a new user account.

- **Endpoint:** `POST /auth/register`
- **Auth:** Not required

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "businessName": "PT Example"
}
```

| Field           | Type   | Required | Description                              |
|-----------------|--------|----------|------------------------------------------|
| name            | string | ✅       | Full name (also accepts `nama`)          |
| email           | string | ✅       | Unique email address                     |
| password        | string | ✅       | Account password                         |
| confirmPassword | string | ❌       | Must match `password` if provided        |
| businessName    | string | ❌       | Name of the user's business              |

#### Response `201 Created`

```json
{
  "success": true,
  "message": "Registration successful",
  "token": "<jwt_token>",
  "data": {
    "id": "64abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "businessName": "PT Example",
    "role": "user"
  }
}
```

---

### 1.2 Login

Authenticates a user and returns a JWT token.

- **Endpoint:** `POST /auth/login`
- **Auth:** Not required

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Response `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt_token>",
  "data": {
    "id": "64abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "user": {
    "id": "64abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "businessName": "PT Example",
    "role": "user"
  }
}
```

---

### 1.3 Google OAuth

Handles login/register via Google account.

#### Step 1 — Redirect to Google

- **Endpoint:** `GET /auth/google`
- **Auth:** Not required

> Redirect the user's browser to this URL. Google will handle the OAuth flow.

#### Step 2 — Google Callback

- **Endpoint:** `GET /auth/google/callback`
- **Auth:** Not required (handled by Google)

> The backend will redirect here after Google authenticates the user. Returns JWT token on success.

#### Response `200 OK` (on success)

```json
{
  "success": true,
  "message": "Google login successful",
  "token": "<jwt_token>",
  "user": {
    "id": "64abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://..."
  }
}
```

#### Failure Redirect

If Google authentication fails, the backend redirects to:
`GET /auth/failure` — Returns `401 Unauthorized`.

---

### 1.4 Forgot Password

Sends a 4-digit OTP to the user's registered email. OTP is valid for **10 minutes**.

- **Endpoint:** `POST /auth/forgot-password`
- **Auth:** Not required

#### Request Body

```json
{
  "email": "john@example.com"
}
```

#### Response `200 OK`

```json
{
  "success": true,
  "message": "OTP code has been sent to your email"
}
```

---

### 1.5 Verify OTP

Verifies the OTP sent to the user's email. Returns a short-lived `resetToken` to be used in the next step.

- **Endpoint:** `POST /auth/verify-otp`
- **Auth:** Not required

#### Request Body

```json
{
  "email": "john@example.com",
  "otp": "1234"
}
```

#### Response `200 OK`

```json
{
  "success": true,
  "message": "OTP verified",
  "resetToken": "<short_lived_jwt>"
}
```

> ⚠️ **Important:** Store `resetToken` and use it as the Bearer token in the next step ([Reset Password](#16-reset-password)).

---

### 1.6 Reset Password

Resets the user's password. Requires the `resetToken` from the previous step.

- **Endpoint:** `POST /auth/reset-password`
- **Auth:** Required (`resetToken` from `/verify-otp`)

#### Request Body

```json
{
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

#### Response `200 OK`

```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

---

### 1.7 Get Profile

Returns the profile of the currently authenticated user.

- **Endpoint:** `GET /auth/profile`
- **Auth:** Required

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "64abc...",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "businessName": "PT Example",
    "role": "user",
    "avatar": "https://...",
    "createdAt": "2025-04-01T00:00:00.000Z",
    "updatedAt": "2025-04-01T00:00:00.000Z"
  }
}
```

---

### 1.8 Update Profile

Updates the authenticated user's profile. Supports avatar image upload via `multipart/form-data`.

- **Endpoint:** `PUT /auth/profile`
- **Auth:** Required
- **Content-Type:** `multipart/form-data`

#### Request Body (form fields)

| Field        | Type   | Required | Description                          |
|--------------|--------|----------|--------------------------------------|
| firstName    | string | ❌       | First name                           |
| lastName     | string | ❌       | Last name                            |
| businessName | string | ❌       | Business name                        |
| avatar       | file   | ❌       | Profile picture file (max 5MB)       |

> `name` is automatically updated to `"firstName lastName"` if either is changed.

#### Response `200 OK`

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### 1.9 Create Admin *(Admin Only)*

Creates a new admin account. Requires admin authorization.

- **Endpoint:** `POST /auth/admins`
- **Auth:** Required (admin role)

#### Request Body

```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "adminpass123"
}
```

#### Response `201 Created`

```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": "64abc...",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## 2. Projects

> All project endpoints require authentication. `PUT` and `DELETE` also verify project ownership.

### 2.1 Create Project

Submits initial project data. The AI will generate a financial draft in the background. The response is returned immediately with the `projectId`, while AI drafting continues asynchronously.

- **Endpoint:** `POST /projects`
- **Auth:** Required (user role)

#### Request Body

```json
{
  "projectName": "IT Project - Healthcare"
  "industry": "Healthcare",
  "employeeCount": 120,
  "plan": "Implement an integrated hospital management system",
  "location": "Jakarta",
  "businessDomain": {
    "SM": 3,
    "CA": 4,
    "MI": 2,
    "CR": 3,
    "OR": 5
  },
  "technologyDomain": {
    "SA": 2,
    "DU": 3,
    "TU": 4,
    "IR": 2
  },
  "currentIT": [2, 3, 2],
  "futureIT": [4, 5, 4],
  "DM": [3, 4, 3],
  "RE": [2, 3, 3]
}
```

| Field            | Type     | Required | Description                                       |
|------------------|----------|----------|---------------------------------------------------|
| industry         | string   | ✅       | Business industry sector                          |
| employeeCount    | number   | ✅       | Number of employees (used to determine scale)     |
| plan             | string   | ✅       | IT investment plan description                    |
| location         | string   | ✅       | Business location                                 |
| businessDomain   | object   | ✅       | IE Business Domain scores (SM, CA, MI, CR, OR)    |
| technologyDomain | object   | ✅       | IE Technology Domain scores (SA, DU, TU, IR)      |
| currentIT        | number[] | ✅       | McFarlan: Current IT usage scores (array)         |
| futureIT         | number[] | ✅       | McFarlan: Future IT dependency scores (array)     |
| DM               | number[] | ✅       | McFarlan: Decision Making scores (array)          |
| RE               | number[] | ✅       | McFarlan: Risk/Environment scores (array)         |

##### Business Domain Fields (`businessDomain`)

| Key | Meaning                        |
|-----|-------------------------------|
| SM  | Strategic Management           |
| CA  | Competitive Advantage          |
| MI  | Management Information         |
| CR  | Competitive Response           |
| OR  | Organizational Risk            |

##### Technology Domain Fields (`technologyDomain`)

| Key | Meaning                        |
|-----|-------------------------------|
| SA  | Strategic Architecture         |
| DU  | Definitional Uncertainty       |
| TU  | Technical Uncertainty          |
| IR  | Infrastructure Risk            |

#### Response `201 Created`

```json
{
  "status": "success",
  "message": "Project data successfully submitted. AI is currently drafting.",
  "data": {
    "projectId": "64abc..."
  }
}
```

> 💡 **Note:** Poll `GET /projects/:id` to check the project status. The AI draft is ready when status changes from `DRAFTING` to `WAITING_USER_INPUT`.

---

### 2.2 Get All Projects

Returns a list of all projects belonging to the authenticated user.

- **Endpoint:** `GET /projects`
- **Auth:** Required

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Project list successfully retrieved.",
  "data": [
    {
      "id": "64abc...",
      "projectName": "IT Project - Healthcare"
      "industry": "Healthcare",
      "status": "WAITING_USER_INPUT",
      "date": "Mon, 7 Apr 2025"
    }
  ]
}
```

---

### 2.3 Get Project Detail

Returns full project data including AI draft, McFarlan result, and simulation history.

- **Endpoint:** `GET /projects/:id`
- **Auth:** Required

#### Path Parameters

| Param | Description       |
|-------|-------------------|
| id    | Project MongoDB ID |

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Project draft successfully retrieved.",
  "data": {
    "projectId": "64abc...",
    "status": "WAITING_USER_INPUT",
    "expiresAt": "2025-04-14T00:00:00.000Z",
    "calculatedScale": "Medium (51-250 employees)",
    "mcfarlan": {
      "averages": {
        "currentIT": 2.33,
        "futureIT": 4.33,
        "DM": 3.33,
        "RE": 2.67
      },
      "coordinates": {
        "x": 3.5,
        "y": 3.0
      },
      "quadrant": "Strategic"
    },
    "draft": {
      "capex": [
        { "item": "Server Hardware", "description": "Main application server", "nominal": 150000000 }
      ],
      "opex": [
        { "item": "Annual Maintenance", "description": "Yearly support contract", "nominal": 20000000 }
      ],
      "tangibleBenefits": [
        { "item": "Efficiency Savings", "description": "Reduced manual workload", "nominal": 80000000 }
      ],
      "intangibleBenefits": [
        { "item": "Brand Reputation", "description": "Improved customer trust", "nominal": 30000000 }
      ]
    }
  }
}
```

##### McFarlan Quadrant Values

| Quadrant   | Description                                |
|------------|--------------------------------------------|
| Support    | Low current and future strategic value     |
| Factory    | High current, low future strategic value   |
| Turnaround | Low current, high future strategic value   |
| Strategic  | High current and future strategic value    |

---

### 2.4 Update / Run Simulation

Submits user-defined financial data (CAPEX, OPEX, Benefits) to run a financial simulation. Results are saved to `simulationHistory`. Maximum **10 simulations** per project.

- **Endpoint:** `PUT /projects/:id`
- **Auth:** Required (project owner only)

#### Path Parameters

| Param | Description       |
|-------|-------------------|
| id    | Project MongoDB ID |

#### Request Body

```json
{
  "scenarioName": "Optimistic Scenario",
  "capex": [
    { "item": "Server Hardware", "description": "Main server", "nominal": 150000000 }
  ],
  "opex": [
    { "item": "Annual Maintenance", "description": "Support contract", "nominal": 20000000 }
  ],
  "tangibleBenefits": [
    { "item": "Efficiency Savings", "description": "Reduced workload", "nominal": 80000000 }
  ],
  "intangibleBenefits": [
    { "item": "Brand Reputation", "description": "Customer trust", "nominal": 30000000 }
  ],
  "inflationRate": 0.05,
  "taxRate": 0.11,
  "discountRate": 0.1,
  "years": 3
}
```

| Field             | Type     | Required | Default | Description                              |
|-------------------|----------|----------|---------|------------------------------------------|
| scenarioName      | string   | ❌       | `"Simulasi"` | Label for this simulation           |
| capex             | array    | ❌       | `[]`    | Capital expenditure items                |
| opex              | array    | ❌       | `[]`    | Operational expenditure items            |
| tangibleBenefits  | array    | ❌       | `[]`    | Quantifiable benefit items               |
| intangibleBenefits| array    | ❌       | `[]`    | Non-quantifiable benefit items           |
| inflationRate     | number   | ❌       | `0.05`  | Annual inflation rate (e.g. 0.05 = 5%)  |
| taxRate           | number   | ❌       | `0.11`  | Tax rate applied on net benefit          |
| discountRate      | number   | ❌       | `0.1`   | Discount rate for NPV calculation        |
| years             | number   | ❌       | `3`     | Projection period in years               |

##### Item Object Structure

```json
{ "item": "Item Name", "description": "Optional description", "nominal": 100000 }
```

#### Response `200 OK`

The full updated project document is returned, including the new entry added to `simulationHistory`.

```json
{
  "status": "success",
  "message": "Project successfully calculated and updated.",
  "data": {
    "_id": "64abc...",
    "status": "CALCULATED",
    "simulationHistory": [
      {
        "scenarioName": "Optimistic Scenario",
        "simulatedData": { ... },
        "simulationSettings": {
          "inflationRate": 0.05,
          "taxRate": 0.11,
          "discountRate": 0.1,
          "years": 3
        },
        "financialResults": {
          "npv": 45231450.50,
          "roi": 38.75,
          "paybackPeriod": 2.34,
          "breakEvenYear": 3,
          "breakEvenAnalysisDetail": [
            {
              "year": 1,
              "cost": 21000000,
              "benefit": 113050000,
              "cumulativeCost": 171000000,
              "cumulativeBenefit": 113050000,
              "net": -57950000
            }
          ],
          "ieScore": 52.5,
          "feasibilityStatus": "Feasible"
        },
        "calculatedAt": "2025-04-07T06:00:00.000Z"
      }
    ]
  }
}
```

##### Feasibility Status Reference

| Status           | IE Score Range |
|------------------|----------------|
| Highly Infeasible | ≤ -20         |
| Infeasible        | -19 to 10     |
| Fair              | 11 to 40      |
| Feasible          | 41 to 70      |
| Highly Feasible   | > 70          |

---

### 2.5 Delete Project

Deletes a project. Only projects with status `ERROR` can be deleted.

- **Endpoint:** `DELETE /projects/:id`
- **Auth:** Required (project owner only)

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Project successfully deleted."
}
```

---

### 2.6 Get Project Reports

Returns a list of all simulations/edits performed on a project, formatted as a report list for frontend consumption.

- **Endpoint:** `GET /projects/:id/reports`
- **Auth:** Required (project owner only)

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Project reports successfully retrieved.",
  "data": [
    {
      "scenarioName": "Optimistic Scenario",
      "date": "Mon, 7 Apr 2025",
      "roi": "38.75%",
      "ieScore": 52.5,
      "feasibilityStatus": "Feasible",
      "pdfUrl": "https://api.kada-it-investasi.com/reports/64abc.../0/pdf"
    }
  ]
}
```

| Field             | Type   | Description                                      |
| ----------------- | ------ | ------------------------------------------------ |
| scenarioName      | string | Reference name of the simulation/scenario        |
| date              | string | Date of simulation (Format: "Day, DD Mon YYYY")  |
| roi               | string | ROI formatted as a percentage string             |
| ieScore           | number | IE Score from the simulation results             |
| feasibilityStatus | string | Final feasibility status                         |
| pdfUrl            | string | Placeholder link for future PDF report download |

---

### 2.7 Get Project Report Detail

Returns full simulation data for a specific report in the simulation history.

- **Endpoint:** `GET /projects/:id/reports/:reportId`
- **Auth:** Required (project owner only)

#### Path Parameters

| Param    | Description                  |
|----------|------------------------------|
| id       | Project MongoDB ID           |
| reportId | Simulation Report MongoDB ID |

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Report detail successfully retrieved.",
  "data": {
    "_id": "64bc...",
    "scenarioName": "Optimistic Scenario",
    "simulatedData": {
      "capex": [...],
      "opex": [...],
      "tangibleBenefits": [...],
      "intangibleBenefits": [...]
    },
    "simulationSettings": {
      "inflationRate": 0.05,
      "taxRate": 0.11,
      "discountRate": 0.1,
      "years": 3
    },
    "financialResults": {
      "npv": 45231450.50,
      "roi": 38.75,
      ...
    },
    "pdfUrl": "https://...",
    "calculatedAt": "2025-04-07T06:00:00.000Z"
  }
}
```

---

### 2.8 Upload Project Report PDF

Uploads a PDF report for a specific simulation index. This will associate the PDF with that particular simulation in the history.

- **Endpoint:** `POST /projects/:id/reports/:reportIndex/pdf`
- **Auth:** Required (project owner only)
- **Content-Type:** `multipart/form-data`

#### Path Parameters

| Param       | Description                                      |
|-------------|--------------------------------------------------|
| id          | Project MongoDB ID                               |
| reportIndex | The 0-based index of the report in the history |

#### Request Body (form fields)

| Field | Type | Required | Description        |
|-------|------|----------|--------------------|
| pdf   | file | ✅       | PDF file (max 15MB) |

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Report PDF uploaded successfully.",
  "data": {
    "reportIndex": 0,
    "pdfUrl": "https://...",
    "reportPdfStorageKey": "reports/..."
  }
}
```

---

## 3. Project Chatbot

An AI chatbot scoped to a specific project. The AI is pre-seeded with project context (name, industry, scale, plan, feasibility status).

> All chatbot endpoints require authentication and ownership of the project.

---

### 3.1 Get Chat History

Returns the full saved conversation history for a project.

- **Endpoint:** `GET /projects/:id/chatbot`
- **Auth:** Required (project owner)

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Successfully retrieved project chat history.",
  "data": [
    { "role": "user", "content": "What is the ROI of this project?" },
    { "role": "assistant", "content": "Based on the simulation results, the ROI is 38.75%..." }
  ]
}
```

---

### 3.2 Send Chat Message

Sends a message to the project-scoped AI chatbot. The conversation history is persisted in the database. On the first message, the AI is automatically injected with project context.

- **Endpoint:** `POST /projects/:id/chatbot`
- **Auth:** Required (project owner)

#### Request Body

```json
{
  "message": "Can you explain the payback period result?"
}
```

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Chatbot response retrieved manually.",
  "data": {
    "text": "The payback period of 2.34 years means the investment will recover its costs in approximately 2 years and 4 months..."
  }
}
```

---

## 4. General Chatbot

A general-purpose chatbot endpoint, not tied to any specific project.

- **Endpoint:** `POST /chatbot`
- **Auth:** Not required

#### Request Body (Option A — Simple message)

```json
{
  "message": "What is Information Economics?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hello! How can I help you?" }
  ]
}
```

#### Request Body (Option B — Raw payload)

```json
{
  "payload": {
    "input": [
      {
        "role": "user",
        "content": [{ "type": "input_text", "text": "What is IT investment?" }]
      }
    ]
  }
}
```

> Either `payload` or `message` must be provided.

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Chatbot response retrieved successfully.",
  "data": {
    "raw": { ... },
    "text": "Information Economics (IE) is a framework used to evaluate..."
  }
}
```

---

## 5. Consultants

### 5.1 Get All Consultants

Returns a list of all registered IT consultants.

- **Endpoint:** `GET /consultants`
- **Auth:** Not required

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Consultant list successfully retrieved.",
  "data": [
    {
      "_id": "64abc...",
      "id": "consultant-001",
      "nama": "Dr. Budi Santoso",
      "spesialisasi": ["IT Strategy", "Digital Transformation"],
      "whatsapp": "https://wa.me/628123456789",
      "email": "mailto:budi@example.com",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### 5.2 Get Consultant by ID

Returns a single consultant by their custom `id` (e.g. `consultant-001`).

- **Endpoint:** `GET /consultants/:id`
- **Auth:** Not required

#### Path Parameters

| Param | Description                              |
|-------|------------------------------------------|
| id    | Consultant's custom ID (e.g. `consultant-001`) |

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Consultant detail successfully retrieved.",
  "data": {
    "id": "consultant-001",
    "nama": "Dr. Budi Santoso",
    "spesialisasi": ["IT Strategy"],
    "whatsapp": "https://wa.me/628123456789",
    "email": "mailto:budi@example.com"
  }
}
```

---

### 5.3 Create Consultant *(Admin Only)*

Creates a new consultant entry. The `id` is auto-generated (custom IDs are not accepted on creation).

- **Endpoint:** `POST /consultants`
- **Auth:** Required (admin role)

#### Request Body

```json
{
  "nama": "Dr. Budi Santoso",
  "spesialisasi": ["IT Strategy", "Digital Transformation"],
  "whatsapp": "https://wa.me/628123456789",
  "email": "mailto:budi@example.com"
}
```

| Field        | Type     | Required | Validation                                             |
|--------------|----------|----------|--------------------------------------------------------|
| nama         | string   | ✅       | Non-empty string                                       |
| spesialisasi | string[] | ✅       | Array of at least 1 non-empty string                   |
| whatsapp     | string   | ✅       | Must match `https://wa.me/{digits}` format             |
| email        | string   | ✅       | Must match `mailto:{email}` format                     |

#### Response `201 Created`

```json
{
  "status": "success",
  "message": "Consultant successfully created.",
  "data": { ... }
}
```

---

### 5.4 Update Consultant *(Admin Only)*

Updates an existing consultant. All fields are optional — only provide the fields to change.

- **Endpoint:** `PUT /consultants/:id`
- **Auth:** Required (admin role)

#### Path Parameters

| Param | Description                             |
|-------|-----------------------------------------|
| id    | Consultant's custom ID (`consultant-001`) |

#### Request Body (partial update supported)

```json
{
  "nama": "Dr. Budi Santoso, M.Kom",
  "spesialisasi": ["IT Strategy", "Cloud Computing"]
}
```

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Consultant successfully updated.",
  "data": { ... }
}
```

---

### 5.5 Delete Consultant *(Admin Only)*

Deletes a consultant by their custom `id`.

- **Endpoint:** `DELETE /consultants/:id`
- **Auth:** Required (admin role)

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Consultant successfully deleted.",
  "data": { ... }
}
```

---

## 6. Admin

### 6.1 Get Dashboard Stats

Returns project statistics for the admin dashboard.

- **Endpoint:** `GET /admin/dashboard`
- **Auth:** Required (admin role)

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Admin dashboard successfully retrieved.",
  "data": {
    "projectsToday": 5,
    "dailyLast7Days": [
      { "date": "2025-04-01", "total": 3 },
      { "date": "2025-04-02", "total": 7 }
    ],
    "weeklyLast4Weeks": [
      { "weekStart": "2025-03-10", "weekEnd": "2025-03-16", "total": 12 },
      { "weekStart": "2025-03-17", "weekEnd": "2025-03-23", "total": 18 }
    ],
    "yearlyTotal": 154
  }
}

---

## 7. User Dashboard

Endpoints for the authenticated user's personal dashboard insights.

### 7.1 Get User Dashboard

Returns analytics and insights for the user's projects.

- **Endpoint:** `GET /dashboard`
- **Auth:** Required

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Dashboard data retrieved successfully.",
  "data": { ... }
}
```

---

### 7.2 Update Dashboard Insight

Updates the user's dashboard AI insight manually (typically triggered by frontend when needed).

- **Endpoint:** `POST /dashboard/insight`
- **Auth:** Required

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Insight updated successfully."
}
```

---

### 7.3 Reset Dashboard Insight

Resets/clears the user's dashboard insight.

- **Endpoint:** `DELETE /dashboard/insight`
- **Auth:** Required

#### Response `200 OK`

```json
{
  "status": "success",
  "message": "Insight reset successfully."
}
```
```

---

## 8. Error Responses

All errors follow a consistent format.

#### Common Error Structure

```json
{
  "status": "error",
  "message": "Reason for the error."
}
```

or (for auth endpoints):

```json
{
  "success": false,
  "message": "Reason for the error."
}
```

#### Common HTTP Status Codes

| Code | Meaning                                              |
|------|------------------------------------------------------|
| 400  | Bad Request — Missing or invalid fields              |
| 401  | Unauthorized — Missing or invalid token              |
| 403  | Forbidden — Valid token but insufficient permissions |
| 404  | Not Found — Resource does not exist                  |
| 409  | Conflict — Duplicate resource (e.g. email already used) |
| 500  | Internal Server Error                                |

---

## 9. Project Status Lifecycle

A project moves through the following statuses:

```
POST /projects
      │
      ▼
 [DRAFTING]  ← AI is generating the financial draft in the background
      │
      ▼ (AI done)
 [WAITING_USER_INPUT]  ← Draft is ready; user can review and simulate
      │
      ▼ (PUT /projects/:id)
 [CALCULATED]  ← User ran a financial simulation; results are saved
      │
  (on error)
      ▼
 [ERROR]  ← AI drafting failed; project can be deleted
```

> **Expiry:** Projects automatically expire after **7 days** from creation (`expiresAt` field).

---

*Last updated: April 2026 — InvesTECHy Backend v1.1*
