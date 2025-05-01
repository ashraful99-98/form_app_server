import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { CustomRequest } from '../middleware/authMiddleware';
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Get all users (with pagination and sorting by lastLogin)
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Get current authenticated user via token
// export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const token = req.cookies.token;

//   if (!token) {
//     res.status(401).json({ message: 'Not authenticated' });
//     return;
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

//     const user = await User.findById(decoded.id);

//     if (!user) {
//       res.status(404).json({ message: 'User not found' });
//       return;
//     }

//     res.status(200).json({ user });
//   } catch (error) {
//     res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

// new code 
export const getCurrentUser = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    // const userId = req.user?._id;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Block multiple users
export const blockUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userIds }: { userIds: string[] } = req.body;
    await User.updateMany({ _id: { $in: userIds } }, { isBlocked: true });
    res.status(200).json({ message: 'Users blocked successfully' });
  } catch (error) {
    next(error);
  }
};

// Unblock multiple users
export const unblockUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userIds }: { userIds: string[] } = req.body;
    await User.updateMany({ _id: { $in: userIds } }, { isBlocked: false });
    res.status(200).json({ message: 'Users unblocked successfully' });
  } catch (error) {
    next(error);
  }
};

// Permanently delete multiple users
export const deleteUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userIds }: { userIds: string[] } = req.body;
    await User.deleteMany({ _id: { $in: userIds } });
    res.status(200).json({ message: 'Users deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Permanently delete a single user by ID
export const deleteUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ message: 'User permanently deleted', user: deletedUser });
  } catch (error) {
    next(error);
  }
};

// Block single user
export const blockUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      res.status(404).json({ message: 'User not found or deleted' });
      return;
    }
    user.isBlocked = true;
    await user.save();
    res.status(200).json({ message: 'User blocked', user });
  } catch (error) {
    next(error);
  }
};

// Unblock single user
export const unblockUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      res.status(404).json({ message: 'User not found or deleted' });
      return;
    }
    user.isBlocked = false;
    await user.save();
    res.status(200).json({ message: 'User unblocked', user });
  } catch (error) {
    next(error);
  }
};


// Update user role -- only for admin
export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, role } = req.body;

    // Validate input
    if (!id || !role) {
      res.status(400).json({ message: 'User ID and new role are required' });
      return;
    }

    // Check if role is valid
    const validRoles: IUser['role'][] = ['admin', 'user'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: 'Invalid role provided' });
      return;
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update role
    user.role = role;
    await user.save();

    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Update User Role Error:', error);
    res.status(500).json({ message: error.message || 'Something went wrong' });
  }
};
