import { AppError } from "../errors.js";
import { verifyToken } from "./jwt.js";

function extractBearerToken(request) {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
        return null;
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new AppError(
            "Authorization header must use the format: Bearer <token>.",
            401
        );
    }

    return token;
}

function attachUserFromToken(request) {
    const token = extractBearerToken(request);

    if (!token) {
        return null;
    }

    const payload = verifyToken(token);

    request.user = {
        id: String(payload.userId),
        role: String(payload.role).toLowerCase(),
        email: payload.email
    };

    return request.user;
}

function optionalAuth(request, _response, next) {
    try {
        attachUserFromToken(request);
        next();
    } catch (error) {
        next(error);
    }
}

function requireAuth(request, _response, next) {
    try {
        const user = request.user || attachUserFromToken(request);

        if (!user) {
            throw new AppError("Authentication required.", 401);
        }

        next();
    } catch (error) {
        next(error);
    }
}

function allowRoles(...allowedRoles) {
    return (request, _response, next) => {
        if (!request.user) {
            return next(new AppError("Authentication required.", 401));
        }

        if (!allowedRoles.includes(request.user.role)) {
            return next(
                new AppError("You do not have permission to access this resource.", 403)
            );
        }

        return next();
    };
}

export {
    optionalAuth,
    requireAuth,
    allowRoles
};
