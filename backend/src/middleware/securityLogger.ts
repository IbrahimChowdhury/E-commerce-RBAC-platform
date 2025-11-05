import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Security log levels
export enum SecurityLogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  AUDIT = 'AUDIT'
}

// Security event types
export enum SecurityEventType {
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  ACCOUNT_BAN = 'ACCOUNT_BAN',
  ACCOUNT_UNBAN = 'ACCOUNT_UNBAN',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ADMIN_ACTION = 'ADMIN_ACTION',
  FILE_UPLOAD = 'FILE_UPLOAD',
  MALICIOUS_FILE_DETECTED = 'MALICIOUS_FILE_DETECTED',
  VALIDATION_FAILURE = 'VALIDATION_FAILURE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

// Log entry interface
interface SecurityLogEntry {
  timestamp: string;
  level: SecurityLogLevel;
  eventType: SecurityEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource?: string;
  details?: any;
  success: boolean;
}

// Security logger class
class SecurityLogger {
  private logDir: string;
  private logFile: string;
  private useFileLogging: boolean;

  constructor() {
    // In serverless environments (Vercel, AWS Lambda, etc.), use /tmp directory
    // In local development, use the logs directory
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isServerless) {
      // Use /tmp directory in serverless environments
      this.logDir = '/tmp/logs';
      this.useFileLogging = true;
    } else if (process.env.NODE_ENV === 'development') {
      // Use local logs directory in development
      this.logDir = path.join(__dirname, '../../logs');
      this.useFileLogging = true;
    } else {
      // Disable file logging if no suitable location is available
      // In production, you should use a cloud logging service instead
      this.logDir = '';
      this.useFileLogging = false;
    }
    
    if (this.useFileLogging) {
      this.logFile = path.join(this.logDir, 'security.log');
      this.ensureLogDirectory();
    } else {
      this.logFile = '';
    }
  }

  private ensureLogDirectory(): void {
    if (this.useFileLogging && !fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create log directory:', error);
        this.useFileLogging = false;
      }
    }
  }

  private formatLogEntry(entry: SecurityLogEntry): string {
    return JSON.stringify(entry) + '\n';
  }

  public log(
    level: SecurityLogLevel,
    eventType: SecurityEventType,
    action: string,
    req?: Request,
    details?: any,
    success: boolean = true
  ): void {
    const entry: SecurityLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      eventType,
      action,
      success,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('User-Agent'),
      ...(req?.user && {
        userId: req.user.userId,
        email: req.user.email
      }),
      ...(details && { details })
    };

    const logLine = this.formatLogEntry(entry);

    // Write to file if file logging is enabled
    if (this.useFileLogging && this.logFile) {
      try {
        fs.appendFileSync(this.logFile, logLine);
      } catch (error) {
        console.error('Failed to write security log:', error);
      }
    }

    // Always log to console for monitoring services to capture (Vercel logs, CloudWatch, etc.)
    console.log(`[SECURITY LOG] ${level}: ${action}`, {
      ...entry,
      details
    });

    // Send critical alerts (in production, this could send to monitoring systems)
    if (level === SecurityLogLevel.CRITICAL) {
      this.sendCriticalAlert(entry);
    }
  }

  private sendCriticalAlert(entry: SecurityLogEntry): void {
    // In a real application, this would send alerts to monitoring systems
    console.error('🚨 CRITICAL SECURITY EVENT:', entry);
    
    // Here you could integrate with:
    // - Email alerts
    // - Slack notifications
    // - Security monitoring tools
    // - Log aggregation services (ELK, Splunk, etc.)
  }

  public getRecentLogs(hours: number = 24): SecurityLogEntry[] {
    if (!this.useFileLogging || !this.logFile) {
      console.warn('File logging is disabled. Logs are only available in console/monitoring services.');
      return [];
    }

    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }

      const logContent = fs.readFileSync(this.logFile, 'utf-8');
      const lines = logContent.split('\n').filter(line => line.trim());
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

      return lines
        .map(line => {
          try {
            return JSON.parse(line) as SecurityLogEntry;
          } catch {
            return null;
          }
        })
        .filter(entry => entry && new Date(entry.timestamp) > cutoffTime)
        .filter(Boolean) as SecurityLogEntry[];
    } catch (error) {
      console.error('Failed to read security logs:', error);
      return [];
    }
  }
}

// Singleton instance
const securityLogger = new SecurityLogger();

// Middleware factory for logging security events
export const logSecurityEvent = (
  eventType: SecurityEventType,
  action: string,
  level: SecurityLogLevel = SecurityLogLevel.INFO
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store the original res.json to intercept responses
    const originalJson = res.json;

    res.json = function(data: any) {
      const success = data?.success !== false && res.statusCode < 400;
      
      securityLogger.log(
        level,
        eventType,
        action,
        req,
        {
          statusCode: res.statusCode,
          method: req.method,
          path: req.path,
          body: req.method !== 'GET' ? req.body : undefined,
          query: req.query
        },
        success
      );

      return originalJson.call(this, data);
    };

    next();
  };
};

// Specific logging middleware for authentication events
export const logAuthSuccess = (req: Request, res: Response, next: NextFunction) => {
  securityLogger.log(
    SecurityLogLevel.AUDIT,
    SecurityEventType.AUTH_SUCCESS,
    `User ${req.body.email} logged in successfully`,
    req,
    {
      method: 'login',
      email: req.body.email
    }
  );
  next();
};

export const logAuthFailure = (req: Request, res: Response, next: NextFunction) => {
  securityLogger.log(
    SecurityLogLevel.WARNING,
    SecurityEventType.AUTH_FAILURE,
    `Failed login attempt for ${req.body.email}`,
    req,
    {
      method: 'login',
      email: req.body.email,
      reason: 'Invalid credentials'
    },
    false
  );
  next();
};

// Middleware for logging unauthorized access attempts
export const logUnauthorizedAccess = (req: Request, res: Response, next: NextFunction) => {
  securityLogger.log(
    SecurityLogLevel.WARNING,
    SecurityEventType.UNAUTHORIZED_ACCESS,
    `Unauthorized access attempt to ${req.path}`,
    req,
    {
      method: req.method,
      path: req.path,
      requiredRole: 'authenticated',
      providedAuth: !!req.headers.authorization
    },
    false
  );
  next();
};

// Middleware for logging admin actions
export const logAdminAction = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    securityLogger.log(
      SecurityLogLevel.AUDIT,
      SecurityEventType.ADMIN_ACTION,
      action,
      req,
      {
        targetUserId: req.params.id,
        adminUserId: req.user?.userId,
        action: req.body
      }
    );
    next();
  };
};

// Middleware for logging file uploads
export const logFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    securityLogger.log(
      SecurityLogLevel.INFO,
      SecurityEventType.FILE_UPLOAD,
      `User uploaded ${req.files.length} file(s)`,
      req,
      {
        fileCount: req.files.length,
        files: req.files.map(file => ({
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }))
      }
    );
  }
  next();
};

// Middleware for logging malicious file detection
export const logMaliciousFile = (filename: string, reason: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    securityLogger.log(
      SecurityLogLevel.CRITICAL,
      SecurityEventType.MALICIOUS_FILE_DETECTED,
      `Malicious file detected: ${filename}`,
      req,
      {
        filename,
        reason,
        action: 'file_rejected'
      },
      false
    );
    next();
  };
};

// Middleware for logging validation failures
export const logValidationFailure = (errors: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    securityLogger.log(
      SecurityLogLevel.WARNING,
      SecurityEventType.VALIDATION_FAILURE,
      'Input validation failed',
      req,
      {
        errors,
        body: req.body,
        query: req.query,
        params: req.params
      },
      false
    );
    next();
  };
};

// Rate limiting tracker
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Middleware for basic rate limiting and logging
export const rateLimitAndLog = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request count for this client
    let clientData = requestCounts.get(clientId);
    
    if (!clientData || clientData.resetTime < now) {
      clientData = { count: 0, resetTime: now + windowMs };
      requestCounts.set(clientId, clientData);
    }

    clientData.count++;

    if (clientData.count > maxRequests) {
      securityLogger.log(
        SecurityLogLevel.WARNING,
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        `Rate limit exceeded for IP ${clientId}`,
        req,
        {
          requestCount: clientData.count,
          maxRequests,
          windowMs
        },
        false
      );

      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }

    next();
  };
};

// Export the logger instance for direct use
export { securityLogger };

// Helper function to get security logs (for admin dashboard)
export const getSecurityLogs = (hours: number = 24): SecurityLogEntry[] => {
  return securityLogger.getRecentLogs(hours);
};