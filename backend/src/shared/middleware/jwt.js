import { createHmac } from "node:crypto";

import { AppError } from "../errors.js";
import { env } from "../db/env.js";

function toBase64Url(value) {
    return Buffer.from(value)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function fromBase64Url(value) {
    const normalised = value
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(value.length / 4) * 4, "=");

    return Buffer.from(normalised, "base64").toString("utf8");
}

function signSegment(value) {
    return createHmac("sha256", env.jwtSecret)
        .update(value)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function parseExpiry(rawExpiry) {
    const match = /^(\d+)([smhd])$/i.exec(rawExpiry);

    if (!match) {
        return 60 * 60;
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers = {
        s: 1,
        m: 60,
        h: 60 * 60,
        d: 60 * 60 * 24
    };

    return amount * multipliers[unit];
}

export function signToken(payload, expiresIn = env.jwtExpiresIn) {
    const header = {
        alg: "HS256",
        typ: "JWT"
    };

    const issuedAt = Math.floor(Date.now() / 1000);
    const tokenPayload = {
        ...payload,
        iat: issuedAt,
        exp: issuedAt + parseExpiry(expiresIn)
    };

    const encodedHeader = toBase64Url(JSON.stringify(header));
    const encodedPayload = toBase64Url(JSON.stringify(tokenPayload));
    const signature = signSegment(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token) {
    if (!token || typeof token !== "string") {
        throw new AppError("Missing authentication token.", 401);
    }

    const [encodedHeader, encodedPayload, signature] = token.split(".");

    if (!encodedHeader || !encodedPayload || !signature) {
        throw new AppError("Invalid token format.", 401);
    }

    const expectedSignature = signSegment(`${encodedHeader}.${encodedPayload}`);

    if (signature !== expectedSignature) {
        throw new AppError("Invalid token signature.", 401);
    }

    const payload = JSON.parse(fromBase64Url(encodedPayload));

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new AppError("Authentication token has expired.", 401);
    }

    return payload;
}
