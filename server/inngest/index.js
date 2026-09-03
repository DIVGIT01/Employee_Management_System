import { Inngest } from "inngest";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";
import sendEmail from "../config/nodemailer.js";

// Create Inngest client
export const inngest = new Inngest({
  id: "fullstack-ems-nt",
});


// ============================================================
// 1. AUTO CHECK-OUT FOR EMPLOYEES
// ============================================================

const autoCheckOut = inngest.createFunction(
  {
    id: "auto-check-out",
    triggers: [{ event: "employee/check-out" }],
  },

  async ({ event, step }) => {
    const { employeeId, attendanceId } = event.data;

    // Wait for 9 hours after check-in
    await step.sleepUntil(
      "wait-for-9-hours",
      new Date(Date.now() + 9 * 60 * 60 * 1000)
    );

    // Get attendance data
    let attendance = await Attendance.findById(attendanceId);

    // If employee has not checked out yet
    if (!attendance?.checkOut) {
      // Get employee data
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        return {
          success: false,
          message: "Employee not found",
        };
      }

      // Send check-out reminder email
      await sendEmail({
        to: employee.email,
        subject: "Attendance Check-Out Reminder",
        body: `
          <div style="max-width: 600px; font-family: Arial, sans-serif;">
            <h2>Hi ${employee.firstName}, 👋</h2>

            <p style="font-size: 16px;">
              You checked in today in the ${employee.department} department.
            </p>

            <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">
              Check-in Time:
              ${attendance?.checkIn?.toLocaleTimeString()}
            </p>

            <p style="font-size: 16px;">
              You have been checked in for approximately 9 hours.
              Please make sure to check out.
            </p>

            <p style="font-size: 16px;">
              If you have already checked out, you can ignore this message.
            </p>

            <br />

            <p style="font-size: 16px;">
              Best Regards,
            </p>

            <p style="font-size: 16px;">
              <strong>QuickEMS</strong>
            </p>
          </div>
        `,
      });

      // Wait another 1 hour
      // Total time = 10 hours after check-in
      await step.sleepUntil(
        "wait-for-1-hour",
        new Date(Date.now() + 1 * 60 * 60 * 1000)
      );

      // Check attendance again
      attendance = await Attendance.findById(attendanceId);

      // Automatically check out if employee still hasn't checked out
      if (attendance && !attendance.checkOut) {
        const checkInTime = new Date(attendance.checkIn).getTime();
        const checkOutTime = checkInTime + 10 * 60 * 60 * 1000;

        attendance.checkOut = new Date(checkOutTime);
        attendance.workingHours = 10;
        attendance.dayType = "Full Day";
        attendance.status = "LATE";

        await attendance.save();
      }

      return {
        success: true,
        message: "Auto check-out process completed",
      };
    }

    return {
      success: true,
      message: "Employee already checked out",
    };
  }
);


// ============================================================
// 2. LEAVE APPLICATION REMINDER
// ============================================================

const leaveApplicationReminder = inngest.createFunction(
  {
    id: "leave-application-reminder",
    triggers: [{ event: "leave/pending" }],
  },

  async ({ event, step }) => {
    const { LeaveApplicationId, leaveApplicationId } = event.data;

    // Support both possible event-data names
    const id = LeaveApplicationId || leaveApplicationId;

    // Wait for 24 hours
    await step.sleepUntil(
      "wait-for-24-hours",
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );

    // Get leave application
    const leaveApplication =
      await LeaveApplication.findById(id);

    // Only send reminder if leave is still pending
    if (leaveApplication?.status === "PENDING") {
      const employee = await Employee.findById(
        leaveApplication.employeeId
      );

      if (!employee) {
        return {
          success: false,
          message: "Employee not found",
        };
      }

      // Send reminder email to admin
      await sendEmail({
        to: process.env.ADMIN_EMAIL,

        subject: "Leave Application Reminder",

        body: `
          <div style="max-width: 600px; font-family: Arial, sans-serif;">
            <h2>Hi Admin, 👋</h2>

            <p style="font-size: 16px;">
              You have a pending leave application from
              <strong>${employee.firstName} ${employee.lastName}</strong>.
            </p>

            <p style="font-size: 16px;">
              Department:
              <strong>${employee.department}</strong>
            </p>

            <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">
              Leave Start Date:
              ${leaveApplication?.startDate?.toLocaleDateString()}
            </p>

            <p style="font-size: 16px;">
              Please make sure to take action on this leave application.
            </p>

            <br />

            <p style="font-size: 16px;">
              Best Regards,
            </p>

            <p style="font-size: 16px;">
              <strong>QuickEMS</strong>
            </p>
          </div>
        `,
      });

      return {
        success: true,
        message: "Leave reminder email sent",
      };
    }

    return {
      success: true,
      message: "Leave application is no longer pending",
    };
  }
);


// ============================================================
// 3. ATTENDANCE REMINDER CRON
// Runs every day at 11:30 AM IST
// ============================================================

const attendanceReminderCron = inngest.createFunction(
  {
    id: "attendance-reminder-cron",

    triggers: [
      {
        cron: "TZ=Asia/Kolkata 30 11 * * *",
      },
    ],
  },

  async ({ step }) => {

    // ----------------------------------------------------------
    // Step 1: Get today's date range in IST
    // ----------------------------------------------------------

    const today = await step.run(
      "get-today-date",
      () => {
        const dateString = new Date().toLocaleDateString(
          "en-CA",
          {
            timeZone: "Asia/Kolkata",
          }
        );

        const startUTC = new Date(
          `${dateString}T00:00:00+05:30`
        );

        const endUTC = new Date(
          startUTC.getTime() + 24 * 60 * 60 * 1000
        );

        return {
          startUTC: startUTC.toISOString(),
          endUTC: endUTC.toISOString(),
        };
      }
    );


    // ----------------------------------------------------------
    // Step 2: Get all active, non-deleted employees
    // ----------------------------------------------------------

    const activeEmployees = await step.run(
      "get-active-employees",
      async () => {
        const employees = await Employee.find({
          isDeleted: false,
          employmentStatus: "ACTIVE",
        }).lean();

        return employees.map((employee) => ({
          _id: employee._id.toString(),
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          department: employee.department,
        }));
      }
    );


    // ----------------------------------------------------------
    // Step 3: Get employees who are on approved leave today
    // ----------------------------------------------------------

    const onLeaveIds = await step.run(
      "get-on-leave-ids",
      async () => {
        const leaves = await LeaveApplication.find({
          status: "APPROVED",

          startDate: {
            $lte: new Date(today.endUTC),
          },

          endDate: {
            $gte: new Date(today.startUTC),
          },
        }).lean();

        return leaves.map((leave) =>
          leave.employeeId.toString()
        );
      }
    );


    // ----------------------------------------------------------
    // Step 4: Get employees who already checked in today
    // ----------------------------------------------------------

    const checkedInIds = await step.run(
      "get-checked-in-ids",
      async () => {
        const attendances = await Attendance.find({
          date: {
            $gte: new Date(today.startUTC),
            $lt: new Date(today.endUTC),
          },
        }).lean();

        return attendances.map((attendance) =>
          attendance.employeeId.toString()
        );
      }
    );


    // ----------------------------------------------------------
    // Step 5: Find absent employees
    // ----------------------------------------------------------

    const absentEmployees = activeEmployees.filter(
      (employee) =>
        !onLeaveIds.includes(employee._id) &&
        !checkedInIds.includes(employee._id)
    );


    // ----------------------------------------------------------
    // Step 6: Send reminder emails
    // ----------------------------------------------------------

    if (absentEmployees.length > 0) {
      await step.run(
        "send-reminder-emails",
        async () => {
          const emailPromises = absentEmployees.map(
            (employee) => {
              return sendEmail({
                to: employee.email,

                subject:
                  "Attendance Reminder - Please Mark Your Attendance",

                body: `
                  <div style="max-width: 600px; font-family: Arial, sans-serif;">

                    <h2>
                      Hi ${employee.firstName}, 👋
                    </h2>

                    <p style="font-size: 16px;">
                      We noticed that you haven't marked
                      your attendance yet today.
                    </p>

                    <p style="font-size: 16px;">
                      The deadline was
                      <strong>11:30 AM</strong>
                      and your attendance is still missing.
                    </p>

                    <p style="font-size: 16px;">
                      Please check in as soon as possible
                      or contact your admin if you're facing
                      any issues.
                    </p>

                    <br />

                    <p style="font-size: 14px; color: #666;">
                      Department:
                      ${employee.department}
                    </p>

                    <br />

                    <p style="font-size: 16px;">
                      Best Regards,
                    </p>

                    <p style="font-size: 16px;">
                      <strong>QuickEMS</strong>
                    </p>

                  </div>
                `,
              });
            }
          );

          // Wait for all emails to finish
          await Promise.all(emailPromises);

          return {
            sent: absentEmployees.length,
          };
        }
      );
    }


    // ----------------------------------------------------------
    // Final result
    // ----------------------------------------------------------

    return {
      totalActive: activeEmployees.length,
      onLeave: onLeaveIds.length,
      checkedIn: checkedInIds.length,
      absent: absentEmployees.length,
    };
  }
);


// ============================================================
// EXPORT ALL INNGEST FUNCTIONS
// ============================================================

export const functions = [
  autoCheckOut,
  leaveApplicationReminder,
  attendanceReminderCron,
];