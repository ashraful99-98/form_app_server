import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import { FormModel } from '../models/FormModel';
import ResponseModel from '../models/responseModel';

// create form 

export const createForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { createdBy, name, description } = req.body;

    if (!createdBy || !name) {
      console.warn("Missing createdBy or name", req.body);
      res.status(400).json({ message: 'createdBy and name are required.' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
      res.status(400).json({ message: 'Invalid user ID.' });
      return;
    }

    const userExists = await User.findById(createdBy);
    if (!userExists) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const newForm = new FormModel({
      createdBy,
      name,
      description,
      questions: [],
      formType: 'anonymous',
      stared: false,
    });

    const savedForm = await newForm.save();

    await User.updateOne(
      { _id: createdBy },
      { $addToSet: { createdForms: savedForm._id } }
    );

    console.log('Form created and added to user:', savedForm._id);
    res.status(201).json(savedForm);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};


// forms get 
export const formsGet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await FormModel.find().lean();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// get single form 
export const getFormById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const formId = req.params.formId;

    const form = await FormModel.findById(formId);

    if (!form) {
      res.status(404).json({ message: 'Form not found' });
      return;
    }

    res.status(200).json(form);
  } catch (error) {
    console.error('Error fetching form by ID:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// delete form 
export const deleteForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const formId = req.params.formId;
    // const userId = req.params.userId;

    console.log('Deleting Form ID:', formId);
    // console.log('User ID:', userId);

    const form = await FormModel.findById(formId);

    if (!form) {
      res.status(404).json({ message: 'Form not found or already deleted' });
      return;
    }

    // Convert to string for comparison
    // if (form.createdBy.toString() === userId)
    
    if (form.createdBy.toString())
       {
      await form.deleteOne();
      console.log('Form deleted');
      res.status(202).json({ message: 'Form deleted' });
    } else {
      res.status(401).json({ message: 'You are not the owner of this form' });
    }
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// edit form 
export const editForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const formId = req.body.formId;

    const data = {
      name: req.body.name,
      description: req.body.description,
      questions: req.body.questions,
    };

    console.log("Received form data for update:", data);

    const updatedForm = await FormModel.findByIdAndUpdate(formId, data, { new: true });

    if (!updatedForm) {
      res.status(404).json({ message: 'Form not found' });
      return;
    }

    res.status(200).json(updatedForm);
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// get All forms of user 

export const getAllFormsOfUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;
    console.log("User ID:", userId);

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const forms = await FormModel.find({ _id: { $in: user.createdForms } });

    res.status(200).json(forms);
  } catch (error) {
    console.error('Error getting user forms:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// submit response 
export const submitResponse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { formId, userId, response } = req.body;

    // Validate basic structure
    if (!formId || !userId || !Array.isArray(response) || response.length === 0) {
      res.status(400).json({ message: 'Form ID, User ID, and at least one response item are required.' });
      return;
    }

    // Validate each response item
    for (const item of response) {
      if (!item.questionId || (!item.optionId && !item.answerText)) {
        res.status(400).json({
          message: 'Each response must include questionId and at least optionId or answerText.'
        });
        return;
      }
    }

    const newResponse = new ResponseModel({
      formId,
      userId,
      response
    });

    const savedResponse = await newResponse.save();

    res.status(201).json(savedResponse);
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error
    });
  }
};

// Get all responses
export const getAllResponses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await ResponseModel.find().lean();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching all responses:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Get responses for a specific form
export const getResponsesByFormId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { formId } = req.params;

    if (!formId) {
      res.status(400).json({ message: 'Form ID is required.' });
      return;
    }

    const responses = await ResponseModel.find({ formId }).lean();

    res.status(200).json(responses);
  } catch (error) {
    console.error('Error fetching responses by form ID:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};