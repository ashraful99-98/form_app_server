import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import multer from "multer";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import streamifier from "streamifier";

// // Route Imports
import imageModel from "./models/imageModel";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/userRoute";
import formRoutes from './routes/formRoutes';

import dotenv from "dotenv";
dotenv.config();

const app: Application = express();
// const PORT: number = Number(process.env.PORT) || 8000;
const PORT: number = Number(process.env.PORT);

// MongoDB connection
// const dbUrl = "mongodb+srv://formsAppServer:05jx80NNrcTScUrJ@forms-app.nwxnlgi.mongodb.net/?retryWrites=true&w=majority&appName=forms-app";

const dbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@forms-app.nwxnlgi.mongodb.net/?retryWrites=true&w=majority&appName=forms-app`;

mongoose.set("debug", true);
mongoose.connect(dbUrl)
  .then(conn => console.log(`MongoDB Connected: ${conn.connection.host}`))
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    setTimeout(() => mongoose.connect(dbUrl), 5000);
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


app.use(cors({
  // origin: process.env.ORIGIN || 'http://localhost:3000',
  origin: process.env.ORIGIN || 'https://forms-app47-gamma.vercel.app',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Multer setup (memory storage for cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary config
cloudinary.config({ 
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
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/forms", formRoutes);

// Upload Image to Cloudinary
app.post("/api/images", upload.single("myfile"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const streamUpload = (fileBuffer: Express.Multer.File) => {
      return new Promise<{ public_id: string, secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "FormImage" },
          (error, result) => {
            if (result) {
              resolve(result as any);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(fileBuffer.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(file);

    const newImage = new imageModel({
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    const savedImage = await newImage.save();

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
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ error: "Upload failed", details: (error as Error).message });
  }
});

// Get all uploaded images
app.get("/api/images", async (_req: Request, res: Response) => {
  try {
    const images = await imageModel.find().lean();
    res.status(200).json({
      success: true,
      images: images.map(img => ({
        _id: img._id,
        public_id: img?.image?.public_id,
        url: img?.image?.url,
        // createdAt: img.createdAt,
        // updatedAt: img.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Fetch images error:", error);
    res.status(500).json({ error: "Fetching images failed", details: (error as Error).message });
  }
});

// Health Check
app.get("/", (_req: Request, res: Response) => {
  res.send("Forms app server is running");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
