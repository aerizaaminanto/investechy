import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EXIT_DURATION_MS = 180;
const EXIT_CLASS_NAME = "admin-route-exiting";

export const useAdminPageTransition = () => {
  const navigate = useNavigate();
  const [transitionStage, setTransitionStage] = useState("entering");

  useEffect(() => {
    document.body.classList.remove(EXIT_CLASS_NAME);

    const enterFrame = requestAnimationFrame(() => {
      setTransitionStage("entered");
    });

    return () => {
      cancelAnimationFrame(enterFrame);
    };
  }, []);

  const navigateWithTransition = (path) => {
    if (!path) {
      return;
    }

    document.body.classList.add(EXIT_CLASS_NAME);
    window.setTimeout(() => {
      navigate(path);
    }, EXIT_DURATION_MS);
  };

  return {
    transitionClassName: `admin-page-shell is-${transitionStage}`,
    navigateWithTransition,
  };
};

export const ADMIN_EXIT_DURATION_MS = EXIT_DURATION_MS;
