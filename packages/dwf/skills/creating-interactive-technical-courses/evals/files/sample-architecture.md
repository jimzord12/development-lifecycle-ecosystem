# Sample Architecture

A desktop developer tool has three runtime components:

- Client UI sends commands to an API Service.
- API Service validates commands and writes durable state to PostgreSQL.
- Each command has a stable `operationId`.
- PostgreSQL stores successful operation IDs with the business mutation in the same transaction.
- If the client loses the response after commit, it may retry with the same `operationId`; the API returns the recorded prior result instead of applying the mutation again.
- Normal commands are happy-path synchronous request/response.
- The common high-impact failure is a lost acknowledgement after a successful commit.
- A rare manual database repair race exists but is intentionally outside the teaching scope.
