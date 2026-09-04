import Employee from "../models/Employee.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";

// =====================================================
// GET ALL EMPLOYEES
// GET /api/employees
// =====================================================

export const getEmployees = async (req, res) => {
  try {
    const { department } = req.query;

    const where = {
      isDeleted: { $ne: true },
    };

    if (department) {
      where.department = department;
    }

    const employees = await Employee.find(where)
      .populate("userId", "email role")
      .sort({ createdAt: -1 })
      .lean();

    const result = employees.map((emp) => ({
      ...emp,
      id: emp._id.toString(),

      user: emp.userId
        ? {
            email: emp.userId.email,
            role: emp.userId.role,
          }
        : null,
    }));

    return res.json(result);
  } catch (error) {
    console.error("Fetch employees error:", error);

    return res.status(500).json({
      error: "Failed to fetch employees",
    });
  }
};

// =====================================================
// CREATE / RESTORE EMPLOYEE
// POST /api/employees
// =====================================================

export const createEmployees = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      basicSalary,
      allowances,
      deductions,
      joinDate,
      password,
      role,
      bio,
    } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    // Required fields
    if (
      !firstName ||
      !lastName ||
      !normalizedEmail ||
      !password ||
      !phone ||
      !position ||
      !joinDate
    ) {
      return res.status(400).json({
        error: "Please fill all required fields",
      });
    }

    // =================================================
    // CHECK EXISTING USER
    // =================================================

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      const existingEmployee = await Employee.findOne({
        userId: existingUser._id,
      });

      if (existingEmployee && !existingEmployee.isDeleted) {
        return res.status(400).json({
          error: "Email already exists",
        });
      }

      if (existingEmployee && existingEmployee.isDeleted) {
        const hashedPassword = await bcrypt.hash(password, 10);

        existingUser.password = hashedPassword;
        existingUser.role = role || "EMPLOYEE";

        await existingUser.save();

        existingEmployee.firstName = firstName;
        existingEmployee.lastName = lastName;
        existingEmployee.email = normalizedEmail;
        existingEmployee.phone = phone;
        existingEmployee.position = position;
        existingEmployee.department = department || "Engineering";

        existingEmployee.basicSalary = Number(basicSalary) || 0;
        existingEmployee.allowances = Number(allowances) || 0;
        existingEmployee.deductions = Number(deductions) || 0;

        existingEmployee.joinDate = new Date(joinDate);
        existingEmployee.bio = bio || "";

        existingEmployee.employmentStatus = "ACTIVE";
        existingEmployee.isDeleted = false;

        await existingEmployee.save();

        return res.status(201).json({
          success: true,
          restored: true,
          message: "Deleted employee restored successfully",
          employee: {
            ...existingEmployee.toObject(),
            id: existingEmployee._id.toString(),
          },
        });
      }

      return res.status(400).json({
        error: "Email already exists",
      });
    }

    // =================================================
    // CREATE NEW USER
    // =================================================

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "EMPLOYEE",
    });

    // =================================================
    // CREATE NEW EMPLOYEE
    // =================================================

    try {
      const employee = await Employee.create({
        userId: user._id,

        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,

        phone: phone.trim(),
        position: position.trim(),

        department: department || "Engineering",

        basicSalary: Number(basicSalary) || 0,
        allowances: Number(allowances) || 0,
        deductions: Number(deductions) || 0,

        joinDate: new Date(joinDate),

        bio: bio || "",

        employmentStatus: "ACTIVE",
        isDeleted: false,
      });

      return res.status(201).json({
        success: true,
        restored: false,
        employee: {
          ...employee.toObject(),
          id: employee._id.toString(),
        },
      });
    } catch (employeeError) {
      await User.findByIdAndDelete(user._id);
      throw employeeError;
    }
  } catch (error) {
    console.error("Create employee error:", error);

    if (error.code === 11000) {
      const field =
        Object.keys(error.keyPattern || {})[0] ||
        Object.keys(error.keyValue || {})[0] ||
        "field";

      return res.status(400).json({
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }

    return res.status(500).json({
      error: error.message || "Failed to create employee",
    });
  }
};

// =====================================================
// UPDATE EMPLOYEE
// PUT /api/employees/:id
// =====================================================

export const updateEmployees = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      basicSalary,
      allowances,
      deductions,
      password,
      role,
      bio,
      employmentStatus,
      joinDate,
    } = req.body;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    const normalizedEmail = email?.trim().toLowerCase();

    if (
      normalizedEmail &&
      normalizedEmail !== employee.email.toLowerCase()
    ) {
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: employee.userId },
      });

      if (existingUser) {
        return res.status(400).json({
          error: "Email already exists",
        });
      }
    }

    if (firstName !== undefined) {
      employee.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      employee.lastName = lastName.trim();
    }

    if (normalizedEmail) {
      employee.email = normalizedEmail;
    }

    if (phone !== undefined) {
      employee.phone = phone.trim();
    }

    if (position !== undefined) {
      employee.position = position.trim();
    }

    if (department) {
      employee.department = department;
    }

    employee.basicSalary = Number(basicSalary) || 0;
    employee.allowances = Number(allowances) || 0;
    employee.deductions = Number(deductions) || 0;

    if (joinDate) {
      employee.joinDate = new Date(joinDate);
    }

    if (bio !== undefined) {
      employee.bio = bio;
    }

    if (employmentStatus) {
      employee.employmentStatus = employmentStatus;
    }

    await employee.save();

    const userUpdate = {};

    if (normalizedEmail) {
      userUpdate.email = normalizedEmail;
    }

    if (role) {
      userUpdate.role = role;
    }

    if (password) {
      userUpdate.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(employee.userId, userUpdate, {
        new: true,
      });
    }

    return res.json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error("Update employee error:", error);

    if (error.code === 11000) {
      const field =
        Object.keys(error.keyPattern || {})[0] ||
        Object.keys(error.keyValue || {})[0] ||
        "field";

      return res.status(400).json({
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }

    return res.status(500).json({
      error: "Failed to update employee",
    });
  }
};

// =====================================================
// DELETE EMPLOYEE
// DELETE /api/employees/:id
// =====================================================

export const deleteEmployees = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    employee.isDeleted = true;
    employee.employmentStatus = "INACTIVE";

    await employee.save();

    return res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error);

    return res.status(500).json({
      error: "Failed to delete employee",
    });
  }
};