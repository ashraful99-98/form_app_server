"use strict";
// import mongoose, { Document, Schema } from 'mongoose';
// import mongoosePaginate from 'mongoose-paginate-v2';
// import { IUser } from './User';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormModel = void 0;
// export interface IOption {
//   optionText: string;
//   optionImage?: string;
// }
// export interface IQuestion {
//   open: boolean;
//   questionText: string;
//   questionImage?: string;
//   options: IOption[];
// }
// export interface IForm extends Document {
//   createdBy: mongoose.Types.ObjectId | IUser; 
//   name: string;
//   description: string;
//   questions: IQuestion[];
//   stared: boolean;
//   formType: string;
// }
// const FormSchema = new Schema<IForm>(
//   {
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     name: { type: String, required: true },
//     description: { type: String, default: '' },
//     questions: [
//       {
//         open: { type: Boolean, default: false },
//         questionText: String,
//         questionImage: { type: String, default: '' },
//         options: [
//           {
//             optionText: String,
//             optionImage: { type: String, default: '' },
//           },
//         ],
//       },
//     ],
//     stared: { type: Boolean, default: false },
//     formType: { type: String, default: 'anonymous' },
//   },
//   { timestamps: true }
// );
// FormSchema.plugin(mongoosePaginate);
// export const FormModel = mongoose.model<IForm>('Form', FormSchema);
// sec attamp 
const mongoose_1 = __importStar(require("mongoose"));
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const FormSchema = new mongoose_1.Schema({
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    questions: [
        {
            open: { type: Boolean, default: false },
            questionText: { type: String },
            questionImage: {
                public_id: { type: String, default: '' },
                url: { type: String, default: '' },
            },
            options: [
                {
                    optionText: { type: String },
                    optionImage: {
                        public_id: { type: String, default: '' },
                        url: { type: String, default: '' },
                    },
                },
            ],
        },
    ],
    stared: { type: Boolean, default: false },
    formType: { type: String, default: 'anonymous' },
}, { timestamps: true });
FormSchema.plugin(mongoose_paginate_v2_1.default);
exports.FormModel = mongoose_1.default.model('Form', FormSchema);
