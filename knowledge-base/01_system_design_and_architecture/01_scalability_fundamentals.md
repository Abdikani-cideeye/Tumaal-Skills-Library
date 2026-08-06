# SCALABILITY FUNDAMENTALS

## HORIZONTAL VS VERTICAL SCALING

- **ALWAYS** prefer horizontal scaling (adding more machines) over vertical scaling (upgrading a single machine) for production systems. Vertical scaling has hard physical limits.
- **NEVER** design a stateful application server. ALWAYS keep application servers stateless so any instance can handle any request. Store session data in external stores (e.g., Redis, database).
- **ALWAYS** design services to be independently deployable and scalable. If one component requires 10x the resources of another, they MUST be separable.

## CAP THEOREM DECISION FRAMEWORK

- **ALWAYS** explicitly choose your CAP trade-off before selecting a database:
  - **CP (Consistency + Partition Tolerance):** WHEN data correctness is non-negotiable (e.g., financial transactions, inventory counts). Use relational databases (e.g., PostgreSQL).
  - **AP (Availability + Partition Tolerance):** WHEN uptime matters more than immediate consistency (e.g., social feeds, analytics dashboards). Use eventual-consistency stores (e.g., Cassandra, DynamoDB).
- **NEVER** assume a system can have all three (Consistency, Availability, Partition Tolerance) simultaneously in a distributed environment.

## MONOLITH VS MICROSERVICES DECISION FRAMEWORK

- **ALWAYS** start with a well-structured monolith for new projects. Premature microservices introduce operational complexity that kills small teams.
- **WHEN** to extract a microservice:
  - The component has a fundamentally different scaling profile (e.g., image processing vs. CRUD).
  - The component is owned by a separate team with an independent deployment cadence.
  - The component requires a different technology stack (e.g., ML pipeline in Python, API in Node.js).
- **NEVER** extract a microservice just because a module is "big." Refactor the monolith first.
- **ALWAYS** ensure each microservice owns its own database. Shared databases between services create hidden coupling.

## TRADE-OFF MATRICES

- **ALWAYS** document trade-offs explicitly when making architectural decisions. Use this framework:
  - **Latency vs. Throughput:** Optimizing for one often degrades the other. Choose based on user-facing SLAs.
  - **Consistency vs. Availability:** See CAP above.
  - **Simplicity vs. Flexibility:** ALWAYS choose simplicity unless flexibility is a proven requirement.
  - **Cost vs. Performance:** Optimize for cost first, scale for performance when metrics demand it.

## STATELESS DESIGN

- **NEVER** rely on server memory to store user session data, conversation history, or request context. Serverless functions and horizontally scaled servers die or restart without warning.
- **ALWAYS** pass the full required context (session, history, state) from the client to the server on every request, or store it in an external persistence layer.
- **ALWAYS** design APIs to be idempotent where possible. Retrying a request MUST NOT create duplicate side effects.

## CAPACITY PLANNING

- **ALWAYS** estimate read-to-write ratios before designing a system. Read-heavy systems (100:1) require different architectures than write-heavy systems (1:1).
- **ALWAYS** calculate storage requirements for 1 year, 3 years, and 5 years before selecting a database or storage solution.
- **NEVER** launch a production system without defining SLAs for latency (p50, p95, p99), availability (e.g., 99.9%), and throughput (requests per second).
