import { useEffect } from "react";
import { emitSessionExpired } from "../utils/sessionEvents";

export const useInactivityLogout = (timeoutMinutes = 30) => {
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        emitSessionExpired("Logged out due to inactivity.");
      }, timeoutMinutes * 60 * 1000);
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
      clearTimeout(timer);
    };
  }, [timeoutMinutes]);
};