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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = require("cloudinary");
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const streamifier_1 = __importDefault(require("streamifier"));
// // Route Imports
const imageModel_1 = __importDefault(require("./models/imageModel"));
const auth_1 = __importDefault(require("./routes/auth"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const formRoutes_1 = __importDefault(require("./routes/formRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// const PORT: number = Number(process.env.PORT) || 8000;
const PORT = Number(process.env.PORT);
// MongoDB connection
// const dbUrl = "mongodb+srv://formsAppServer:05jx80NNrcTScUrJ@forms-app.nwxnlgi.mongodb.net/?retryWrites=true&w=majority&appName=forms-app";
const dbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@forms-app.nwxnlgi.mongodb.net/?retryWrites=true&w=majority&appName=forms-app`;
mongoose_1.default.set("debug", true);
mongoose_1.default.connect(dbUrl)
    .then(conn => console.log(`MongoDB Connected: ${conn.connection.host}`))
    .catch(err => {
    console.error("MongoDB connection error:", err.message);
    setTimeout(() => mongoose_1.default.connect(dbUrl), 5000);
});
// Middleware
// const allowedOrigins = [
//   "https://forms-app47-gamma.vercel.app", // production
//   "http://localhost:3000",                // development
// ];
// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true,
// }));
app.use((0, cors_1.default)({
    // origin: process.env.ORIGIN || 'http://localhost:3000',
    origin: process.env.ORIGIN || 'https://forms-app47-gamma.vercel.app',
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Serve static files
app.use('/public', express_1.default.static(path_1.default.join(__dirname, 'public')));
// Multer setup (memory storage for cloudinary)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// Cloudinary config
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
});
console.log({
    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUD_API_KEY: process.env.CLOUD_API_KEY,
    CLOUD_SECRET_KEY: process.env.CLOUD_SECRET_KEY,
});
// Routes
app.use("/api/auth", auth_1.default);
app.use("/api/users", userRoute_1.default);
app.use("/api/forms", formRoutes_1.default);
// Upload Image to Cloudinary
app.post("/api/images", upload.single("myfile"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }
        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary_1.v2.uploader.upload_stream({ folder: "FormImage" }, (error, result) => {
                    if (result) {
                        resolve(result);
                    }
                    else {
                        reject(error);
                    }
                });
                streamifier_1.default.createReadStream(fileBuffer.buffer).pipe(stream);
            });
        };
        const result = yield streamUpload(file);
        const newImage = new imageModel_1.default({
            image: {
                public_id: result.public_id,
                url: result.secure_url,
            },
        });
        const savedImage = yield newImage.save();
        res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            image: {
                _id: savedImage._id,
                public_id: savedImage.image.public_id,
                url: savedImage.image.url,
                // createdAt: savedImage.createdAt,
                // updatedAt: savedImage.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Image upload error:", error);
        res.status(500).json({ error: "Upload failed", details: error.message });
    }
}));
// Get all uploaded images
app.get("/api/images", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = yield imageModel_1.default.find().lean();
        res.status(200).json({
            success: true,
            images: images.map(img => {
                var _a, _b;
                return ({
                    _id: img._id,
                    public_id: (_a = img === null || img === void 0 ? void 0 : img.image) === null || _a === void 0 ? void 0 : _a.public_id,
                    url: (_b = img === null || img === void 0 ? void 0 : img.image) === null || _b === void 0 ? void 0 : _b.url,
                    // createdAt: img.createdAt,
                    // updatedAt: img.updatedAt,
                });
            }),
        });
    }
    catch (error) {
        console.error("Fetch images error:", error);
        res.status(500).json({ error: "Fetching images failed", details: error.message });
    }
}));
// Health Check
app.get("/", (_req, res) => {
    res.send("Forms app server is running");
});
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});
