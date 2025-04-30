import { Router } from "express";
import { login, logout, register, registerAdmin } from "../controllers/authController";


const router = Router();

router.post("/register", register);
router.post("/admin/register", registerAdmin);
router.post("/login", login);
router.post("/logout", logout);

export default router;
