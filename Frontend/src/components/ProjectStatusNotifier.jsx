import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../store/projectThunk";
import { getToken } from "../services/api";
import "./projectStatusNotifier.css";

const POLL_INTERVAL_MS = 30000;
const getProjectId = (project) => project?._id || project?.id || "";
const getProjectDisplayName = (project) => project?.projectName?.trim() || "Untitled Project";

export default function ProjectStatusNotifier() {
  const dispatch = useDispatch();
  const { projectList } = useSelector((state) => state.project);
  const [notifications, setNotifications] = useState([]);
  const previousStatusesRef = useRef({});
  const nextNotificationId = useRef(1);

  useEffect(() => {
    if (!getToken()) return undefined;

    dispatch(fetchProjects());
    const intervalId = window.setInterval(() => {
      dispatch(fetchProjects());
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    if (!Array.isArray(projectList) || projectList.length === 0) {
      return;
    }

    const nextStatuses = {};

    projectList.forEach((project, index) => {
      const projectId = getProjectId(project) || `project-${index}`;
      const currentStatus = project?.status || "";
      const previousStatus = previousStatusesRef.current[projectId];

      nextStatuses[projectId] = currentStatus;

      if (previousStatus === "DRAFTING" && currentStatus === "WAITING_USER_INPUT") {
        const projectName = getProjectDisplayName(project);
        const notificationId = nextNotificationId.current++;

        setNotifications((prev) => [
          ...prev,
          {
            id: notificationId,
            title: "Project Update",
            message: `${projectName} is waiting for user input.`,
          },
        ]);

        window.setTimeout(() => {
          setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
        }, 5000);
      }
    });

    previousStatusesRef.current = nextStatuses;
  }, [projectList]);

  if (notifications.length === 0) return null;

  return (
    <div className="project-status-notifier">
      {notifications.map((notification) => (
        <div key={notification.id} className="project-status-toast">
          <strong>{notification.title}</strong>
          <span>{notification.message}</span>
        </div>
      ))}
    </div>
  );
}
