# La Cusina App API Documentation

This document describes all available API endpoints for the Recipe App backend.

---

## Authentication

### POST `/login`
- **Description:** User login, returns access token.
- **Request Body:**
  - `email` (string, required)
  - `password` (string, required)
- **Response:**
  - `access_token` (string)
  - `user` (object)

### POST `/register`
- **Description:** Register a new user.
- **Request Body:**
  - `email` (string, required)
  - `password` (string, required)
  - `username` (string, required)
- **Response:**
  - `id`, `email`, `username`

---

## Public Recipe Endpoints

### GET `/pub/recipes`
- **Description:** Get paginated list of recipes.
- **Query Params:**
  - `page` (number, optional, default: 1)
  - `search` (string, optional, search by title)
  - `sort` (string, optional: `oldest`, `newest`)
- **Response:**
  - Array of recipe objects

### GET `/pub/recipes/all`
- **Description:** Get all recipes (id, title, ingredients) for AI context.
- **Response:**
  - Array of `{ id, title, ingredients }`

### GET `/pub/recipes/:id`
- **Description:** Get detail of a recipe by ID.
- **Response:**
  - Recipe object

---

## AI Recommendation

### POST `/ai/rekomendasi`
- **Description:** Get AI-powered recipe recommendation based on provided recipes and question.
- **Request Body:**
  - `question` (string, required)
  - `recipes` (array of `{ id, title, ingredients }`, required)
- **Response:**
  - `rekomendasi` (string)

---

## My List (Authenticated)
All endpoints below require `Authorization: Bearer <access_token>` header.

### GET `/mylist`
- **Description:** Get all recipes in the user's My List.
- **Response:**
  - `{ myList: [ { id, RecipeId, note, Recipe: { ... } } ] }`

### POST `/mylist`
- **Description:** Add a recipe to My List.
- **Request Body:**
  - `RecipeId` (number, required)
  - `note` (string, optional)
- **Response:**
  - `{ message, myList }`

### DELETE `/mylist/:RecipeId`
- **Description:** Remove a recipe from My List by RecipeId.
- **Response:**
  - `{ message }`

### PATCH `/mylist/:RecipeId`
- **Description:** Update note for a recipe in My List.
- **Request Body:**
  - `note` (string, required)
- **Response:**
  - `{ message, myList }` (myList contains updated entry)

---

## Users (Admin/Owner)

### GET `/users`
- **Description:** Get all users (admin only).
- **Response:**
  - Array of user objects

---

## Error Response Format
- All errors return `{ message: string, [error]: string }` with appropriate HTTP status code.

---

## Example Authorization Header
```
Authorization: Bearer <access_token>
```

---

## Notes
- All endpoints return JSON.
- For protected endpoints, include the access token in the Authorization header.
- AI endpoint only recommends from provided recipes.
