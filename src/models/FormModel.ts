// import mongoose, { Document, Schema } from 'mongoose';
// import mongoosePaginate from 'mongoose-paginate-v2';
// import { IUser } from './User';

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
import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { IUser } from './User';

export interface IOptionImage {
  public_id: string;
  url: string;
}

export interface IOption {
  optionText: string;
  optionImage?: IOptionImage;
}

export interface IQuestionImage {
  public_id: string;
  url: string;
}

export interface IQuestion {
  open: boolean;
  questionText: string;
  questionImage?: IQuestionImage;
  options: IOption[];
}

export interface IForm extends Document {
  createdBy: mongoose.Types.ObjectId | IUser;
  name: string;
  description: string;
  questions: IQuestion[];
  stared: boolean;
  formType: string;
}

const FormSchema = new Schema<IForm>(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
  },
  { timestamps: true }
);

FormSchema.plugin(mongoosePaginate);

export const FormModel = mongoose.model<IForm>('Form', FormSchema);

