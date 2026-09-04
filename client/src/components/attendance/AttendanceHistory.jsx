import React from "react";

const AttendanceHistory = ({ history = [] }) => {
  const getDayType = (record) => {
    if (record.dayType) {
      return {
        label: record.dayType,
        className:
          record.dayType === "Full Day"
            ? "badge badge-success"
            : record.dayType === "Half Day"
            ? "badge badge-warning"
            : "badge",
      };
    }

    if (record.isWeekend) {
      return {
        label: "Weekend",
        className: "badge",
      };
    }

    const date = new Date(record.date);
    const day = date.getDay();

    if (day === 0 || day === 6) {
      return {
        label: "Weekend",
        className: "badge",
      };
    }

    return {
      label: "Workday",
      className: "badge",
    };
  };

  const formatTime = (time) => {
    if (!time) return "--";

    try {
      return new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--";
    }
  };

  const getWorkingHoursDisplay = (record) => {
    if (
      record.workingHours !== undefined &&
      record.workingHours !== null
    ) {
      const hours = Number(record.workingHours);

      if (!isNaN(hours)) {
        const wholeHours = Math.floor(hours);
        const minutes = Math.round((hours - wholeHours) * 60);

        return `${wholeHours}h ${minutes}m`;
      }
    }

    const checkIn = record.checkIn;
    const checkOut = record.checkOut;

    if (!checkIn || !checkOut) {
      return "--";
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const difference = end - start;

    if (difference <= 0) {
      return "--";
    }

    const totalMinutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const getStatus = (record) => {
    if (record.status) {
      return record.status;
    }

    if (record.checkOut) {
      return "PRESENT";
    }

    if (record.checkIn) {
      return "PRESENT";
    }

    return "ABSENT";
  };

  return (
    <div className="card overflow-hidden mt-6">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">
          Recent Activity
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          Your recent attendance records
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-modern w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left">
                Date
              </th>

              <th className="px-6 py-4 text-left">
                Check In
              </th>

              <th className="px-6 py-4 text-left">
                Check Out
              </th>

              <th className="px-6 py-4 text-left">
                Working Hours
              </th>

              <th className="px-6 py-4 text-left">
                Day Type
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-slate-400"
                >
                  No Record Found
                </td>
              </tr>
            ) : (
              history.map((record) => {
                const dayType = getDayType(record);
                const status = getStatus(record);

                return (
                  <tr
                    key={record._id || record.id}
                    className="border-t border-slate-100"
                  >
                    {/* Date */}
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {new Date(
                        record.date
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </td>

                    {/* Check In */}
                    <td className="px-6 py-4 text-slate-600">
                      {formatTime(record.checkIn)}
                    </td>

                    {/* Check Out */}
                    <td className="px-6 py-4 text-slate-600">
                      {formatTime(record.checkOut)}
                    </td>

                    {/* Working Hours */}
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {getWorkingHoursDisplay(record)}
                    </td>

                    {/* Day Type */}
                    <td className="px-6 py-4">
                      <span className={dayType.className}>
                        {dayType.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${
                          status === "PRESENT"
                            ? "badge-success"
                            : status === "LATE"
                            ? "badge-warning"
                            : status === "ABSENT"
                            ? "badge-danger"
                            : ""
                        }`}
                      >
                        {status}
                      </span>
                    </td>
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

export default AttendanceHistory;