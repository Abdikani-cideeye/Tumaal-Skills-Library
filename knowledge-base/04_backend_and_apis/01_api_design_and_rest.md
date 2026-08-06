# API DESIGN AND REST

## RESTFUL CONVENTIONS

- **ALWAYS** use nouns for resource endpoints and HTTP methods for actions:
  - `GET /users` — List users.
  - `GET /users/:id` — Get a single user.
  - `POST /users` — Create a user.
  - `PUT /users/:id` — Full update a user.
  - `PATCH /users/:id` — Partial update a user.
  - `DELETE /users/:id` — Delete a user.
- **NEVER** use verbs in endpoint paths (e.g., `/getUsers`, `/deleteUser/123`). The HTTP method IS the verb.
- **ALWAYS** use plural nouns for resource names (`/users`, `/posts`, `/orders`), not singular.

## FILTERING AND QUERYING

- **NEVER** create separate endpoints for different states of the same entity (e.g., `/active-users` and `/inactive-users`). Use query parameters: `GET /users?status=active`.
- **ALWAYS** support pagination on list endpoints. Return `page`, `limit`, `total`, and `hasMore` metadata. NEVER return unbounded lists.
- **ALWAYS** support filtering, sorting, and search via query parameters, not via separate endpoints.

## RESPONSE STANDARDIZATION

- **ALWAYS** return a predictable JSON structure from every endpoint:
```json
{ "success": true, "data": {}, "message": "Operation completed" }
{ "success": false, "message": "Validation failed", "errors": [] }
```
- **ALWAYS** use appropriate HTTP status codes:
  - `200` — Success (GET, PUT, PATCH).
  - `201` — Created (POST).
  - `204` — No Content (DELETE).
  - `400` — Bad Request (validation failure).
  - `401` — Unauthorized (missing/invalid auth).
  - `403` — Forbidden (valid auth, insufficient permissions).
  - `404` — Not Found.
  - `409` — Conflict (duplicate, state conflict).
  - `429` — Too Many Requests (rate limit).
  - `500` — Internal Server Error (unhandled exception).
- **NEVER** return raw database errors, stack traces, or internal exception messages to API consumers.

## API VERSIONING

- **ALWAYS** version your API from day one. Use URL path versioning (`/api/v1/users`) for simplicity.
- **NEVER** make breaking changes to a published API version. Release a new version instead.

## READ/WRITE SEPARATION

- **ALWAYS** separate reads from writes. Client-side applications may read public data directly (if Row Level Security permits), but ALL sensitive mutations (Create, Update, Delete) MUST be routed through protected server-side APIs.
- **NEVER** mix administrative API routes with public API routes in the same application instance. Isolate them by workspace or service to reduce the attack surface.

## DOCUMENTATION

- **ALWAYS** document all API endpoints with request/response schemas, status codes, and descriptions. Use OpenAPI/Swagger or equivalent.
- **ALWAYS** hide API documentation by default in production. Show it explicitly only on allowed environments (local, staging).
```python
# Python/FastAPI example
if ENVIRONMENT not in ("local", "staging"):
    app_configs["openapi_url"] = None
```

## IDEMPOTENCY

- **ALWAYS** make PUT and DELETE operations idempotent. Calling them multiple times with the same input MUST produce the same result.
- **ALWAYS** use idempotency keys for POST operations that create resources, to prevent duplicate creation on network retries.
