import mongoose from "mongoose";
import attendanceRouter from "../routes/attendanceRoutes.js";

const payslipSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    month: {type: Number, required: true},
    year: {type: Number, required: true},
    basicSalary: {type: Number, required: true},
    allowances: {type: Number, required: 0},
    deductions: {type: Number, required: 0},
    netSalary: {type: Number, required: true},

  },
  { timestamps: true }
);

const Payslip = mongoose.models.Payslip || mongoose.model ("Payslip", payslipSchema)

const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

export default Attendance;