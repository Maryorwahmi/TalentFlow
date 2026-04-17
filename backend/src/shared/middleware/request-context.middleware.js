import { createRequestId } from "../events/id.js";

function requestContext(request, response, next) {
    const requestId = request.headers["x-request-id"] || createRequestId();

    request.requestId = String(requestId);
    response.setHeader("x-request-id", request.requestId);

    next();
}

export {
    requestContext
};
