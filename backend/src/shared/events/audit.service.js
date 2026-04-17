import { createAuditEvent } from "./audit.repository.js";

export async function recordAudit({
    actorUserId,
    actorRole,
    action,
    entityType,
    entityId,
    requestId,
    metadata
}, context) {
    return createAuditEvent(
        {
            actorUserId,
            actorRole,
            action,
            entityType,
            entityId,
            requestId,
            metadata
        },
        context
    );
}
