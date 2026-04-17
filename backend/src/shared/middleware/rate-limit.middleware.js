import AppError from "./app-error.js";

function normalizeIp(request) {
    const forwardedFor = request.headers["x-forwarded-for"];

    if (typeof forwardedFor === "string" && forwardedFor.trim()) {
        return forwardedFor.split(",")[0].trim();
    }

    return request.ip || request.socket?.remoteAddress || "unknown";
}

function createRateLimiter({
    windowMs = 60_000,
    max = 120,
    message = "Too many requests. Please try again shortly.",
    skip = () => false
} = {}) {
    const buckets = new Map();

    return function rateLimitMiddleware(request, response, next) {
        if (skip(request)) {
            return next();
        }

        const now = Date.now();
        const key = `${normalizeIp(request)}:${request.baseUrl || ""}:${request.path || ""}`;
        const current = buckets.get(key);

        if (!current || current.resetAt <= now) {
            buckets.set(key, {
                count: 1,
                resetAt: now + windowMs
            });
            response.setHeader("X-RateLimit-Limit", String(max));
            response.setHeader("X-RateLimit-Remaining", String(Math.max(max - 1, 0)));
            return next();
        }

        current.count += 1;
        buckets.set(key, current);

        const remaining = Math.max(max - current.count, 0);
        response.setHeader("X-RateLimit-Limit", String(max));
        response.setHeader("X-RateLimit-Remaining", String(remaining));
        response.setHeader("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));

        if (current.count > max) {
            return next(new AppError(429, message));
        }

        return next();
    };
}

export {
    createRateLimiter
};
