import { Router } from "express";

import {
  createEmployees,
  deleteEmployees,
  getEmployees,
  updateEmployees,
} from "../controllers/employeeController.js";

import {
  protect,
  protectAdmin,
} from "../middleware/auth.js";

const employeeRouter = Router();

// Get all employees
employeeRouter.get(
  "/",
  protect,
  protectAdmin,
  getEmployees
);

// Create employee / restore deleted employee
employeeRouter.post(
  "/",
  protect,
  protectAdmin,
  createEmployees
);

// Update employee
employeeRouter.put(
  "/:id",
  protect,
  protectAdmin,
  updateEmployees
);

// Delete employee
employeeRouter.delete(
  "/:id",
  protect,
  protectAdmin,
  deleteEmployees
);

export default employeeRouter;