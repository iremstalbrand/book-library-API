# Book-Library-API

## Setup

1. Install MongoDB locally
2. Run `npm install`
3. Start MongoDB: `mongod`
4. Start API: `node api.js`

## Endpoints

- POST /books - Add book
- GET /books?language=&author=&status= - List books
- PATCH /books/:id/status - Toggle read status
- DELETE /books/:id - Delete book
