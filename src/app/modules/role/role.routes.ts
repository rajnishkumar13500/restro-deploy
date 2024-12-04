import express from 'express';
import { RoleController } from './role.controller';

const router = express.Router();

router.post('/', RoleController.createRole);
router.get('/',RoleController.getRoles);
router.patch('/:id',RoleController.updateRoles);


export const RoleRouter = router;

