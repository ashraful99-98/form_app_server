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
exports.getResponsesByFormId = exports.getAllResponses = exports.submitResponse = exports.getAllFormsOfUser = exports.editForm = exports.deleteForm = exports.getFormById = exports.formsGet = exports.createForm = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const FormModel_1 = require("../models/FormModel");
const responseModel_1 = __importDefault(require("../models/responseModel"));
// create form 
const createForm = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { createdBy, name, description } = req.body;
        if (!createdBy || !name) {
            console.warn("Missing createdBy or name", req.body);
            res.status(400).json({ message: 'createdBy and name are required.' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(createdBy)) {
            res.status(400).json({ message: 'Invalid user ID.' });
            return;
        }
        const userExists = yield User_1.default.findById(createdBy);
        if (!userExists) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        const newForm = new FormModel_1.FormModel({
            createdBy,
            name,
            description,
            questions: [],
            formType: 'anonymous',
            stared: false,
        });
        const savedForm = yield newForm.save();
        yield User_1.default.updateOne({ _id: createdBy }, { $addToSet: { createdForms: savedForm._id } });
        console.log('Form created and added to user:', savedForm._id);
        res.status(201).json(savedForm);
    }
    catch (error) {
        console.error('Error creating form:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.createForm = createForm;
// forms get 
const formsGet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield FormModel_1.FormModel.find().lean();
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error fetching forms:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});
exports.formsGet = formsGet;
// get single form 
const getFormById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formId = req.params.formId;
        const form = yield FormModel_1.FormModel.findById(formId);
        if (!form) {
            res.status(404).json({ message: 'Form not found' });
            return;
        }
        res.status(200).json(form);
    }
    catch (error) {
        console.error('Error fetching form by ID:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});
exports.getFormById = getFormById;
// delete form 
const deleteForm = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formId = req.params.formId;
        // const userId = req.params.userId;
        console.log('Deleting Form ID:', formId);
        // console.log('User ID:', userId);
        const form = yield FormModel_1.FormModel.findById(formId);
        if (!form) {
            res.status(404).json({ message: 'Form not found or already deleted' });
            return;
        }
        // Convert to string for comparison
        // if (form.createdBy.toString() === userId)
        if (form.createdBy.toString()) {
            yield form.deleteOne();
            console.log('Form deleted');
            res.status(202).json({ message: 'Form deleted' });
        }
        else {
            res.status(401).json({ message: 'You are not the owner of this form' });
        }
    }
    catch (error) {
        console.error('Error deleting form:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});
exports.deleteForm = deleteForm;
// edit form 
const editForm = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formId = req.body.formId;
        const data = {
            name: req.body.name,
            description: req.body.description,
            questions: req.body.questions,
        };
        console.log("Received form data for update:", data);
        const updatedForm = yield FormModel_1.FormModel.findByIdAndUpdate(formId, data, { new: true });
        if (!updatedForm) {
            res.status(404).json({ message: 'Form not found' });
            return;
        }
        res.status(200).json(updatedForm);
    }
    catch (error) {
        console.error("Error updating form:", error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});
exports.editForm = editForm;
// get All forms of user 
const getAllFormsOfUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        console.log("User ID:", userId);
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const forms = yield FormModel_1.FormModel.find({ _id: { $in: user.createdForms } });
        res.status(200).json(forms);
    }
    catch (error) {
        console.error('Error getting user forms:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});
exports.getAllFormsOfUser = getAllFormsOfUser;
// submit response 
const submitResponse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const newResponse = new responseModel_1.default({
            formId,
            userId,
            response
        });
        const savedResponse = yield newResponse.save();
        res.status(201).json(savedResponse);
    }
    catch (error) {
        console.error('Error submitting response:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error
        });
    }
});
exports.submitResponse = submitResponse;
// Get all responses
const getAllResponses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield responseModel_1.default.find().lean();
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error fetching all responses:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});
exports.getAllResponses = getAllResponses;
// Get responses for a specific form
const getResponsesByFormId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { formId } = req.params;
        if (!formId) {
            res.status(400).json({ message: 'Form ID is required.' });
            return;
        }
        const responses = yield responseModel_1.default.find({ formId }).lean();
        res.status(200).json(responses);
    }
    catch (error) {
        console.error('Error fetching responses by form ID:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});
exports.getResponsesByFormId = getResponsesByFormId;
