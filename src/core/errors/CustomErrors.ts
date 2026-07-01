/**
 * Custom Error Types
 */

export class AppError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}

export class ApiError extends AppError {
  public statusCode: number;

  constructor(message: string, statusCode: number, details?: any) {
    super(message, 'API_ERROR', details);
    this.statusCode = statusCode;
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 'AUTH_ERROR', details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied', details?: any) {
    super(message, 'AUTHORIZATION_ERROR', details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

export class OfflineError extends AppError {
  constructor(message: string = 'No internet connection', details?: any) {
    super(message, 'OFFLINE_ERROR', details);
  }
}
