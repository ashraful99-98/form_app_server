import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend Request type to include 'user' with id and role

export interface CustomRequest extends Request {
  user?: JwtPayload & { role?: string };
}

const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { role?: string };
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export default authMiddleware;


// Authorization Middleware
export const authorizeRoles = (...roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      res.status(403).json({
        message: `Role '${req.user?.role || 'Unknown'}' is not allowed to access this resource`,
      });
      return;
    }
    next();
  };
};