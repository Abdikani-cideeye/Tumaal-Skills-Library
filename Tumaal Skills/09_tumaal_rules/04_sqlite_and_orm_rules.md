# SQLITE AND ORM RULES

> **Stack:** SQLite, SQLAlchemy 2.0 (async), Alembic, Pydantic V2.

## SQLITE CONSTRAINTS

- **ALWAYS** enable WAL (Write-Ahead Logging) mode for SQLite in production. WAL allows concurrent reads while writing:
```python
from sqlalchemy import event

@event.listens_for(engine.sync_engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA busy_timeout=5000")
    cursor.close()
```
- **ALWAYS** enable `PRAGMA foreign_keys=ON` for every SQLite connection. SQLite disables foreign key enforcement by default.
- **ALWAYS** set `PRAGMA busy_timeout` to at least 5000ms to handle write contention gracefully instead of throwing immediate `SQLITE_BUSY` errors.
- **NEVER** rely on SQLite for high-concurrency write workloads. SQLite allows only one writer at a time. For write-heavy applications, use PostgreSQL.
- **ALWAYS** use `aiosqlite` as the async driver with SQLAlchemy's async engine:
```python
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine("sqlite+aiosqlite:///./app.db", echo=False)
```

## SQLALCHEMY 2.0 STYLE

- **ALWAYS** use SQLAlchemy 2.0 style with `Mapped[]` type annotations for all model columns:
```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, DateTime
from datetime import datetime

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
```
- **NEVER** use legacy SQLAlchemy 1.x patterns: `Column()`, `relationship()` without `Mapped`, `declarative_base()`.
- **ALWAYS** use `select()` statements with `session.execute()` instead of legacy `session.query()`:
```python
# NEVER — legacy
users = session.query(User).filter(User.email == email).all()
# ALWAYS — 2.0 style
stmt = select(User).where(User.email == email)
result = await session.execute(stmt)
users = result.scalars().all()
```

## SESSION MANAGEMENT

- **ALWAYS** use async sessions with the `async_sessionmaker` factory:
```python
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

async_session = async_sessionmaker(engine, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
```
- **ALWAYS** set `expire_on_commit=False` for async sessions. Accessing attributes after commit without this flag triggers lazy loads that fail in async contexts.
- **ALWAYS** use `async with session.begin():` for transactional blocks. This auto-commits on success and auto-rollbacks on exception.
- **NEVER** open long-lived sessions. Create per-request sessions via FastAPI's `Depends(get_db)`.

## QUERY OPTIMIZATION

- **NEVER** trigger N+1 queries. ALWAYS use eager loading for related data:
```python
# Eager load with selectinload (preferred for collections)
stmt = select(Post).options(selectinload(Post.comments)).where(Post.user_id == user_id)
# Eager load with joinedload (preferred for single relations)
stmt = select(Post).options(joinedload(Post.author)).where(Post.id == post_id)
```
- **NEVER** use `SELECT *` in production queries. ALWAYS select only the columns needed:
```python
stmt = select(User.id, User.name, User.email).where(User.is_active == True)
```
- **ALWAYS** use cursor-based pagination (keyset pagination) for large datasets. NEVER use `OFFSET` pagination for datasets larger than 10,000 rows — offset performance degrades linearly.
- **ALWAYS** use `EXPLAIN QUERY PLAN` to analyze slow SQLite queries before adding indexes.

## INDEXING

- **ALWAYS** index foreign key columns. SQLite does NOT auto-index foreign keys.
- **ALWAYS** index columns used in `WHERE`, `JOIN`, and `ORDER BY` clauses.
- **ALWAYS** use composite indexes when queries filter on multiple columns. Order columns by selectivity (most selective first).
- **NEVER** over-index write-heavy tables. Each index slows down INSERT, UPDATE, and DELETE.
- **ALWAYS** create indexes in Alembic migration files, NEVER manually on the database.

## MIGRATIONS

- **ALWAYS** use Alembic for all schema changes. NEVER modify the database schema manually or bypass migration history.
- **ALWAYS** make migration files descriptive: `alembic revision -m "add_user_email_index"`.
- **ALWAYS** test migrations in both directions: `alembic upgrade head` and `alembic downgrade -1`.
- **ALWAYS** backfill data when adding new required columns. Write a one-time data migration to populate legacy rows with safe default values.

## SOFT DELETES

- **ALWAYS** use soft deletes for critical entities. Add a `deleted_at: Mapped[datetime | None]` column.
- **ALWAYS** filter out soft-deleted records in default queries. Create explicit query methods for including deleted records.
- **NEVER** use `ON DELETE CASCADE` for hard deletes on entities with audit significance. Use soft deletes with status flags.

## SEED SCRIPTS

- **ALWAYS** make seed scripts idempotent. Clear existing data bottom-up (respecting foreign keys) before inserting.
- **NEVER** hardcode secrets in seed files. Read default admin passwords from environment variables.
- **ALWAYS** use realistic, domain-specific seed data. NEVER use random gibberish generators.

## TRANSACTIONS AND DATA INTEGRITY

- **ALWAYS** use transactional rollbacks for multi-step operations. If step 2 fails, roll back step 1:
```python
async with session.begin():
    user = User(email=data.email, name=data.name)
    session.add(user)
    await session.flush()  # get user.id without committing
    profile = Profile(user_id=user.id, bio=data.bio)
    session.add(profile)
    # auto-commits on exit, auto-rollbacks on exception
```
- **NEVER** execute long-running transactions on the main request thread. Isolate heavy batch operations to background tasks.
- **ALWAYS** use `session.flush()` to get auto-generated IDs within a transaction WITHOUT committing.

## ANTI-PATTERNS — REJECT ON SIGHT

1. `session.query(Model)` → use `select(Model)` with `session.execute()`.
2. `Column(Integer)` without `Mapped[]` → use `Mapped[int] = mapped_column()`.
3. Missing `PRAGMA foreign_keys=ON` → silent referential integrity violations.
4. `OFFSET` pagination on large datasets → use keyset/cursor pagination.
5. Raw SQL string concatenation → use parameterized queries or ORM query builders.
6. `expire_on_commit=True` with async sessions → causes `MissingGreenlet` errors.
