"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.unblockUserById = exports.blockUserById = exports.deleteUserById = exports.deleteUsers = exports.unblockUsers = exports.blockUsers = exports.getUserById = exports.getCurrentUser = exports.getAllUsers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const JWT_SECRET = process.env.JWT_SECRET || "secret";
// Get all users (with pagination and sorting by lastLogin)
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10 } = req.query;
        const users = yield User_1.default.find()
            .sort({ createdAt: -1 })
            .skip((+page - 1) * +limit)
            .limit(+limit);
        res.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllUsers = getAllUsers;
// Get current authenticated user via token
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = yield User_1.default.findById(decoded.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});
exports.getCurrentUser = getCurrentUser;
// Get user by ID
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user || user.isDeleted) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserById = getUserById;
// Block multiple users
const blockUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userIds } = req.body;
        yield User_1.default.updateMany({ _id: { $in: userIds } }, { isBlocked: true });
        res.status(200).json({ message: 'Users blocked successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.blockUsers = blockUsers;
// Unblock multiple users
const unblockUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userIds } = req.body;
        yield User_1.default.updateMany({ _id: { $in: userIds } }, { isBlocked: false });
        res.status(200).json({ message: 'Users unblocked successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.unblockUsers = unblockUsers;
// Permanently delete multiple users
const deleteUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userIds } = req.body;
        yield User_1.default.deleteMany({ _id: { $in: userIds } });
        res.status(200).json({ message: 'Users deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUsers = deleteUsers;
// Permanently delete a single user by ID
const deleteUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedUser = yield User_1.default.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ message: 'User permanently deleted', user: deletedUser });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUserById = deleteUserById;
// Block single user
const blockUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user || user.isDeleted) {
            res.status(404).json({ message: 'User not found or deleted' });
            return;
        }
        user.isBlocked = true;
        yield user.save();
        res.status(200).json({ message: 'User blocked', user });
    }
    catch (error) {
        next(error);
    }
});
exports.blockUserById = blockUserById;
// Unblock single user
const unblockUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user || user.isDeleted) {
            res.status(404).json({ message: 'User not found or deleted' });
            return;
        }
        user.isBlocked = false;
        yield user.save();
        res.status(200).json({ message: 'User unblocked', user });
    }
    catch (error) {
        next(error);
    }
});
exports.unblockUserById = unblockUserById;
// Update user role -- only for admin
const updateUserRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.body;
        // Validate input
        if (!id || !role) {
            res.status(400).json({ message: 'User ID and new role are required' });
            return;
        }
        // Check if role is valid
        const validRoles = ['admin', 'user'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ message: 'Invalid role provided' });
            return;
        }
        // Find the user
        const user = yield User_1.default.findById(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Update role
        user.role = role;
        yield user.save();
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
    }
    catch (error) {
        console.error('Update User Role Error:', error);
        res.status(500).json({ message: error.message || 'Something went wrong' });
    }
});
exports.updateUserRole = updateUserRole;
// i will try to add that 
// // social auth 
// interface ISocialAuthBody {
//   email: string;
//   name: string;
//   avatar: string;
// } 
// export const socialAuth = CatchAsyncError(async ( req: Request,res:Response, next: NextFunction) => {
//   try {
//       const { email, name, avatar } = req.body as ISocialAuthBody;
//       const user = await userModel.findOne({ email });
//       if (!user) {
//           const newUser = await userModel.create({ email, name, avatar });
//           sendToken(newUser, 200, res);
//       }
//       else {
//           sendToken(user, 200, res);
//       }
//   } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//   }
// });
// // update user info 
// interface IUpdateUserInfo {
//   name?: string;
//   email?: string;
// }
// export const updateUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
//   try {
//       const { name} = req.body as IUpdateUserInfo;
//       const userId = req.user?._id;
//       const user = await userModel.findById(userId);
//       if (name && user) {
//           user.name = name;
//       }
//       await user?.save();
//       await redis.set(userId, JSON.stringify(user));
//       res.status(201).json({
//           success: true,
//          user,
//       }); 
//   } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//   }
// });
// // update user password 
// interface IUpdatePassword {
//   oldPassword: string;
//   newPassword: string;
// }
// export const updatePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
//   try {
//       const { oldPassword, newPassword } = req.body as IUpdatePassword;
//       if (!oldPassword || !newPassword) {
//           return next(new ErrorHandler("Please enter old and new password", 400));
//       }
//       const user = await userModel.findById(req.user?._id).select("+password");
//       if (user?.password === undefined) {
//           return next(new ErrorHandler("Invlaid user", 400));
//       }
//       const isPasswordMatch = await user?.comparePassword(oldPassword);
//       if (!isPasswordMatch) {
//           return next(new ErrorHandler("Invalid old password", 400));
//       }
//       user.password = newPassword;
//       await user.save();
//       await redis.set(req.user?._id, JSON.stringify(user));
//       res.status(201).json({
//           success: true,
//           user,
//       });
//   } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//   }
// });
// // update profile picture 
// interface IUpdateProfilePicture {
//   avatar: string;
// }
// export const updateProfilePicture = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
//   try {
//       const { avatar } = req.body as IUpdateProfilePicture;
//       const userId = req?.user?._id;
//       const user = await userModel.findById(userId);
//       if(avatar && user){
//           // if user have one avatar then call this if
//           if (user?.avatar?.public_id) {
//               // first delete old image 
//               await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
//               const myCloud =  await cloudinary.v2.uploader.upload(avatar,{
//                   folder: "avatars",
//                   width: 150,
//               });
//               user.avatar  = {
//                   public_id: myCloud.public_id,
//                   url: myCloud.secure_url,
//               }
//           } else {
//              const myCloud =  await cloudinary.v2.uploader.upload(avatar,{
//                   folder: "avatars",
//                   width: 150,
//               });
//               user.avatar  = {
//                   public_id: myCloud.public_id,
//                   url: myCloud.secure_url,
//               }
//           }
//       }
//       await user?.save();
//       await redis.set(userId, JSON.stringify(user));
//       res.status(200).json({
//           success: true,
//           user,
//       });
//   } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//   }
// });
// // get all users --only for admin
// export const getAllUsers = CatchAsyncError(async(req:Request, res:Response,next:NextFunction)=>{
//   try{
//      getAllUsersService(res);
//   }catch(error:any){
//       return next(new ErrorHandler(error.message, 400));
//   }
// });
// // update user role --only for admin 
// export const updateUserRole = CatchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
//   try{
//       const {id,role} = req.body;
//       updateUserRoleService(res, id,role);
//   }catch(error:any){
//       return next(new ErrorHandler(error.message, 400));
//   }
// });
// // delete user --only for admin 
// export const deleteUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
//   try{
//       const {id}= req.params;
//       const user = await userModel.findById(id);
//       if(!user){
//           return next(new ErrorHandler("User not found", 404));
//       }
//       await user.deleteOne({id});
//       await redis.del(id);
//       res.status(201).json({
//           success: true,
//           message: "User deleted successfully",
//       });
//   }catch(error:any){
//       return next(new ErrorHandler(error.message, 400));
//   }
// });
