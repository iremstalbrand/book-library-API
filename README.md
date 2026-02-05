# Book-Library-API

A personal REST API for tracking and managing your books.
Add, list, update, review, and delete books stored in MongoDB.

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
- Add and manage reviews for books (rating 1–5 + comment)
- Delete a book by ID

---

## Endpoints

| Method | Endpoint             | Description                 | Example                       |
| ------ | -------------------- | --------------------------- | ----------------------------- |
| POST   | `/books`             | Add a new book              | `POST /books`                 |
| GET    | `/books`             | List all books with filters | `GET /books?status=read`      |
| PATCH  | `/books/:id/status`  | Toggle read / unread status | `PATCH /books/BOOK_ID/status` |
| POST   | `/books/:id/reviews` | Add or update a review      | `POST /books/BOOK_ID/reviews` |
| DELETE | `/books/:id`         | Delete a book               | `DELETE /books/BOOK_ID`       |

---

## Request Body Examples

### POST /books

| Field    | Type   | Required | Description               |
| -------- | ------ | -------- | ------------------------- |
| name     | string | ✔        | Book title                |
| author   | string | ✔        | Author name               |
| language | string | ✔        | Book language             |
| pages    | number | ✔        | Must be a positive number |
| status   | string | ✔        | `read` or `unread`        |

```json
{
  "name": "1984",
  "author": "George Orwell",
  "language": "English",
  "pages": 328,
  "status": "read"
}
```

## Status Codes

| Code | Meaning               | Used in                    |
| ---- | --------------------- | -------------------------- |
| 200  | OK                    | GET, PATCH                 |
| 201  | Created               | POST /books, POST /reviews |
| 204  | No Content            | DELETE /books/:id          |
| 400  | Bad Request           | Invalid request data       |
| 404  | Not Found             | Book not found             |
| 409  | Conflict              | Duplicate book             |
| 500  | Internal Server Error | Server error               |

## Future Improvements

- Add admin authentication and user roles
- Implement JWT-based authentication for secure access
