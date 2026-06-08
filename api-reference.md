# Companion.io API Reference

This document provides a comprehensive reference for the Companion.io MERN stack backend. Use this guide to integrate the frontend application with the REST APIs and WebSockets.

---

## 1. General Setup & Authentication

### Base URL
* **Development:** `http://localhost:3001`
* **Production (Railway):** `https://your-railway-app-url.railway.app`

### HTTP Headers
For all protected routes, you must attach the JWT token in the `Authorization` header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 2. Data Types & Enums

### User Roles
* `seeker`: A customer booking a companion.
* `provider`: A companion offering services.

### Booking Types
* `hourly`: Session billed per hour.
* `daily`: Session billed per day.
* `monthly`: Session billed per month.

### Booking Statuses
* `pending`: Initial state when seeker books (unpaid or waiting for approval).
* `accepted`: Provider accepted the booking (payment verified).
* `active`: The companion session is currently in progress.
* `declined`: Provider rejected the booking request.
* `completed`: Either party marked the session as successfully finished.
* `cancelled`: Booking cancelled before execution.

---

## 3. REST API Endpoints

### Authentication `/api/auth`

#### Register User
* **Method & Path:** `POST /api/auth/register`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "password": "securepassword123",
    "role": "seeker"
  }
  ```
* **Success Response (`201 Created`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec49f83f2e3a6828a2a1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "9876543210",
      "role": "seeker",
      "isVerified": false,
      "createdAt": "2026-06-05T10:00:00.000Z"
    }
  }
  ```

#### Login User
* **Method & Path:** `POST /api/auth/login`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec49f83f2e3a6828a2a1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "9876543210",
      "role": "seeker",
      "isVerified": false,
      "createdAt": "2026-06-05T10:00:00.000Z"
    }
  }
  ```

#### Get Current User
* **Method & Path:** `GET /api/auth/me`
* **Access:** Protected
* **Success Response (`200 OK`):**
  ```json
  {
    "user": {
      "id": "60d5ec49f83f2e3a6828a2a1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "9876543210",
      "role": "seeker",
      "isVerified": false,
      "createdAt": "2026-06-05T10:00:00.000Z"
    }
  }
  ```

---

### Providers `/api/providers`

#### List Active Providers
* **Method & Path:** `GET /api/providers`
* **Access:** Public
* **Query Parameters:**
  * `minPrice` (Number) - filter by hourly rate
  * `maxPrice` (Number) - filter by hourly rate
  * `tags` (String) - comma-separated list of tags (e.g. `listener,gaming buddy`)
  * `page` (Number) - defaults to 1
  * `limit` (Number) - defaults to 10
* **Success Response (`200 OK`):**
  ```json
  {
    "total": 15,
    "page": 1,
    "pages": 2,
    "limit": 10,
    "data": [
      {
        "_id": "60d5ec49f83f2e3a6828a2b5",
        "userId": {
          "_id": "60d5ec49f83f2e3a6828a2a3",
          "name": "John Companion",
          "email": "john@example.com",
          "phone": "9998887776",
          "role": "provider"
        },
        "bio": "Experienced gaming buddy and listener.",
        "photos": ["https://res.cloudinary.com/demo/image/upload/v1234/img1.jpg"],
        "tags": ["gaming buddy", "listener"],
        "hourlyRate": 15,
        "dailyRate": 100,
        "monthlyRate": 2000,
        "isLive": true,
        "avgRating": 4.8,
        "totalReviews": 12,
        "createdAt": "2026-06-05T10:15:00.000Z"
      }
    ]
  }
  ```

#### Get Single Provider Detail
* **Method & Path:** `GET /api/providers/:id`
* **Access:** Public
* **Success Response (`200 OK`):**
  ```json
  {
    "_id": "60d5ec49f83f2e3a6828a2b5",
    "userId": {
      "_id": "60d5ec49f83f2e3a6828a2a3",
      "name": "John Companion",
      "email": "john@example.com",
      "phone": "9998887776",
      "role": "provider"
    },
    "bio": "Experienced gaming buddy and listener.",
    "photos": [
      "https://res.cloudinary.com/demo/image/upload/v1234/img1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1234/img2.jpg"
    ],
    "tags": ["gaming buddy", "listener"],
    "hourlyRate": 15,
    "dailyRate": 100,
    "monthlyRate": 2000,
    "isLive": true,
    "avgRating": 4.8,
    "totalReviews": 12,
    "createdAt": "2026-06-05T10:15:00.000Z"
  }
  ```

#### Create or Update Provider Profile
* **Method & Path:** `POST /api/providers/profile`
* **Access:** Protected (Provider only)
* **Headers:** `Content-Type: multipart/form-data`
* **Multipart Form Fields:**
  * `bio` (String)
  * `tags` (String, comma-separated or Array)
  * `hourlyRate` (Number)
  * `dailyRate` (Number)
  * `monthlyRate` (Number)
  * `photos` (Files, maximum 5 photos)
* **Success Response (`200 OK` or `210 Created`):**
  ```json
  {
    "message": "Profile updated successfully",
    "profile": {
      "_id": "60d5ec49f83f2e3a6828a2b5",
      "userId": "60d5ec49f83f2e3a6828a2a3",
      "bio": "Updated bio text...",
      "photos": [
        "https://res.cloudinary.com/demo/image/upload/v1234/img1.jpg",
        "https://res.cloudinary.com/demo/image/upload/v5678/new_img.jpg"
      ],
      "tags": ["gaming buddy", "listener", "new tag"],
      "hourlyRate": 20,
      "dailyRate": 120,
      "monthlyRate": 2200,
      "isLive": true,
      "avgRating": 4.8,
      "totalReviews": 12,
      "createdAt": "2026-06-05T10:15:00.000Z"
    }
  }
  ```

#### Toggle Live Status
* **Method & Path:** `PUT /api/providers/toggle-live`
* **Access:** Protected (Provider only)
* **Success Response (`200 OK`):**
  ```json
  {
    "message": "Provider status set to Live",
    "isLive": true,
    "profile": {
      "_id": "60d5ec49f83f2e3a6828a2b5",
      "userId": "60d5ec49f83f2e3a6828a2a3",
      "isLive": true
    }
  }
  ```

---

### Bookings `/api/bookings`

#### Create Booking Request
* **Method & Path:** `POST /api/bookings`
* **Access:** Protected (Seeker only)
* **Request Body:**
  ```json
  {
    "provider": "60d5ec49f83f2e3a6828a2a3",
    "type": "hourly",
    "duration": 4,
    "startTime": "2026-06-10T14:00:00.000Z"
  }
  ```
* **Success Response (`201 Created`):**
  ```json
  {
    "message": "Booking created successfully",
    "booking": {
      "_id": "60d5f2a1f83f2e3a6828a2c1",
      "seeker": "60d5ec49f83f2e3a6828a2a1",
      "provider": "60d5ec49f83f2e3a6828a2a3",
      "type": "hourly",
      "duration": 4,
      "startTime": "2026-06-10T14:00:00.000Z",
      "amount": 60,
      "status": "pending",
      "isPaid": false,
      "createdAt": "2026-06-05T11:00:00.000Z"
    }
  }
  ```

#### Get My Bookings
* **Method & Path:** `GET /api/bookings/mine`
* **Access:** Protected (Seeker or Provider)
* **Success Response (`200 OK`):**
  ```json
  [
    {
      "_id": "60d5f2a1f83f2e3a6828a2c1",
      "seeker": {
        "_id": "60d5ec49f83f2e3a6828a2a1",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "9876543210"
      },
      "provider": {
        "_id": "60d5ec49f83f2e3a6828a2a3",
        "name": "John Companion",
        "email": "john@example.com",
        "phone": "9998887776"
      },
      "type": "hourly",
      "duration": 4,
      "startTime": "2026-06-10T14:00:00.000Z",
      "amount": 60,
      "status": "pending",
      "isPaid": false,
      "createdAt": "2026-06-05T11:00:00.000Z"
    }
  ]
  ```

#### Accept Booking
* **Method & Path:** `PUT /api/bookings/:id/accept`
* **Access:** Protected (Provider of the booking only)
* **Success Response (`200 OK`):**
  ```json
  {
    "message": "Booking accepted successfully",
    "booking": {
      "_id": "60d5f2a1f83f2e3a6828a2c1",
      "status": "accepted"
    }
  }
  ```

#### Decline Booking
* **Method & Path:** `PUT /api/bookings/:id/decline`
* **Access:** Protected (Provider of the booking only)
* **Success Response (`200 OK`):**
  ```json
  {
    "message": "Booking declined successfully",
    "booking": {
      "_id": "60d5f2a1f83f2e3a6828a2c1",
      "status": "declined"
    }
  }
  ```

#### Complete Booking
* **Method & Path:** `PUT /api/bookings/:id/complete`
* **Access:** Protected (Seeker or Provider of the booking)
* **Success Response (`200 OK`):**
  ```json
  {
    "message": "Booking marked as completed",
    "booking": {
      "_id": "60d5f2a1f83f2e3a6828a2c1",
      "status": "completed"
    }
  }
  ```

---

### Payments `/api/payment`

#### Create Razorpay Order
* **Method & Path:** `POST /api/payment/create-order`
* **Access:** Protected (Seeker of the booking only)
* **Request Body:**
  ```json
  {
    "bookingId": "60d5f2a1f83f2e3a6828a2c1"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "orderId": "order_HpHx34kds83j2a",
    "amount": 6000,
    "currency": "INR",
    "keyId": "rzp_test_Sx46e4wQakkufM"
  }
  ```

#### Verify Payment Signature
* **Method & Path:** `POST /api/payment/verify`
* **Access:** Protected
* **Request Body:**
  ```json
  {
    "razorpayOrderId": "order_HpHx34kds83j2a",
    "razorpayPaymentId": "pay_HpHz93kdlA8f3s",
    "razorpaySignature": "8d3jfdla93kdk3jsldk937402kdls...",
    "bookingId": "60d5f2a1f83f2e3a6828a2c1"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Payment verified successfully",
    "booking": {
      "_id": "60d5f2a1f83f2e3a6828a2c1",
      "status": "accepted",
      "isPaid": true,
      "razorpayPaymentId": "pay_HpHz93kdlA8f3s"
    }
  }
  ```

---

### Messages `/api/messages`

#### Get Chat History
* **Method & Path:** `GET /api/messages/:bookingId`
* **Access:** Protected (Seeker or Provider of the booking)
* **Success Response (`200 OK`):** Returns last 50 messages sorted by `createdAt` ascending.
  ```json
  [
    {
      "_id": "60d5f992f83f2e3a6828a301",
      "bookingId": "60d5f2a1f83f2e3a6828a2c1",
      "sender": "60d5ec49f83f2e3a6828a2a1",
      "text": "Hello! I have created the booking request.",
      "isRead": true,
      "createdAt": "2026-06-05T11:05:00.000Z",
      "updatedAt": "2026-06-05T11:05:10.000Z"
    }
  ]
  ```

---

## 4. Socket.io Event Reference

Connect your socket client to the Base URL.

### Client-to-Server Events

#### Join Chat Room
Join the room specific to a booking to receive real-time messages.
* **Event name:** `join-room`
* **Payload:** `bookingId` (String)
  ```javascript
  socket.emit('join-room', '60d5f2a1f83f2e3a6828a2c1');
  ```

#### Send Message
Send a message in the current room.
* **Event name:** `send-message`
* **Payload:** `{ bookingId, senderId, text }` (Object)
  ```javascript
  socket.emit('send-message', {
    bookingId: "60d5f2a1f83f2e3a6828a2c1",
    senderId: "60d5ec49f83f2e3a6828a2a1",
    text: "Hey! Are we still on for tomorrow?"
  });
  ```

#### Typing Status
Notify other room participants that you are typing.
* **Event name:** `typing`
* **Payload:** `{ bookingId, isTyping }` (Object)
  ```javascript
  socket.emit('typing', {
    bookingId: "60d5f2a1f83f2e3a6828a2c1",
    isTyping: true
  });
  ```

### Server-to-Client Events

#### Receive Message
Listens for incoming messages in joined rooms.
* **Event name:** `receive-message`
* **Payload:** Message object
  ```json
  {
    "_id": "60d5f992f83f2e3a6828a301",
    "bookingId": "60d5f2a1f83f2e3a6828a2c1",
    "sender": "60d5ec49f83f2e3a6828a2a1",
    "text": "Hey! Are we still on for tomorrow?",
    "isRead": false,
    "createdAt": "2026-06-05T12:00:00.000Z"
  }
  ```

#### Listen for Typing Indicators
Receive typing events from other participants.
* **Event name:** `typing`
* **Payload:** `{ bookingId, isTyping }`
  ```json
  {
    "bookingId": "60d5f2a1f83f2e3a6828a2c1",
    "isTyping": true
  }
  ```

---

## 5. Common Error Responses

#### `400 Bad Request`
Triggered by invalid payloads, validation errors (e.g. invalid emails, short passwords), or invalid signatures:
```json
{
  "errors": [
    {
      "value": "",
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

#### `401 Unauthorized`
Missing or malformed Authorization header, or invalid JWT token:
```json
{
  "message": "No token, authorization denied"
}
```

#### `403 Forbidden`
Accessing resources owned by other users (e.g. attempting to pay for another user's booking, or accepting a booking request not assigned to you):
```json
{
  "message": "Authorization denied. Access to these messages is restricted."
}
```

#### `404 Not Found`
Resource does not exist (e.g. booking or provider profile not found):
```json
{
  "message": "Provider profile not found"
}
```

#### `500 Server Error`
An unexpected backend issue:
```json
"Server error"
```
