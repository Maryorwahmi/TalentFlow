import { randomUUID } from "node:crypto";

export function createRequestId() {
    return randomUUID();
}

export function createCode(prefix) {
    return `${prefix}-${randomUUID().split("-")[0].toUpperCase()}`;
}
