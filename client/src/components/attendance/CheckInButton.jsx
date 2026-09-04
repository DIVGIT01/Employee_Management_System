import {
  LogInIcon,
  LogOutIcon,
  Loader2Icon,
} from "lucide-react";
import React, { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const CheckInButton = ({ todayRecord, onAction }) => {
  const [loading, setLoading] = useState(false);

  const handleAttendance = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await api.post("/attendance");

      console.log("Attendance action response:", res.data);

      if (res.data?.type === "CHECK_IN") {
        toast.success("Clocked in successfully!");
      } else if (res.data?.type === "CHECK_OUT") {
        toast.success("Clocked out successfully!");
      } else {
        toast.success("Attendance updated successfully!");
      }

      // Refresh attendance data
      if (onAction) {
        await onAction();
      }
    } catch (error) {
      console.error("Attendance action error:", error);

      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to update attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  // Work day completed
  if (todayRecord?.checkOut) {
    return (
      <div className="fixed bottom-4 right-4 flex flex-col z-50">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-lg font-bold text-slate-900">
            Work Day Completed!
          </h3>

          <p className="text-slate-500 text-sm mt-1">
            Great job! See you tomorrow
          </p>
        </div>
      </div>
    );
  }

  const isCheckedIn = Boolean(
    todayRecord?.checkIn && !todayRecord?.checkOut
  );

  return (
    <div className="fixed bottom-4 right-4 flex flex-col z-50">
      <button
        type="button"
        onClick={handleAttendance}
        disabled={loading}
        className={`w-full max-w-xs flex justify-between items-center gap-8
          p-4 rounded-xl bg-gradient-to-br text-white shadow-lg
          transition-all duration-200 hover:shadow-xl disabled:opacity-70
          ${
            isCheckedIn
              ? "from-slate-700 to-slate-900"
              : "from-indigo-600 to-indigo-700"
          }`}
      >
        {/* Icon */}
        {loading ? (
          <Loader2Icon className="size-7 animate-spin" />
        ) : isCheckedIn ? (
          <LogOutIcon className="size-7" />
        ) : (
          <LogInIcon className="size-7" />
        )}

        {/* Text */}
        <div className="relative flex flex-col items-center">
          <h2 className="text-lg font-medium mb-1">
            {loading
              ? "Processing..."
              : isCheckedIn
              ? "Clock Out"
              : "Clock In"}
          </h2>

          <p className="text-xs opacity-80">
            {isCheckedIn
              ? "Click to end your shift"
              : "Start your work day"}
          </p>
        </div>
      </button>
    </div>
  );
};

export default CheckInButton;