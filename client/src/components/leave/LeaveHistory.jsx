import { Check, Loader2, X } from "lucide-react";
import React, { useState } from "react";
import { format } from "date-fns";

const LeaveHistory = ({ leaves = [], isAdmin, onUpdate }) => {
  const [processing, setProcessing] = useState(null);

  const handleStatusUpdate = async (id, status) => {
    setProcessing(id);

    try {
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update leave status:", error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="card overflow-hidden mt-6">

      {/* Table */}
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
                        {leave.employee?.firstName}{" "}
                        {leave.employee?.lastName}
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

                    {/* Admin Actions */}
                    {isAdmin && (
                      <td className="px-6 py-4">
                        {leave.status === "PENDING" && (
                          <div className="flex justify-center gap-2">

                            {/* Approve */}
                            <button
                              disabled={!!processing}
                              onClick={() =>
                                handleStatusUpdate(
                                  leaveId,
                                  "APPROVED"
                                )
                              }
                              className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-200 transition-colors"
                            >
                              {processing === leaveId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>

                            {/* Reject */}
                            <button
                              disabled={!!processing}
                              onClick={() =>
                                handleStatusUpdate(
                                  leaveId,
                                  "REJECTED"
                                )
                              }
                              className="p-1.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-200 transition-colors"
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