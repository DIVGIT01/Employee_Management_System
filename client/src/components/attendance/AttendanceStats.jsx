import {
  AlertCircleIcon,
  CalendarIcon,
  ClockIcon,
} from "lucide-react";
import React from "react";

const AttendanceStats = ({ history = [] }) => {
  const totalPresent = history.filter(
    (h) => h.status === "PRESENT" || h.status === "LATE"
  ).length;

  const totalLate = history.filter(
    (h) => h.status === "LATE"
  ).length;

  const completedRecords = history.filter(
    (h) => h.workingHours !== undefined && h.workingHours !== null
  );

  const averageWorkHours =
    completedRecords.length > 0
      ? (
          completedRecords.reduce(
            (total, record) =>
              total + Number(record.workingHours || 0),
            0
          ) / completedRecords.length
        ).toFixed(1)
      : "0.0";

  const stats = [
    {
      label: "Days Present",
      value: totalPresent,
      icon: CalendarIcon,
    },
    {
      label: "Late Arrivals",
      value: totalLate,
      icon: AlertCircleIcon,
    },
    {
      label: "Avg. Work Hrs",
      value: `${averageWorkHours} hrs`,
      icon: ClockIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="card card-hover p-5 sm:p-6 flex items-center gap-4 relative overflow-hidden group"
          >
            {/* Left accent */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full
              bg-slate-500/70 group-hover:bg-indigo-500/80"
            />

            {/* Icon */}
            <div
              className="p-3 bg-slate-100 rounded-lg
              group-hover:bg-indigo-50 transition-colors duration-200"
            >
              <Icon
                className="w-5 h-5 text-slate-600
                group-hover:text-indigo-600 transition-colors duration-200"
              />
            </div>

            {/* Content */}
            <div>
              <p className="text-sm text-slate-500">
                {stat.label}
              </p>

              <p
                className="text-2xl font-bold text-slate-900
                tracking-tight"
              >
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceStats;