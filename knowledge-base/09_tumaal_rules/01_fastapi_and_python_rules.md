# FASTAPI AND PYTHON RULES

> **Stack:** Python 3.12+, FastAPI, Pydantic V2, SQLAlchemy 2.0, async-first.

## LAYER ARCHITECTURE

- **ALWAYS** enforce a strict 4-layer architecture: **Router → Service → Repository → ORM/Storage**. Imports flow downward ONLY. NEVER skip layers.
- **ALWAYS** keep route handlers THIN: ≤10 lines of executable code. Parse input, call one service method, return response. NOTHING else.
- **NEVER** import `sqlalchemy`, `httpx`, `boto3`, or ORM models inside routers. Routers may only import: `fastapi`, `app.schemas.*`, `app.core.deps`, `app.services.*`.
- **NEVER** import `fastapi.HTTPException`, `Request`, or `Response` inside services. Services raise domain exceptions; routers map them to HTTP responses.
- **ALWAYS** confine all SQLAlchemy imports to the Repository layer. Repositories implement Protocol interfaces and return domain objects, NOT ORM models.

## PYDANTIC V2

- **ALWAYS** use Pydantic V2 `BaseModel` for ALL request validation and response schemas. NEVER use raw dictionaries.
- **ALWAYS** define separate schemas for Create, Update, and Response operations: `UserCreate`, `UserUpdate`, `UserResponse`. NEVER reuse a single schema for all three.
- **ALWAYS** use a custom base model that enforces global conventions:
```python
from pydantic import BaseModel
from datetime import datetime

class TumaalBase(BaseModel):
    model_config = {"from_attributes": True, "ser_json_timedelta": "iso8601"}
```
- **ALWAYS** use Pydantic's `Field()` with `min_length`, `max_length`, `ge`, `le`, and `pattern` for input constraints. NEVER accept unbounded strings.
- **ALWAYS** use `Annotated[type, Field(...)]` syntax for dependency-injected validated parameters.

## DEPENDENCY INJECTION

- **ALWAYS** use FastAPI's native `Depends()` system. NEVER install `dependency-injector`, `punq`, or any third-party DI container.
- **ALWAYS** define factory functions in `app/core/deps.py`:
```python
def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(repo=SQLAlchemyUserRepo(db))
```
- **ALWAYS** chain dependencies for validation pipelines: `valid_post_id` → `valid_owned_post` → `valid_active_creator`.
- **ALWAYS** leverage FastAPI's dependency caching — a dependency called multiple times within a single request executes only once.

## DOMAIN EXCEPTIONS

- **ALWAYS** raise domain-specific exceptions from services, NEVER `HTTPException`:
```python
# services/user/exceptions.py
class UserNotFoundError(Exception): ...
class InsufficientPermissionsError(Exception): ...

# routers/users.py — map to HTTP
try:
    user = await svc.get_user(user_id)
except UserNotFoundError:
    raise HTTPException(404, detail="User not found")
```

## ASYNC/SYNC ROUTING

- **ALWAYS** use `async def` for route handlers that perform I/O (database, HTTP, file).
- **NEVER** call blocking I/O (`time.sleep()`, sync HTTP, sync file reads) inside `async def` handlers. Use `run_in_threadpool()` for unavoidable sync SDKs.
- **ALWAYS** use async database drivers (`aiosqlite`, `asyncpg`) with async SQLAlchemy sessions.
- **ALWAYS** prefer `async` dependencies over `sync` dependencies — sync deps run in a thread pool with unnecessary overhead.

## LIFESPAN AND STARTUP

- **ALWAYS** use the `lifespan` context manager for startup/shutdown events. NEVER use deprecated `@app.on_event("startup")`.
```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup: initialize DB, connections
    yield
    # shutdown: close connections
```

## ERROR HANDLING

- **ALWAYS** handle errors at the beginning of functions with early returns and guard clauses. Place the happy path last.
- **NEVER** use deeply nested `if/else` chains. Use the `if-return` pattern.
- **ALWAYS** implement a centralized exception handler middleware that maps domain exceptions to HTTP responses.
- **ALWAYS** use structured logging with `contextvars` for `request_id`, `user_id`, and `provider` tracing.

## ROUTE CONVENTIONS

- **ALWAYS** declare `response_model=` on every endpoint for OpenAPI fidelity.
- **ALWAYS** require `user_id: str = Depends(get_current_user_id)` on every protected endpoint.
- **ALWAYS** use the RORO pattern: Receive a Pydantic Object, Return a Pydantic Object.
- **ALWAYS** use `status_code=201` for POST creation endpoints. NEVER return 200 for resource creation.

## ANTI-PATTERNS — REJECT ON SIGHT

1. `db.query(...)` inside a router → move to service, then repo.
2. `raise HTTPException(...)` inside a service → use domain exceptions.
3. `httpx.AsyncClient()` instantiated inside a function → use shared per-provider client.
4. `from app.models.user import User` inside a service → return domain types from repo.
5. `async def handler(...) -> dict:` → ALWAYS return a typed Pydantic response model.
6. `logger.info(f"{user_id} did X")` → use structured logging with `extra={}`.
7. Side-effect operation without `idempotency_key` → double-charge risk.

## TESTING

- **ALWAYS** set up the async test client from day one using `httpx` with `ASGITransport`. NEVER use sync test clients for async apps.
- **ALWAYS** use `app.dependency_overrides` for test fakes. NEVER monkeypatch internal service methods.
- **ALWAYS** use `pytest` with `pytest-asyncio`. Mark async tests with `@pytest.mark.asyncio`.

## TOOLING

- **ALWAYS** use `ruff` for linting and formatting. It replaces black, isort, autoflake, and supports 600+ lint rules.
- **ALWAYS** use `mypy` or `pyright` in strict mode for type checking.
- **ALWAYS** use `alembic` for database migrations. NEVER use `db push` or manual schema changes.
