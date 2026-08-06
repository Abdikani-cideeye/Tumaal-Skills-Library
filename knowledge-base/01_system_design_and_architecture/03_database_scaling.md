# DATABASE SCALING

## SCALING DECISION FRAMEWORK

- **ALWAYS** optimize queries and indexes before scaling infrastructure. Most "scaling problems" are actually query problems.
- **ALWAYS** add connection pooling (e.g., PgBouncer, built-in ORM pooling) before adding read replicas. Exhausted connections are the most common database bottleneck.

## READ REPLICAS

- **WHEN** to use read replicas:
  - Read-to-write ratio exceeds 10:1.
  - Reporting or analytics queries are degrading OLTP performance.
  - Geographic distribution requires low-latency reads in multiple regions.
- **ALWAYS** route all write operations to the primary database. NEVER write to a replica.
- **ALWAYS** account for replication lag. Read replicas may be milliseconds to seconds behind the primary. NEVER read from a replica immediately after a write if the user expects to see their own changes.
- **ALWAYS** implement read-after-write consistency for user-facing operations by reading from the primary for a short window after mutations.

## SHARDING

- **WHEN** to shard:
  - A single database instance cannot handle the write throughput.
  - The dataset exceeds the storage capacity of a single machine.
  - You have exhausted vertical scaling, indexing, and query optimization.
- **NEVER** shard prematurely. Sharding introduces massive operational complexity (cross-shard queries, rebalancing, distributed transactions).
- **ALWAYS** choose a shard key that:
  - Distributes data evenly across shards (avoid hot shards).
  - Aligns with the most common query patterns (queries should hit a single shard).
  - Is immutable or rarely changed (e.g., `user_id`, `tenant_id`).
- **NEVER** use timestamps as shard keys for append-heavy workloads. All writes will hit the latest shard, creating a hot spot.

## PARTITIONING

- **ALWAYS** prefer table partitioning (range, hash, or list) over application-level sharding when the data lives in a single database but individual tables grow too large.
- **ALWAYS** partition time-series data by date range (e.g., monthly partitions) to enable efficient pruning and archival.
- **ALWAYS** ensure partition keys align with `WHERE` clause filters to enable partition pruning.

## INDEXING

- **ALWAYS** index foreign keys and columns used in `WHERE`, `JOIN`, and `ORDER BY` clauses. Missing indexes on foreign keys cause full table scans on joins.
- **NEVER** over-index. Each index slows down writes (INSERT, UPDATE, DELETE). Benchmark before adding indexes to write-heavy tables.
- **ALWAYS** use composite indexes when queries filter on multiple columns. Order the columns in the index by selectivity (most selective first).
- **ALWAYS** analyze query execution plans (`EXPLAIN ANALYZE`) for slow queries before adding indexes blindly.

## CONNECTION POOLING

- **ALWAYS** use a connection pooler for serverless or high-concurrency environments. Serverless functions can exhaust database connections in seconds.
- **ALWAYS** set connection pool limits based on the database's `max_connections` setting, not the application's concurrency level.
- **NEVER** open a new database connection per request in a serverless environment. Pool and reuse connections.

## DATA ARCHIVAL

- **ALWAYS** implement a data archival strategy for tables that grow unbounded (logs, events, analytics). Move cold data to cheaper storage (e.g., S3, cold replicas).
- **NEVER** allow production tables to grow beyond the point where common queries degrade. Set size thresholds and automate archival.
