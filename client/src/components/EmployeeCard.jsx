import React from "react";
import {
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const EmployeeCard = ({
  employee,
  onDelete,
  onEdit,
}) => {

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/employees/${employee.id || employee._id}`
      );

      toast.success(
        "Employee deleted successfully"
      );

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error(
        "Delete employee error:",
        error
      );

      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to delete employee"
      );
    }
  };

  const firstInitial =
    employee?.firstName?.charAt(0)?.toUpperCase() || "";

  const lastInitial =
    employee?.lastName?.charAt(0)?.toUpperCase() || "";

  return (
    <div className="group relative card card-hover overflow-hidden">

      {/* =====================================================
          EMPLOYEE IMAGE / AVATAR
      ====================================================== */}

      <div className="relative aspect-4/3 w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-50">

        <div className="w-full h-full flex items-center justify-center">

          <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-200 to-slate-100 flex items-center justify-center">

            <span className="text-2xl font-medium text-indigo-400">
              {firstInitial}
              {lastInitial}
            </span>

          </div>
        </div>
      </div>

      {/* =====================================================
          DEPARTMENT / STATUS
      ====================================================== */}

      <div className="absolute top-3 left-3 flex gap-2">

        <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-slate-600 rounded-lg shadow-sm">
          {employee?.department || "Remote"}
        </span>

        {employee?.isDeleted && (
          <span className="bg-red-500/80 font-medium text-white px-2.5 py-1 text-xs rounded">
            DELETED
          </span>
        )}

      </div>

      {/* =====================================================
          EDIT / DELETE ACTIONS
      ====================================================== */}

      {!employee?.isDeleted && (
        <div className="absolute inset-0 bg-linear-to-t from-indigo-700/20 transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 gap-3">

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(employee)}
            className="p-2.5 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-indigo-600 rounded-xl shadow-lg transition-all hover:scale-105"
            title="Edit Employee"
          >
            <PencilIcon className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            className="p-2.5 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-600 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            title="Delete Employee"
          >
            <Trash2Icon className="w-4 h-4" />
          </button>

        </div>
      )}

      {/* =====================================================
          EMPLOYEE DETAILS
      ====================================================== */}

      <div className="p-5">

        <h3 className="text-slate-900">
          {employee?.firstName}{" "}
          {employee?.lastName}
        </h3>

        <p className="text-xs text-slate-500">
          {employee?.position}
        </p>

      </div>
    </div>
  );
};

export default EmployeeCard;