import { inngest } from "../inngest/index.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";

// Create leave
// POST /api/leave
export const createLeave = async (req, res) => {
  try {
    const session = req.session;

    const employee = await Employee.findOne({
      userId: session.userId,
      isDeleted: { $ne: true },
    });

    if (!employee) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    if (employee.isDeleted) {
      return res.status(403).json({
        error: "Your account is deactivated. You cannot apply for leave.",
      });
    }

    const { type, startDate, endDate, reason } = req.body;

    // Validate required fields
    if (!type || !startDate || !endDate || !reason?.trim()) {
      return res.status(400).json({
        error: "Please fill all required fields",
      });
    }

    // Validate leave type
    if (!["SICK", "CASUAL", "ANNUAL"].includes(type)) {
      return res.status(400).json({
        error: "Invalid leave type",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: "Invalid leave dates",
      });
    }

    // Remove time from today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Leave must start tomorrow or later
    if (start <= today || end <= today) {
      return res.status(400).json({
        error: "Leave dates must be in the future",
      });
    }

    // End date cannot be before start date
    if (end < start) {
      return res.status(400).json({
        error: "End date cannot be before start date",
      });
    }

    // Create leave application
    const leave = await LeaveApplication.create({
      employeeId: employee._id,
      type,
      startDate: start,
      endDate: end,
      reason: reason.trim(),
      status: "PENDING",
    });

    /*
      Send Inngest event separately.

      The leave has already been saved successfully.
      Therefore, an Inngest problem should NOT make
      the user's leave submission appear failed.
    */
    try {
      await inngest.send({
        name: "leave/pending",
        data: {
          LeaveApplicationId: leave._id.toString(),
        },
      });
    } catch (inngestError) {
      console.error("Inngest event error:", inngestError);
    }

    return res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Create leave error:", error);

    return res.status(500).json({
      error: error.message || "Failed to submit leave request",
    });
  }
};

// Get leaves
// GET /api/leave
export const getLeave = async (req, res) => {
  try {
    const session = req.session;
    const isAdmin = session.role === "ADMIN";

    if (isAdmin) {
      const status = req.query.status;

      const where = status ? { status } : {};

      const leaves = await LeaveApplication.find(where)
        .populate("employeeId")
        .sort({ createdAt: -1 });

      const data = leaves.map((leave) => {
        const obj = leave.toObject();

        return {
          ...obj,
          id: obj._id.toString(),
          employee: obj.employeeId,
          employeeId: obj.employeeId?._id?.toString(),
        };
      });

      return res.json({ data });
    }

    const employee = await Employee.findOne({
      userId: session.userId,
    }).lean();

    if (!employee) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    const leaves = await LeaveApplication.find({
      employeeId: employee._id,
    }).sort({ createdAt: -1 });

    return res.json({
      data: leaves,
      employee: {
        ...employee,
        id: employee._id.toString(),
      },
    });
  } catch (error) {
    console.error("Get leave error:", error);

    return res.status(500).json({
      error: error.message || "Failed to fetch leave data",
    });
  }
};

// Update leave status
// PATCH /api/leave/:id
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }

    const leave = await LeaveApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({
        error: "Leave application not found",
      });
    }

    return res.json({
      success: true,
      message: "Leave status updated successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Update leave status error:", error);

    return res.status(500).json({
      error: error.message || "Failed to update leave status",
    });
  }
};