import express from 'express';
import {
  getAllUsers,
  getUserById,
  getCurrentUser,
  blockUserById,
  unblockUserById,
  deleteUserById,
  blockUsers,
  unblockUsers,
  deleteUsers,
  updateUserRole
} from '../controllers/userController';
import authMiddleware, { authorizeRoles } from '../middleware/authMiddleware';


const router = express.Router();

router.get('/', getAllUsers);

// router.get(
//   '/',
//   authMiddleware,              
//   authorizeRoles('admin'),     
//   getAllUsers                   
// );

router.get('/me', getCurrentUser);

router.get('/:id', getUserById);

router.put(
  '/updateRole',
  updateUserRole
);

router.patch('/block/:id', blockUserById);

router.patch('/unblock/:id', unblockUserById);

router.delete('/:id', deleteUserById);

router.patch('/block', blockUsers);

router.patch('/unblock', unblockUsers);

router.delete('/', deleteUsers);

export default router;

