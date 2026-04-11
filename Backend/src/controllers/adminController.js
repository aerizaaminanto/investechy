import { Project } from "../models/index.js";

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
const addDays = (date, amount) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

const startOfWeek = (date) => {
  const current = startOfDay(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(current, diff);
};

const addWeeks = (date, amount) => addDays(date, amount * 7);
const formatDate = (date) => date.toISOString().split("T")[0];

const getAdminDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = endOfDay(now);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);

    const projectsToday = await Project.countDocuments({
      createdAt: { $gte: todayStart, $lt: tomorrowStart },
    });

    const dailyLast7Days = await Promise.all(
      Array.from({ length: 7 }, async (_, index) => {
        const date = addDays(todayStart, -(6 - index));
        const nextDate = addDays(date, 1);
        const total = await Project.countDocuments({
          createdAt: { $gte: date, $lt: nextDate },
        });

        return {
          date: formatDate(date),
          total,
        };
      })
    );

    const currentWeekStart = startOfWeek(now);
    const weeklyLast4Weeks = await Promise.all(
      Array.from({ length: 4 }, async (_, index) => {
        const weekStart = addWeeks(currentWeekStart, -(3 - index));
        const weekEnd = addWeeks(weekStart, 1);
        const total = await Project.countDocuments({
          createdAt: { $gte: weekStart, $lt: weekEnd },
        });

        return {
          weekStart: formatDate(weekStart),
          weekEnd: formatDate(addDays(weekEnd, -1)),
          total,
        };
      })
    );

    const yearlyTotal = await Project.countDocuments({
      createdAt: { $gte: yearStart, $lt: nextYearStart },
    });

    res.status(200).json({
      status: "success",
      message: "Admin dashboard successfully retrieved.",
      data: {
        projectsToday,
        dailyLast7Days,
        weeklyLast4Weeks,
        yearlyTotal,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getAdminDashboard };
