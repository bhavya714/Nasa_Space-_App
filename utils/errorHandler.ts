import { NextResponse } from 'next/server';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

// Enhanced error handler for API routes
export function handleApiError(error: any, context: string = 'API'): NextResponse {
  console.error(`❌ ${context} Error:`, error);
  
  // Determine status code
  let statusCode = 500;
  let message = 'Internal server error';
  
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Invalid request data';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (error.statusCode) {
    statusCode = error.statusCode;
  }
  
  // Don't expose detailed error messages in production
  if (process.env.NODE_ENV === 'production') {
    message = getGenericErrorMessage(statusCode);
  } else {
    message = error.message || message;
  }
  
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  );
}

function getGenericErrorMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Bad request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not found';
    case 429:
      return 'Too many requests';
    case 500:
      return 'Internal server error';
    case 502:
      return 'Bad gateway';
    case 503:
      return 'Service unavailable';
    default:
      return 'An error occurred';
  }
}

// Wrapper for API route handlers with error handling
export function withErrorHandler(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return handleApiError(error, 'Route Handler');
    }
  };
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string = 'Operation'
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn(`⚠️ ${context} failed, using fallback:`, error);
    return fallback;
  }
}

// Memory usage monitoring for deployment platforms
export function logMemoryUsage(context: string = '') {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_MODE === 'true') {
    const used = process.memoryUsage();
    console.log(`📊 Memory Usage ${context}:`, {
      rss: Math.round(used.rss / 1024 / 1024 * 100) / 100 + ' MB',
      heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100 + ' MB',
      heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100 + ' MB',
      external: Math.round(used.external / 1024 / 1024 * 100) / 100 + ' MB'
    });
  }
}

// Rate limiting helper for deployment platforms
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 60, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean old entries
  const keysToDelete: string[] = [];
  requestCounts.forEach((data, key) => {
    if (data.resetTime < now) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => requestCounts.delete(key));
  
  const current = requestCounts.get(identifier) || { count: 0, resetTime: now + windowMs };
  
  if (current.resetTime < now) {
    current.count = 1;
    current.resetTime = now + windowMs;
  } else {
    current.count++;
  }
  
  requestCounts.set(identifier, current);
  
  return {
    allowed: current.count <= maxRequests,
    remaining: Math.max(0, maxRequests - current.count),
    resetTime: current.resetTime
  };
}