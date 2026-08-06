# ASYNC PROCESSING AND QUEUES

## ASYNC PROCESSING DECISION FRAMEWORK

- **ALWAYS** offload work that does not need to complete before the HTTP response is sent. The user should NEVER wait for background processing.
- **WHEN** to use async processing:
  - Sending emails or push notifications.
  - Generating reports or PDFs.
  - Processing image/video uploads (resizing, transcoding).
  - Syncing data with third-party services.
  - Running expensive computations or aggregations.
- **WHEN** to keep processing synchronous:
  - The user needs the result immediately to continue their workflow.
  - The operation is fast (<100ms) and failure must be visible to the user.

## MESSAGE QUEUES

- **ALWAYS** use a dedicated message queue (e.g., RabbitMQ, SQS, Redis Streams, Kafka) for tasks that:
  - Must survive server restarts or crashes.
  - Require retry logic with backoff.
  - Need ordering guarantees.
  - Require rate limiting or throttling.
- **NEVER** use in-process background tasks (e.g., FastAPI `BackgroundTasks`, Node.js `setTimeout`) for critical work. If the process dies, the task is lost.
- **ALWAYS** make queue consumers idempotent. Messages may be delivered more than once. Processing the same message twice MUST NOT create duplicate side effects.

## IN-PROCESS BACKGROUND TASKS

- **WHEN** to use in-process background tasks (e.g., FastAPI `BackgroundTasks`, Node.js `setImmediate`):
  - The task is short (<1 second).
  - Failure can be silently dropped without business impact.
  - The task is fire-and-forget (e.g., logging, lightweight analytics).
  - No retry, scheduling, or rate limiting is needed.
- **NEVER** use in-process background tasks for tasks that would trigger a page if lost.

## EVENT-DRIVEN ARCHITECTURE

- **ALWAYS** prefer event-driven patterns when:
  - Multiple services need to react to the same event independently.
  - Services should be decoupled (publisher does not know about subscribers).
  - The system needs to support future subscribers without modifying the publisher.
- **ALWAYS** design events as immutable facts that describe what happened (e.g., `UserCreated`, `OrderPlaced`). NEVER design events as commands (e.g., `CreateUser`).
- **ALWAYS** include a unique event ID, timestamp, and schema version in every event payload.

## PUB/SUB

- **ALWAYS** use pub/sub (e.g., Kafka, SNS/SQS, Redis Pub/Sub) when:
  - Multiple consumers need to process the same event independently.
  - Consumers may be added or removed without affecting producers.
- **NEVER** use pub/sub for request-response patterns. Use direct RPC or HTTP for synchronous communication.
- **ALWAYS** implement dead-letter queues (DLQ) for messages that fail processing after the maximum retry count. NEVER silently drop failed messages.

## TASK QUEUES AND WORKERS

- **ALWAYS** use a task queue with dedicated workers (e.g., Celery, Bull, Arq) for:
  - CPU-intensive work (data processing, ML inference).
  - Scheduled or recurring tasks (cron jobs).
  - Tasks that require progress tracking or cancellation.
- **ALWAYS** set task timeouts. NEVER allow a worker to process a single task indefinitely.
- **ALWAYS** monitor queue depth. A growing queue indicates that consumers cannot keep up with producers — this requires scaling workers or optimizing task processing.

## ORDERING AND DELIVERY GUARANTEES

- **ALWAYS** understand and choose the delivery guarantee for your use case:
  - **At-Most-Once:** Message may be lost but never duplicated. Use for non-critical analytics.
  - **At-Least-Once:** Message may be duplicated but never lost. Use for most business operations (combine with idempotent consumers).
  - **Exactly-Once:** Requires transactional processing. Use only when absolutely necessary (e.g., financial transactions). Extremely expensive to implement correctly.
- **NEVER** assume message ordering across partitions or shards. If ordering matters, ensure related messages share the same partition key.
