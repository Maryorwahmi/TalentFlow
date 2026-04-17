import { AppError } from "../errors.js";
import { sendError } from "./api-response.js";

function notFoundHandler(request, _response, next) {
    next(new AppError(`Route not found: ${request.method} ${request.originalUrl}`, 404));
}

function errorHandler(error, request, response, _next) {
    // Log the error to the console so you can see what's actually happening
    console.error(`[Error] ${request.method} ${request.url}:`, error);

    if (error.code === "LIMIT_FILE_SIZE") {
        return sendError(
            request,
            response,
            400,
            "Uploaded files are too large. Maximum size per file is 10MB."
        );
    }

    const statusCode = error instanceof AppError ? error.statusCode : 500;

    return sendError(
        request,
        response,
        statusCode,
        error.message || "Internal server error.",
        error.details
    );
}

export {
    notFoundHandler,
    errorHandler
};
