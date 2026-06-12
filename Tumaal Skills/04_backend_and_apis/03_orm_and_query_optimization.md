# ORM AND QUERY OPTIMIZATION

## TYPED DATABASE ACCESS

- **ALWAYS** enforce application-level type safety. NEVER write raw, unverified queries if an ORM (e.g., Prisma, SQLAlchemy, Drizzle) or typed client (e.g., Supabase SDK) is available.
- **ALWAYS** ensure database schemas automatically generate strict type definitions. Regenerate the ORM client after every schema change.
- **NEVER** use `any` types for database query results. Every query result MUST be typed.

## SQL-FIRST PRINCIPLE

- **ALWAYS** prefer SQL for complex operations. Databases handle joins, aggregations, and data manipulation faster than application-level code (especially CPython).
- **ALWAYS** aggregate nested JSON objects in the database query (e.g., `json_build_object`, `JSON_AGG`) rather than fetching flat rows and reshaping them in application code.
- **ALWAYS** use the ORM's query builder for complex queries rather than raw string interpolation. Query builders provide type safety and SQL injection protection.

## N+1 QUERY PREVENTION

- **NEVER** fetch related data in a loop. If you fetch a list of posts and then loop through each to fetch its author, you have an N+1 problem.
- **ALWAYS** use eager loading, joins, or batch queries to fetch related data in a single round trip.
- **ALWAYS** monitor query counts in development. If a single page load generates more than 10 queries, investigate for N+1 patterns.

## TRANSACTIONS AND ROLLBACKS

- **ALWAYS** implement transactional rollbacks for multi-step operations. If step 2 fails, roll back step 1 to prevent orphaned data.
```python
# Example: Create auth user, then create profile
async with db.transaction():
    user = await create_auth_user(data)
    try:
        profile = await create_profile(user.id, data)
    except Exception:
        await delete_auth_user(user.id)  # rollback step 1
        raise
```
- **NEVER** execute long-running transactions on the main thread. Isolate heavy data mutations, batch inserts, or complex aggregations to background workers or database-level functions to avoid locking the client connection.

## CONNECTION MANAGEMENT

- **ALWAYS** use connection pooling. NEVER open a new database connection per request, especially in serverless environments.
- **ALWAYS** close or release database connections in `finally` blocks. Leaked connections exhaust the pool.
- **ALWAYS** use async database drivers (e.g., `asyncpg`, `aiomysql`, `@neondatabase/serverless`) in async application frameworks. Mixing sync database drivers with async frameworks blocks the event loop.

## QUERY PERFORMANCE

- **ALWAYS** analyze slow queries with `EXPLAIN ANALYZE` before adding indexes or rewriting queries.
- **ALWAYS** limit query results with pagination. NEVER return unbounded result sets.
- **ALWAYS** use cursor-based pagination (keyset pagination) for large datasets instead of offset-based pagination. Offset pagination degrades at scale.
- **NEVER** use `SELECT *` in production queries. ALWAYS select only the columns needed.

## DESTRUCTIVE EDGE CASES

- **ALWAYS** implement backend guards against catastrophic user actions (e.g., an Admin attempting to delete their own account, a user deleting all records in a table).
- **ALWAYS** require confirmation for destructive bulk operations. NEVER allow a single API call to delete more than a configurable threshold of records without explicit confirmation.
