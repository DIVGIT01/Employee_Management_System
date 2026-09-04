import { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import CheckInButton from "../components/attendance/CheckInButton";
import AttendanceStats from "../components/attendance/AttendanceStats";
import AttendanceHistory from "../components/attendance/AttendanceHistory";
import api from "../api/axios";
import toast from "react-hot-toast";

const Attendance = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/attendance");

      const json = res.data;

      console.log("Attendance response:", json);

      // Backend returns { data: history }
      setHistory(Array.isArray(json?.data) ? json.data : []);

      setIsDeleted(Boolean(json?.employee?.isDeleted));
    } catch (error) {
      console.error("Attendance fetch error:", error);

      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch attendance data"
      );

      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <Loading />;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayRecord = history.find((record) => {
    if (!record?.date) return false;

    return (
      new Date(record.date).toDateString() ===
      today.toDateString()
    );
  });

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>

        <p className="page-subtitle">
          Track your work hours and daily check-ins
        </p>
      </div>

      {/* Check-in section */}
      {isDeleted ? (
        <div
          className="mb-6 p-6 bg-rose-50 border border-rose-200
          rounded-2xl text-center"
        >
          <p>
            You can no longer clock in or out because your employee
            records have been marked as deleted.
          </p>
        </div>
      ) : (
        <CheckInButton
          todayRecord={todayRecord}
          onAction={fetchData}
        />
      )}

      {/* Statistics */}
      <AttendanceStats history={history} />

      {/* History */}
      <AttendanceHistory history={history} />
    </div>
  );
};

export default Attendance;