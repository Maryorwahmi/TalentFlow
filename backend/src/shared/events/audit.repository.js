import { getState, nextId } from "../db/store.js";
import {
    execute,
    shouldUseMysql,
    parseJsonField,
    toId
} from "../db/repository-context.js";

function mapAuditEvent(row) {
    if (!row) {
        return null;
    }

    return {
        id: toId(row.audit_event_id ?? row.id),
        actorUserId: toId(row.actor_user_id ?? row.actorUserId),
        actorRole: row.actor_role ?? row.actorRole,
        action: row.action,
        entityType: row.entity_type ?? row.entityType,
        entityId: toId(row.entity_id ?? row.entityId),
        requestId: row.request_id ?? row.requestId,
        metadata: parseJsonField(row.metadata_json ?? row.metadata) || {},
        createdAt: row.created_at
            ? new Date(row.created_at).toISOString()
            : row.createdAt
    };
}

export async function createAuditEvent(payload, context = undefined) {
    if (shouldUseMysql(context)) {
        const result = await execute(
            `
                INSERT INTO audit_events (
                    actor_user_id,
                    actor_role,
                    action,
                    entity_type,
                    entity_id,
                    request_id,
                    metadata_json
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                payload.actorUserId,
                payload.actorRole,
                payload.action,
                payload.entityType,
                String(payload.entityId),
                payload.requestId,
                JSON.stringify(payload.metadata || {})
            ],
            context
        );

        const rows = await execute(
            `
                SELECT
                    audit_event_id,
                    actor_user_id,
                    actor_role,
                    action,
                    entity_type,
                    entity_id,
                    request_id,
                    metadata_json,
                    created_at
                FROM audit_events
                WHERE audit_event_id = ?
                LIMIT 1
            `,
            [result.insertId],
            context
        );

        return mapAuditEvent(rows[0] || null);
    }

    const state = context || getState();
    const record = {
        id: nextId(state, "auditEvents"),
        actorUserId: String(payload.actorUserId),
        actorRole: payload.actorRole,
        action: payload.action,
        entityType: payload.entityType,
        entityId: String(payload.entityId),
        requestId: payload.requestId,
        metadata: payload.metadata || {},
        createdAt: new Date().toISOString()
    };

    state.auditEvents.push(record);

    return record;
}

export async function listAuditEvents(context = undefined) {
    if (shouldUseMysql(context)) {
        const rows = await execute(
            `
                SELECT
                    audit_event_id,
                    actor_user_id,
                    actor_role,
                    action,
                    entity_type,
                    entity_id,
                    request_id,
                    metadata_json,
                    created_at
                FROM audit_events
                ORDER BY audit_event_id ASC
            `,
            [],
            context
        );

        return rows.map(mapAuditEvent);
    }

    const state = context || getState();
    return [...state.auditEvents];
}
