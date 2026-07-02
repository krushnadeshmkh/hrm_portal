import { useEffect, useState } from "react";
import { validateToken, isAuthenticated } from "../utils/auth";
import { emitSessionExpired } from "../utils/sessionEvents";

export const useSessionValidation = () => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      if (!isAuthenticated()) {
        setIsValidating(false);
        setIsValid(false);
        return;
      }

      const valid = validateToken();
      setIsValid(valid);
      setIsValidating(false);

      if (!valid) {
        emitSessionExpired("Your session has expired. Please sign in again.");
      }
    };

    checkSession();

    const interval = setInterval(checkSession, 15 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { isValidating, isValid };
};