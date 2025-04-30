"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.get('/', userController_1.getAllUsers);
// router.get(
//   '/',
//   authMiddleware,              
//   authorizeRoles('admin'),     
//   getAllUsers                   
// );
router.get('/me', userController_1.getCurrentUser);
router.get('/:id', userController_1.getUserById);
router.put('/updateRole', userController_1.updateUserRole);
router.patch('/block/:id', userController_1.blockUserById);
router.patch('/unblock/:id', userController_1.unblockUserById);
router.delete('/:id', userController_1.deleteUserById);
router.patch('/block', userController_1.blockUsers);
router.patch('/unblock', userController_1.unblockUsers);
router.delete('/', userController_1.deleteUsers);
exports.default = router;
