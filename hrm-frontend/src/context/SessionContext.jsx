import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onSessionExpired } from "../utils/sessionEvents";
import { clearUserSession } from "../utils/auth";
import { useSessionValidation } from "../hook/useSessionValidation";
import SessionExpiredModal from "../components/SessionExpiredModal";

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [expired, setExpired] = useState(false);
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  useSessionValidation();

  useEffect(() => {
    const unsubscribe = onSessionExpired((msg) => {
      setReason(msg || "Your session has expired. Please sign in again to continue.");
      setExpired(true);
    });
    return unsubscribe;
  }, []);

  const handleSignInAgain = useCallback(() => {
    clearUserSession();
    setExpired(false);
    navigate("/login", { state: { message: reason } });
  }, [navigate, reason]);

  return (
    <SessionContext.Provider value={{ expired }}>
      {children}
      {expired && <SessionExpiredModal message={reason} onSignIn={handleSignInAgain} />}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);