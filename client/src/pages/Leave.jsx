import { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

import {
  PlusIcon,
  ThermometerIcon,
  PalmtreeIcon,
  UmbrellaIcon,
} from "lucide-react";

import LeaveHistory from "../components/leave/LeaveHistory";
import ApplyLeaveModal from "../components/leave/ApplyLeaveModal";

const Leave = () => {
  const { user } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const fetchLeaves = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get("/leave");

      setLeaves(res.data?.data || []);

      if (res.data?.employee?.isDeleted) {
        setIsDeleted(true);
      } else {
        setIsDeleted(false);
      }
    } catch (error) {
      console.error("Error fetching leave data:", error);

      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to load leave data"
      );

      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  if (loading) {
    return <Loading />;
  }

  const approvedLeaves = leaves.filter(
    (leave) => leave.status === "APPROVED"
  );

  const sickCount = approvedLeaves.filter(
    (leave) => leave.type === "SICK"
  ).length;

  const casualCount = approvedLeaves.filter(
    (leave) => leave.type === "CASUAL"
  ).length;

  const annualCount = approvedLeaves.filter(
    (leave) => leave.type === "ANNUAL"
  ).length;

  const leaveStats = [
    {
      label: "Sick Leave",
      value: sickCount,
      icon: ThermometerIcon,
    },
    {
      label: "Annual Leave",
      value: annualCount,
      icon: PalmtreeIcon,
    },
    {
      label: "Casual Leave",
      value: casualCount,
      icon: UmbrellaIcon,
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Leave Management</h1>

          <p className="page-subtitle">
            {isAdmin
              ? "Manage leave applications"
              : "Your leave history and requests"}
          </p>
        </div>

        {!isAdmin && !isDeleted && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <PlusIcon className="w-4 h-4" />
            Apply for Leave
          </button>
        )}
      </div>

      {/* Leave Statistics */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {leaveStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="card card-hover p-5 sm:p-6 flex items-center gap-4 relative overflow-hidden group"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 
                  rounded-r-full bg-slate-500/70 
                  group-hover:bg-indigo-500/70"
                />

                <div
                  className="p-3 bg-slate-100 rounded-lg 
                  group-hover:bg-indigo-50 transition-colors duration-200"
                >
                  <Icon
                    className="w-5 h-5 text-slate-600 
                    group-hover:text-indigo-600 transition-colors duration-200"
                  />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {stat.label}
                  </p>

                  <p
                    className="text-2xl font-bold text-slate-900 
                    tracking-tight"
                  >
                    {stat.value}

                    <span
                      className="text-sm font-normal 
                      text-slate-400 ml-1"
                    >
                      taken
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leave History */}
      <LeaveHistory
        leaves={leaves}
        isAdmin={isAdmin}
        onUpdate={fetchLeaves}
      />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchLeaves}
      />
    </div>
  );
};

export default Leave;