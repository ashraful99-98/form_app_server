import { Router } from 'express';
import { createForm, deleteForm, editForm, formsGet, getAllFormsOfUser, getAllResponses, getFormById, getResponsesByFormId, submitResponse } from '../controllers/formController';

const router = Router();

router.post('/create', createForm);
router.get('/', formsGet);
router.get('/get/:formId', getFormById);
router.delete('/delete/:formId/:userId', deleteForm);
router.put('/edit', editForm);
router.get('/user/:userId', getAllFormsOfUser);
router.post('/submit', submitResponse);
router.get('/responses/all', getAllResponses);
router.get('/responses/:formId', getResponsesByFormId);

export default router;
