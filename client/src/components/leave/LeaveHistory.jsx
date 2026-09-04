import { Check, Loader2, X } from "lucide-react";
import React, { useState } from "react";
import { format } from "date-fns";
import api from "../../api/axios";
import toast from "react-hot-toast";

const LeaveHistory = ({ leaves = [], isAdmin, onUpdate }) => {
  const [processing, setProcessing] = useState(null);

  const handleStatusUpdate = async (id, status) => {
    if (!id) {
      toast.error("Leave application ID not found");
      return;
    }

    setProcessing(id);

    try {
      console.log("Updating leave:", id, status);

      const response = await api.patch(`/leave/${id}`, {
        status,
      });

      console.log("Leave status updated:", response.data);

      toast.success(
        status === "APPROVED"
          ? "Leave approved successfully"
          : "Leave rejected successfully"
      );

      // Refresh leave list
      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      console.error("Leave status update error:", error);

      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to update leave status"
      );
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="card overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="table-modern w-full">
          <thead>
            <tr>
              {isAdmin && <th>Employee</th>}

              <th>Type</th>
              <th>Dates</th>
              <th>Reason</th>
              <th>Status</th>

              {isAdmin && (
                <th className="text-center">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="text-center py-12 text-slate-400"
                >
                  No leave applications found!
                </td>
              </tr>
            ) : (
              leaves.map((leave) => {
                const leaveId = leave._id || leave.id;

                return (
                  <tr
                    key={leaveId}
                    className="border-t border-slate-100"
                  >
                    {/* Employee */}
                    {isAdmin && (
                      <td className="px-6 py-4 text-slate-900">
                        {leave.employee?.firstName ||
                          leave.employeeId?.firstName}{" "}
                        {leave.employee?.lastName ||
                          leave.employeeId?.lastName}
                      </td>
                    )}

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span className="badge bg-slate-100 text-slate-600">
                        {leave.type}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {format(
                        new Date(leave.startDate),
                        "MMM dd"
                      )}{" "}
                      -{" "}
                      {format(
                        new Date(leave.endDate),
                        "MMM dd"
                      )}
                    </td>

                    {/* Reason */}
                    <td
                      className="px-6 py-4 max-w-xs truncate text-slate-500"
                      title={leave.reason}
                    >
                      {leave.reason}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${
                          leave.status === "APPROVED"
                            ? "badge-success"
                            : leave.status === "REJECTED"
                            ? "badge-danger"
                            : "badge-warning"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>

                    {/* Actions */}
                    {isAdmin && (
                      <td className="px-6 py-4">
                        {leave.status === "PENDING" && (
                          <div className="flex justify-center gap-2">
                            {/* APPROVE */}
                            <button
                              type="button"
                              disabled={processing !== null}
                              onClick={() =>
                                handleStatusUpdate(
                                  leaveId,
                                  "APPROVED"
                                )
                              }
                              className="p-2 rounded-md bg-emerald-50 
                              text-emerald-700 hover:bg-emerald-200 
                              transition-colors disabled:opacity-50"
                              title="Approve Leave"
                            >
                              {processing === leaveId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>

                            {/* REJECT */}
                            <button
                              type="button"
                              disabled={processing !== null}
                              onClick={() =>
                                handleStatusUpdate(
                                  leaveId,
                                  "REJECTED"
                                )
                              }
                              className="p-2 rounded-md bg-rose-50 
                              text-rose-600 hover:bg-rose-200 
                              transition-colors disabled:opacity-50"
                              title="Reject Leave"
                            >
                              {processing === leaveId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveHistory;