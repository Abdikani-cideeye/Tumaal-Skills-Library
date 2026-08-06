# BACKGROUND TASKS AND ASYNC

## ASYNC/SYNC ROUTING (PYTHON-SPECIFIC)

- **ALWAYS** understand the difference between `async def` and `def` route handlers:
  - `async def` routes run on the main event loop. NEVER perform blocking I/O (e.g., `time.sleep()`, sync HTTP calls) inside `async def` routes — it blocks the entire event loop.
  - `def` (sync) routes are automatically offloaded to a thread pool by the framework. Blocking I/O is safe here but consumes a thread.
- **ALWAYS** use `await` with async I/O libraries (e.g., `asyncpg`, `httpx.AsyncClient`, `aiofiles`) in `async def` routes.
- **WHEN** you must use a sync SDK in an async route, run it in a thread pool explicitly:
```python
from fastapi.concurrency import run_in_threadpool
await run_in_threadpool(sync_client.make_request, data=payload)
```

## ASYNC/SYNC ROUTING (NODE.JS-SPECIFIC)

- **ALWAYS** use non-blocking I/O in Node.js. The single-threaded event loop MUST never be blocked by synchronous operations.
- **NEVER** use `fs.readFileSync`, `crypto.pbkdf2Sync`, or any `*Sync` API in request handlers. Use their async counterparts.
- **ALWAYS** offload CPU-intensive work (e.g., image processing, PDF generation, heavy computation) to worker threads or a separate worker process.

## BACKGROUND TASKS DECISION FRAMEWORK

| Use in-process background tasks when… | Use a task queue (e.g., Celery, Bull, Arq) when… |
|---|---|
| Task is short (<1 second) | Task takes seconds to minutes |
| Failure can be silently dropped | You need retries or dead-letter handling |
| It's fire-and-forget (send email, log a row) | It's CPU-heavy or needs a separate worker pool |
| No scheduling or rate limiting needed | You need cron, ETA, or rate limiting |

- **NEVER** use in-process background tasks for any work that would trigger an alert if lost. If the process dies, the task dies with it.
- **ALWAYS** prefer dedicated task queues for production-critical async work.

## ASYNC DEPENDENCIES

- **ALWAYS** prefer `async` dependencies over `sync` dependencies in async frameworks. Sync dependencies run in a thread pool, which has overhead unnecessary for small non-I/O operations.

## EVENT LOOP SAFETY

- **NEVER** mix sync and async database drivers in the same application. Sync drivers block the event loop when called from async contexts.
- **ALWAYS** set timeouts on all external I/O calls (HTTP requests, database queries, cache operations). NEVER allow a request to hang indefinitely.
- **ALWAYS** implement circuit breakers for external service calls. If a dependency is failing, stop calling it temporarily to prevent cascading resource exhaustion.

## CONCURRENCY PATTERNS

- **ALWAYS** use `Promise.allSettled()` (JS) or `asyncio.gather(return_exceptions=True)` (Python) when executing multiple independent async operations. This allows partial failures without aborting all operations.
- **NEVER** fire multiple sequential `await` calls for independent operations. Run them concurrently.
```javascript
// NEVER — sequential, slow
const users = await getUsers();
const posts = await getPosts();
// ALWAYS — concurrent, fast
const [users, posts] = await Promise.all([getUsers(), getPosts()]);
```

## STATELESS DESIGN

- **NEVER** rely on server memory to store user session data, conversation history, or request context. Serverless functions and horizontally scaled servers die without warning.
- **ALWAYS** pass the full required context from the client to the server on every request, or persist it in an external store (database, Redis).
