# Linktree/Bento.me-like Platform Backend

## Overview
This project is a backend implementation for a platform similar to Linktree or Bento.me, allowing users to create and manage their personalized link pages. The backend is built using **Node.js**, **Express.js**, and **MongoDB**, with authentication handled via **JWT**.

## Features
- **User Authentication** (Register, Login, JWT-based authentication)
- **Referral System** (Users can refer others and track referrals)
- **Password Recovery** (Generate password reset tokens)
- **API Endpoints for User Actions**
- **Security Enhancements** (Helmet, Rate Limiting)
- **Unit Testing** (Jest & Supertest for API testing)

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT & bcrypt.js
- **Middleware:** Helmet, Rate Limiting, CORS
- **Testing:** Jest, Supertest

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Steps to Run the Project
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/linktree-backend.git
   cd vomy-assign
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. Start the server:
   ```sh
   npm run dev
   ```

## API Endpoints
### **Authentication**
#### Register a User
```http
POST /api/register
```
**Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "referralCode": "optional_code"
}
```

#### Login
```http
POST /api/login
```
**Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Forgot Password
```http
POST /api/forgot-password
```
**Body:**
```json
{
  "email": "test@example.com"
}
```

### **Referrals**
#### Get User's Referrals
```http
GET /api/referrals
```

#### Get Referral Stats
```http
GET /api/referral-stats
```

## Running Tests
Run unit tests with:
```sh
npm test
```

## Author
**Prakhar Agarwal**

