# DEPENDENCY INJECTION AND VALIDATION

## DEPENDENCY INJECTION

- **ALWAYS** use dependency injection (DI) to provide database clients, API clients, configuration, and authentication context to route handlers. NEVER import these directly at the module level.
- **ALWAYS** use framework-native DI mechanisms:
  - **Python/FastAPI:** `Depends()` for injecting dependencies into route handlers.
  - **Node.js/NestJS:** Constructor injection via IoC container.
  - **Node.js/Express:** Middleware for injecting services into `req` context.
- **ALWAYS** leverage DI for request validation, not just service injection. Validate that a resource exists (e.g., `valid_post_id`) in a dependency, then reuse that dependency across all routes that need that resource.
```python
# FastAPI: validate once, reuse everywhere
async def valid_post_id(post_id: UUID4) -> dict:
    post = await service.get_by_id(post_id)
    if not post:
        raise PostNotFound()
    return post

@router.get("/posts/{post_id}")
async def get_post(post = Depends(valid_post_id)):
    return post

@router.put("/posts/{post_id}")
async def update_post(data: PostUpdate, post = Depends(valid_post_id)):
    return await service.update(post["id"], data)
```

## CHAINED DEPENDENCIES

- **ALWAYS** chain dependencies to build complex validation pipelines from simple, reusable parts (e.g., `valid_post_id` → `valid_owned_post` → `valid_active_creator`).
- **ALWAYS** leverage dependency caching. In frameworks like FastAPI, dependency results are cached within a request scope — a dependency called multiple times in one request executes only once.

## SCHEMA VALIDATION

- **ALWAYS** validate all incoming API payloads against a strict schema (e.g., Zod, Pydantic, Joi, Yup) BEFORE processing any business logic.
- **ALWAYS** use a custom base model or schema class that enforces global conventions (e.g., standardized datetime serialization, consistent naming conventions).
- **ALWAYS** decouple configuration schemas. NEVER use a single monolithic configuration class for the entire application. Split settings per domain module.
```python
# FastAPI: per-module config
class AuthConfig(BaseSettings):
    JWT_ALG: str
    JWT_SECRET: str
    JWT_EXP: int = 5

class DatabaseConfig(BaseSettings):
    DATABASE_URL: PostgresDsn
```
- **ALWAYS** define separate schemas for Create, Update, and Response operations on the same entity. NEVER reuse a single schema for all three.

## INPUT SANITIZATION

- **ALWAYS** strip leading/trailing whitespace from string inputs before validation.
- **ALWAYS** enforce maximum lengths on all string fields to prevent buffer overflow and storage abuse.
- **ALWAYS** validate enums and constrained fields against their allowed values. NEVER pass unconstrained strings to database queries.

## ERROR RESPONSES FROM VALIDATION

- **ALWAYS** return structured validation errors that identify the specific field, the constraint violated, and a human-readable message.
- **NEVER** expose internal validation library error structures (e.g., raw Pydantic `ValidationError` details) directly to API consumers. Map them to your standardized error response format.

## TESTING DEPENDENCIES

- **ALWAYS** use dependency overrides in tests. NEVER monkeypatch internal service implementations. Use framework-native override mechanisms:
```python
# FastAPI: override auth dependency in tests
app.dependency_overrides[parse_jwt_data] = lambda: {"user_id": "test-id"}
```
- **ALWAYS** set up the async test client from day one for async frameworks. Retrofitting async tests into a sync test suite causes event loop errors.
