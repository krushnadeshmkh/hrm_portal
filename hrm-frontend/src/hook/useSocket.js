import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socketInstance = null;

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io(
        import.meta.env.VITE_API_URL || "http://localhost:5001",
        {
          auth: { token },
          transports: ["websocket"],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        }
      );
    }

    socketRef.current = socketInstance;
  }, []);

  return socketRef.current ?? socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}