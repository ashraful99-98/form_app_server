import mongoose, { Document, Schema, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

interface IAnswer {
  questionId: string;
  optionId?: string;
  answerText?: string;
}

export interface IResponse extends Document {
  formId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  response: IAnswer[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ResponseSchema = new Schema<IResponse>(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    response: [
      {
        questionId: { type: String, required: true },
        optionId: { type: String, required: false }, // optional
        answerText: { type: String, required: false } // optional
      }
    ]
  },
  { timestamps: true }
);

ResponseSchema.plugin(mongoosePaginate);

const ResponseModel = mongoose.model<IResponse, PaginateModel<IResponse>>(
  'Response',
  ResponseSchema,
  'Response'
);

export default ResponseModel;