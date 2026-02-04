# Book-Library-API

A REST API for managing books in a library. Add, list, update, and delete books stored in MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Setup

1. Install MongoDB locally
2. Clone this repository
3. Run `npm install`
4. Start MongoDB: `mongod`
5. Start API: `node api.js`
6. API runs on `http://localhost:5002`

## Features

- Add a book to the library
- List all books with optional filters (language, author, status)
- Toggle between read and unread status
- Delete a book by ID

## API Endpoints

**POST /books** - Add a new book

```
curl -X POST http://localhost:5002/books -H "Content-Type: application/json" -d '{"name":"1984","author":"Orwell","language":"English","pages":328,"status":"read"}'
```

**GET /books** - List all books (supports filters: ?language=&author=&status=)

```
curl http://localhost:5002/books?status=read
```

**PATCH /books/:id/status** - Toggle read/unread status

```
curl -X PATCH http://localhost:5002/books/YOUR_BOOK_ID/status
```

**DELETE /books/:id** - Delete a book

```
curl -X DELETE http://localhost:5002/books/YOUR_BOOK_ID
```

## Status Codes

- 200 - OK
- 201 - Created
- 204 - No Content
- 400 - Bad Request
- 404 - Not Found
- 409 - Conflict (duplicate book)
- 500 - Internal Server Error
