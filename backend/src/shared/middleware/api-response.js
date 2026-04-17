function buildMeta(request, extraMeta = {}) {
    return {
        requestId: request?.requestId || null,
        ...extraMeta
    };
}

export function sendSuccess(request, response, statusCode, data, extraMeta = {}) {
    response.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    return response.status(statusCode).json({
        data,
        meta: buildMeta(request, extraMeta),
        error: null
    });
}

export function sendError(
    request,
    response,
    statusCode,
    message,
    details = undefined,
    extraMeta = {}
) {
    response.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    return response.status(statusCode).json({
        data: null,
        meta: buildMeta(request, extraMeta),
        error: {
            message,
            ...(details ? { details } : {})
        }
    });
}
