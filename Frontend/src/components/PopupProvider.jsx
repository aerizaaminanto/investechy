import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useAppSettings } from "../context/AppSettingsContext";
import "./popup.css";

const PopupContext = createContext(null);

const resolveLocalizedText = (input, language, fallback = "") => {
  if (!input) return fallback;
  if (typeof input === "string") return input;
  if (typeof input === "object") {
    if (language === "id") {
      return input.id || input.en || fallback;
    }

    return input.en || input.id || fallback;
  }

  return fallback;
};

const normalizeDialogOptions = (input, fallbackTitle, language) => {
  if (typeof input === "string") {
    return {
      title: resolveLocalizedText(fallbackTitle, language),
      message: input,
    };
  }

  return {
    title: resolveLocalizedText(input?.title, language, resolveLocalizedText(fallbackTitle, language)),
    message: resolveLocalizedText(input?.message, language, ""),
    confirmText: resolveLocalizedText(input?.confirmText, language),
    cancelText: resolveLocalizedText(input?.cancelText, language),
    tone: input?.tone || "default",
  };
};

const normalizeToastOptions = (input, language) => {
  if (typeof input === "string") {
    return {
      title: resolveLocalizedText({ id: "Info", en: "Info" }, language),
      message: input,
      tone: "default",
    };
  }

  return {
    title: resolveLocalizedText(input?.title, language, "Info"),
    message: resolveLocalizedText(input?.message, language, ""),
    tone: input?.tone || "default",
  };
};

export function PopupProvider({ children }) {
  const { settings } = useAppSettings();
  const language = settings?.language === "id" ? "id" : "en";
  const [dialog, setDialog] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(1);
  const dialogResolverRef = useRef(null);

  const closeDialog = useCallback((result) => {
    if (dialogResolverRef.current) {
      dialogResolverRef.current(result);
      dialogResolverRef.current = null;
    }
    setDialog(null);
  }, []);

  const alert = useCallback((input) => {
    const options = normalizeDialogOptions(input, { id: "Informasi", en: "Information" }, language);

    return new Promise((resolve) => {
      dialogResolverRef.current = resolve;
      setDialog({
        ...options,
        kind: "alert",
        confirmText: options.confirmText || resolveLocalizedText({ id: "Mengerti", en: "OK" }, language),
      });
    });
  }, [language]);

  const confirm = useCallback((input) => {
    const options = normalizeDialogOptions(input, { id: "Konfirmasi", en: "Confirmation" }, language);

    return new Promise((resolve) => {
      dialogResolverRef.current = resolve;
      setDialog({
        ...options,
        kind: "confirm",
        confirmText: options.confirmText || resolveLocalizedText({ id: "Lanjutkan", en: "Continue" }, language),
        cancelText: options.cancelText || resolveLocalizedText({ id: "Batal", en: "Cancel" }, language),
      });
    });
  }, [language]);

  const notify = useCallback((input) => {
    const options = normalizeToastOptions(input, language);
    const toastId = toastIdRef.current++;

    setToasts((prev) => [...prev, { id: toastId, ...options }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
    }, 4200);
  }, [language]);

  const value = useMemo(
    () => ({
      alert,
      confirm,
      notify,
    }),
    [alert, confirm, notify],
  );

  return (
    <PopupContext.Provider value={value}>
      {children}

      {dialog ? (
        <div className="popup-overlay" onClick={() => closeDialog(dialog.kind === "confirm" ? false : true)}>
          <div
            className={`popup-dialog popup-tone-${dialog.tone}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="popup-accent" />
            <div className="popup-content">
              <span className="popup-eyebrow">
                {dialog.kind === "confirm"
                  ? resolveLocalizedText({ id: "Konfirmasi Aksi", en: "Confirm Action" }, language)
                  : resolveLocalizedText({ id: "Notifikasi", en: "Notification" }, language)}
              </span>
              <h3>{dialog.title}</h3>
              <p>{dialog.message}</p>

              <div className="popup-actions">
                {dialog.kind === "confirm" ? (
                  <button
                    type="button"
                    className="popup-btn popup-btn-ghost"
                    onClick={() => closeDialog(false)}
                  >
                    {dialog.cancelText}
                  </button>
                ) : null}
                <button
                  type="button"
                  className={`popup-btn ${dialog.kind === "confirm" ? "popup-btn-danger" : "popup-btn-primary"}`}
                  onClick={() => closeDialog(true)}
                >
                  {dialog.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {toasts.length > 0 ? (
        <div className="popup-toast-stack" aria-live="polite" aria-atomic="true">
          {toasts.map((toast) => (
            <div key={toast.id} className={`popup-toast popup-tone-${toast.tone}`}>
              <div className="popup-toast-mark" />
              <div>
                <strong>{toast.title}</strong>
                <span>{toast.message}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);

  if (!context) {
    throw new Error("usePopup must be used inside PopupProvider.");
  }

  return context;
}
