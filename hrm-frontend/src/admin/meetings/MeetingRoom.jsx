import React, { useState, useEffect, useRef } from "react";
import {
  Video, VideoOff, Mic, MicOff, Phone, MessageCircle,
  Users, ScreenShare, Monitor, X, Hand,
  Maximize2, Minimize2, Copy, Check
} from "lucide-react";
import io from "socket.io-client";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const RemoteVideo = ({ stream }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://hrm-backend-vvqg.onrender.com";

const resolveFromStorage = (...keys) => {
  for (const key of keys) {
    const val = localStorage.getItem(key);
    if (val && val !== "null" && val !== "undefined") return val;
  }
  return null;
};

const resolveUserFromStorage = () => {
  const id = resolveFromStorage("userId", "employeeId", "id") || "user_" + Date.now();
  let name = resolveFromStorage("name", "userName", "username", "user_name");
  let email = resolveFromStorage("email");

  if (!name || !email) {
    try {
      const parsed = JSON.parse(localStorage.getItem("user") || "{}");
      if (!name) name = parsed.name || parsed.userName || parsed.username || parsed.user_name || null;
      if (!email) email = parsed.email || null;
    } catch (_) {}
  }

  if (!name) {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (!name) name = payload.name || payload.userName || null;
        if (!email) email = payload.email || null;
      }
    } catch (_) {}
  }

  return {
    id,
    name: name || "User",
    email: email || "",
    sessionId: id + "_" + Math.random().toString(36).slice(2, 8),
  };
};

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

const MeetingRoom = () => {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [mediaError, setMediaError] = useState(null);
  const [mediaReady, setMediaReady] = useState(false);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({});
  const screenStreamRef = useRef(null);
  const containerRef = useRef(null);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  const pendingPeers = useRef([]);
  const mySocketIdRef = useRef(null);
  const isVideoOffRef = useRef(false);
  const isMutedRef = useRef(false);

  const user = useRef(resolveUserFromStorage()).current;

  const t = {
    bg: isDark ? "#0F1219" : "#F9FAFB",
    card: isDark ? "#161B27" : "#fff",
    border: isDark ? "#1E2535" : "#F1F3F9",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
  };

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      try {
        setIsLoading(true);
        await fetchMeetingInfo();
        if (!mounted) return;
        await initializeMedia();
        if (!mounted) return;
        setMediaReady(true);
        initializeSocket();
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    initialize();
    return () => {
      mounted = false;
      cleanup();
    };
  }, [meetingCode]);

  useEffect(() => {
    if (mediaReady && pendingPeers.current.length > 0) {
      pendingPeers.current.forEach((socketId) => {
        if (socketId !== mySocketIdRef.current) {
          createPeerConnection(socketId, true);
        }
      });
      pendingPeers.current = [];
    }
  }, [mediaReady]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [mediaReady]);

  const fetchMeetingInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/meetings/by-code/${meetingCode}`,
        { headers: { "x-auth-token": token } }
      );
      const data = response.data.data;
      setMeetingInfo(data);
      const creatorId = data.created_by?._id || data.created_by;
      setIsCreator(String(creatorId) === String(user.id));
    } catch (error) {
      console.error("Error fetching meeting info:", error);
      if (error.response?.status === 404) navigate("/meetings");
      throw error;
    }
  };

  const attachLocalVideo = (stream, attempts = 0) => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    } else if (attempts < 20) {
      setTimeout(() => attachLocalVideo(stream, attempts + 1), 100);
    }
  };

  const initializeMedia = async () => {
    try {
      setMediaError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: true,
      });
      localStreamRef.current = stream;
      attachLocalVideo(stream);
      setIsVideoOff(false);
      setIsMuted(false);
      isVideoOffRef.current = false;
      isMutedRef.current = false;
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      let msg = "Failed to access camera or microphone. Please check your permissions.";
      if (error.name === "NotAllowedError") {
        msg = "Camera and microphone access was denied. Please allow access and reload.";
      } else if (error.name === "NotFoundError") {
        msg = "No camera or microphone found. Please connect a device and reload.";
      }
      setMediaError(msg);
      throw error;
    }
  };

  const renegotiate = async (socketId) => {
    const pc = peerConnections.current[socketId];
    if (!pc || !socketRef.current?.connected) return;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit("offer", { offer: pc.localDescription, to: socketId });
    } catch (err) {
      console.error("Renegotiation error for", socketId, err);
    }
  };

  const renegotiateAll = () => {
    Object.keys(peerConnections.current).forEach((socketId) => {
      renegotiate(socketId);
    });
  };

  const initializeSocket = () => {
    const token = localStorage.getItem("token");
    const newSocket = io(BACKEND_URL, {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      mySocketIdRef.current = newSocket.id;
      setIsConnected(true);
      newSocket.emit("join-meeting-room", {
        meetingCode,
        userId: user.sessionId,
        userName: user.name,
        userEmail: user.email,
      });
    });

    newSocket.on("meeting-joined", (data) => {
      const filtered = data.participants.filter((p) => p.userId !== user.sessionId);
      setParticipants(filtered);
      filtered.forEach((p) => {
        if (p.socketId !== mySocketIdRef.current) {
          if (localStreamRef.current) {
            setTimeout(() => createPeerConnection(p.socketId, true), 500);
          } else {
            pendingPeers.current.push(p.socketId);
          }
        }
      });
    });

    newSocket.on("user-joined", (data) => {
      if (data.userId === user.sessionId || data.socketId === mySocketIdRef.current) return;
      setParticipants((prev) => {
        if (prev.some((p) => p.socketId === data.socketId)) return prev;
        return [...prev, data];
      });
      if (localStreamRef.current) {
        setTimeout(() => createPeerConnection(data.socketId, true), 500);
      } else {
        pendingPeers.current.push(data.socketId);
      }
    });

    newSocket.on("user-left", (data) => {
      setParticipants((prev) => prev.filter((p) => p.socketId !== data.socketId));
      if (peerConnections.current[data.socketId]) {
        peerConnections.current[data.socketId].close();
        delete peerConnections.current[data.socketId];
      }
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[data.socketId];
        return next;
      });
    });

    newSocket.on("offer", async (data) => {
      if (data.from === mySocketIdRef.current) return;
      try {
        if (!peerConnections.current[data.from]) {
          createPeerConnection(data.from, false);
        }
        const pc = peerConnections.current[data.from];
        if (!pc || !data.offer) return;

        if (pc.signalingState !== "stable") {
          await pc.setLocalDescription({ type: "rollback" });
        }

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit("answer", { answer, to: data.from });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });

    newSocket.on("answer", async (data) => {
      if (data.from === mySocketIdRef.current) return;
      try {
        const pc = peerConnections.current[data.from];
        if (pc && data.answer && pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    });

    newSocket.on("ice-candidate", async (data) => {
      if (data.from === mySocketIdRef.current) return;
      try {
        const pc = peerConnections.current[data.from];
        if (pc && data.candidate && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    newSocket.on("new-chat-message", (data) => {
      setMessages((prev) => [...prev, { ...data, isOwn: false }]);
    });

    newSocket.on("participant-audio-toggled", (data) => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === data.userId ? { ...p, isMuted: data.isMuted } : p))
      );
    });

    newSocket.on("participant-video-toggled", (data) => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === data.userId ? { ...p, isVideoOff: data.isVideoOff } : p))
      );
    });

    newSocket.on("screen-share-started", (data) => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === data.userId ? { ...p, isSharingScreen: true } : p))
      );
    });

    newSocket.on("screen-share-stopped", (data) => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === data.userId ? { ...p, isSharingScreen: false } : p))
      );
    });

    newSocket.on("hand-raised", (data) => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === data.userId ? { ...p, handRaised: true } : p))
      );
    });

    newSocket.on("hand-lowered", (data) => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === data.userId ? { ...p, handRaised: false } : p))
      );
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    return newSocket;
  };

  const createPeerConnection = (socketId, shouldCreateOffer = true) => {
    if (socketId === mySocketIdRef.current) return null;
    if (peerConnections.current[socketId]) return peerConnections.current[socketId];

    const pc = new RTCPeerConnection(ICE_SERVERS);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", { candidate: event.candidate, to: socketId });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev) => ({ ...prev, [socketId]: event.streams[0] }));
      }
    };

    pc.onnegotiationneeded = async () => {
      if (!shouldCreateOffer) return;
      try {
        if (pc.signalingState !== "stable") return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (socketRef.current?.connected) {
          socketRef.current.emit("offer", { offer: pc.localDescription, to: socketId });
        }
      } catch (err) {
        console.error("onnegotiationneeded error:", err);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") {
        setTimeout(() => {
          if (peerConnections.current[socketId]) {
            peerConnections.current[socketId].close();
            delete peerConnections.current[socketId];
            createPeerConnection(socketId, true);
          }
        }, 3000);
      }
    };

    peerConnections.current[socketId] = pc;

    if (shouldCreateOffer && socketRef.current?.connected) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socketRef.current.emit("offer", { offer: pc.localDescription, to: socketId });
        })
        .catch((err) => console.error("Error creating offer:", err));
    }

    return pc;
  };

  const toggleMute = async () => {
    if (!localStreamRef.current) {
      try { await initializeMedia(); } catch (_) { return; }
    }
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    const muted = !audioTrack.enabled;
    isMutedRef.current = muted;
    setIsMuted(muted);
    socketRef.current?.emit("toggle-audio", { meetingCode, isMuted: muted });
  };

  const toggleVideo = async () => {
    if (!localStreamRef.current) {
      try { await initializeMedia(); } catch (_) { return; }
    }

    if (!isVideoOffRef.current) {
      try {
        const videoTrack = localStreamRef.current?.getVideoTracks()[0];
        if (!videoTrack) return;

        videoTrack.enabled = false;
        videoTrack.stop();

        const newStream = new MediaStream();
        localStreamRef.current.getAudioTracks().forEach((track) => newStream.addTrack(track));
        localStreamRef.current = newStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }

        Object.values(peerConnections.current).forEach((pc) => {
          const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (videoSender) {
            pc.removeTrack(videoSender);
          }
        });

        renegotiateAll();

        isVideoOffRef.current = true;
        setIsVideoOff(true);
        socketRef.current?.emit("toggle-video", { meetingCode, isVideoOff: true });
      } catch (err) {
        console.error("Error turning off camera:", err);
      }
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        const newVideoTrack = newStream.getVideoTracks()[0];

        localStreamRef.current.addTrack(newVideoTrack);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }

        Object.values(peerConnections.current).forEach((pc) => {
          pc.addTrack(newVideoTrack, localStreamRef.current);
        });

        renegotiateAll();

        isVideoOffRef.current = false;
        setIsVideoOff(false);
        socketRef.current?.emit("toggle-video", { meetingCode, isVideoOff: false });
      } catch (err) {
        console.error("Error turning on camera:", err);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
          audio: true,
        });

        screenStreamRef.current = screenStream;
        const screenVideoTrack = screenStream.getVideoTracks()[0];
        const screenAudioTrack = screenStream.getAudioTracks()[0];

        Object.entries(peerConnections.current).forEach(([socketId, pc]) => {
          const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(screenVideoTrack).catch(() => {
              pc.removeTrack(videoSender);
              pc.addTrack(screenVideoTrack, screenStream);
              renegotiate(socketId);
            });
          } else {
            pc.addTrack(screenVideoTrack, screenStream);
            renegotiate(socketId);
          }

          if (screenAudioTrack) {
            const audioSender = pc.getSenders().find((s) => s.track?.kind === "audio");
            if (audioSender) {
              audioSender.replaceTrack(screenAudioTrack).catch(() => {
                pc.removeTrack(audioSender);
                pc.addTrack(screenAudioTrack, screenStream);
                renegotiate(socketId);
              });
            } else {
              pc.addTrack(screenAudioTrack, screenStream);
              renegotiate(socketId);
            }
          }
        });

        screenVideoTrack.onended = () => stopScreenShare();

        setIsScreenSharing(true);
        socketRef.current?.emit("start-screen-share", { meetingCode });
      } catch (error) {
        if (error.name !== "NotAllowedError" && error.name !== "PermissionDeniedError") {
          console.error("Error sharing screen:", error);
        }
        setIsScreenSharing(false);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    setIsScreenSharing(false);
    socketRef.current?.emit("stop-screen-share", { meetingCode });

    if (!isVideoOffRef.current) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        const newVideoTrack = newStream.getVideoTracks()[0];

        localStreamRef.current.addTrack(newVideoTrack);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }

        Object.entries(peerConnections.current).forEach(([socketId, pc]) => {
          const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(newVideoTrack).catch(() => {
              pc.removeTrack(videoSender);
              pc.addTrack(newVideoTrack, localStreamRef.current);
              renegotiate(socketId);
            });
          } else {
            pc.addTrack(newVideoTrack, localStreamRef.current);
            renegotiate(socketId);
          }
        });

        const localAudioTrack = localStreamRef.current?.getAudioTracks()[0];
        if (localAudioTrack) {
          Object.values(peerConnections.current).forEach((pc) => {
            const audioSender = pc.getSenders().find((s) => s.track?.kind === "audio");
            if (audioSender) {
              audioSender.replaceTrack(localAudioTrack).catch((err) =>
                console.error("Error restoring audio:", err)
              );
            }
          });
        }
      } catch (err) {
        console.error("Error restoring camera after screen share:", err);
      }
    } else {
      Object.entries(peerConnections.current).forEach(([socketId, pc]) => {
        const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (videoSender) {
          pc.removeTrack(videoSender);
          renegotiate(socketId);
        }
      });
    }
  };

  const toggleHandRaise = () => {
    setHandRaised((prev) => {
      socketRef.current?.emit(prev ? "lower-hand" : "raise-hand", { meetingCode });
      return !prev;
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && socketRef.current) {
      socketRef.current.emit("meeting-chat-message", { message: messageInput, meetingCode });
      setMessages((prev) => [
        ...prev,
        {
          message: messageInput,
          userName: user.name,
          userId: user.sessionId,
          timestamp: new Date(),
          isOwn: true,
        },
      ]);
      setMessageInput("");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meeting-room/${meetingCode}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const leaveMeeting = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BACKEND_URL}/api/meetings/${meetingInfo?._id}/leave`,
        {},
        { headers: { "x-auth-token": token } }
      );
    } catch (error) {
      console.error("Error leaving meeting:", error);
    }
    cleanup();
    navigate("/meetings");
  };

  const cleanup = () => {
    socketRef.current?.disconnect();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    Object.values(peerConnections.current).forEach((pc) => {
      try { pc.close(); } catch (_) {}
    });
    peerConnections.current = {};
    setRemoteStreams({});
  };

  if (isLoading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, border: "3px solid #EEF2FF",
            borderTop: "3px solid #4F46E5", borderRadius: "50%",
            animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
          }} />
          <p style={{ color: t.textMuted }}>Loading meeting...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (mediaError) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          textAlign: "center", padding: "32px", backgroundColor: t.card,
          borderRadius: "16px", border: `1px solid ${t.border}`, maxWidth: "400px",
        }}>
          <VideoOff size={48} style={{ color: "#EF4444", marginBottom: "16px" }} />
          <h3 style={{ color: t.textPrimary, marginBottom: "8px" }}>Media Access Error</h3>
          <p style={{ color: t.textSecondary, fontSize: "0.9rem", marginBottom: "20px" }}>{mediaError}</p>
          <button
            onClick={() => {
              setMediaError(null);
              setIsLoading(true);
              initializeMedia()
                .then(() => { setMediaReady(true); initializeSocket(); })
                .finally(() => setIsLoading(false));
            }}
            style={{
              padding: "10px 24px", borderRadius: "8px", border: "none",
              background: "#4F46E5", color: "#fff", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const allParticipants = [
    { ...user, id: user.sessionId, socketId: "local", isLocal: true, isMuted, isVideoOff, isScreenSharing },
    ...participants,
  ];

  const gridCols = Math.min(allParticipants.length, 4);

  const screenSharer = allParticipants.find((p) =>
    p.isLocal ? isScreenSharing : p.isSharingScreen
  );
  const otherParticipants = screenSharer
    ? allParticipants.filter((p) => p.socketId !== screenSharer.socketId)
    : [];

  const renderParticipant = (p, className) => (
    <div key={p.socketId} className={className}>
      {p.isLocal ? (
        <>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              display: isVideoOff ? "none" : "block",
            }}
          />
          {isVideoOff && (
            <div className="participant-avatar">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </>
      ) : (
        remoteStreams[p.socketId]
          ? <RemoteVideo stream={remoteStreams[p.socketId]} />
          : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="participant-avatar">
                {p.userName?.slice(0, 2).toUpperCase()}
              </div>
            </div>
          )
      )}

      <div className="participant-name">
        {p.isLocal ? user.name : p.userName}
        {p.isMuted && <MicOff size={12} style={{ marginLeft: "4px" }} />}
        {p.isVideoOff && <VideoOff size={12} style={{ marginLeft: "4px" }} />}
      </div>

      {p.handRaised && (
        <div className="participant-badge" style={{ background: "#F59E0B" }}>
          <Hand size={12} /> Raised
        </div>
      )}
      {p.isSharingScreen && (
        <div className="participant-badge" style={{ background: "#10B981" }}>
          <Monitor size={12} /> Sharing
        </div>
      )}
    </div>
  );

  return (
    <div ref={containerRef} style={{
      display: "flex", flexDirection: "column", height: "100vh",
      backgroundColor: isDark ? "#0A0E17" : "#F0F2F5",
      fontFamily: "'DM Sans', sans-serif", color: t.textPrimary, position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .meeting-btn { transition: all 0.15s; }
        .meeting-btn:hover { transform: scale(1.05); }
        .meeting-btn:active { transform: scale(0.95); }
        .participant-grid { display: grid; gap: 12px; flex: 1; padding: 16px; align-content: center; justify-content: center; overflow: hidden; }
        .participant-item { position: relative; border-radius: 12px; overflow: hidden; background: ${isDark ? "#1E2535" : "#E5E7EB"}; aspect-ratio: 16 / 9; width: 100%; max-height: 100%; }
        .spotlight-wrap { flex: 1; display: flex; flex-direction: column; padding: 16px; gap: 12px; overflow: hidden; }
        .spotlight-main { position: relative; border-radius: 12px; overflow: hidden; background: ${isDark ? "#1E2535" : "#E5E7EB"}; flex: 1; width: 100%; min-height: 0; }
        .spotlight-strip { display: flex; gap: 10px; overflow-x: auto; flex-shrink: 0; padding-bottom: 2px; }
        .spotlight-thumb { position: relative; border-radius: 10px; overflow: hidden; background: ${isDark ? "#1E2535" : "#E5E7EB"}; width: 180px; height: 100px; flex-shrink: 0; }
        .spotlight-thumb .participant-avatar { font-size: 1.4rem; }
        .spotlight-thumb .participant-name { font-size: 0.65rem; padding: 2px 8px; bottom: 6px; left: 6px; }
        .spotlight-thumb .participant-badge { font-size: 0.55rem; padding: 2px 6px; top: 6px; right: 6px; }
        .participant-name { position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.7); color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; backdrop-filter: blur(4px); }
        .participant-badge { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.7); color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 0.65rem; backdrop-filter: blur(4px); display: flex; align-items: center; gap: 4px; }
        .participant-avatar { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 3rem; font-weight: 600; color: rgba(255,255,255,0.5); }
        .chat-container { background: ${t.card}; border-radius: 12px; border: 1px solid ${t.border}; width: 340px; display: flex; flex-direction: column; position: absolute; right: 16px; bottom: 80px; height: 400px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .chat-messages { flex: 1; overflow-y: auto; padding: 12px; }
        .chat-message { margin-bottom: 8px; padding: 8px 12px; border-radius: 8px; max-width: 85%; word-wrap: break-word; }
        .chat-message.own { background: #4F46E5; color: #fff; margin-left: auto; }
        .chat-message.other { background: ${isDark ? "#1E2535" : "#F3F4F6"}; color: ${t.textPrimary}; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .fade-in { animation: fadeIn 0.2s ease; }
        @media (max-width: 768px) {
          .participant-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; padding: 8px !important; }
          .participant-item { aspect-ratio: 4 / 3 !important; }
          .spotlight-wrap { padding: 8px !important; gap: 8px !important; }
          .spotlight-thumb { width: 110px !important; height: 70px !important; }
          .meeting-controls { padding: 12px !important; gap: 8px !important; }
          .meeting-controls button { width: 40px !important; height: 40px !important; }
          .chat-container { width: 100% !important; height: 50vh !important; right: 0 !important; bottom: 0 !important; border-radius: 12px 12px 0 0 !important; }
        }
      `}</style>

      <div style={{
        padding: "10px 20px", backgroundColor: t.card,
        borderBottom: `1px solid ${t.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Video size={18} color="#4F46E5" />
          <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>
            {meetingInfo?.title || "Meeting"}
          </span>
          <span style={{
            fontSize: "0.65rem", padding: "2px 10px", borderRadius: "12px",
            background: isConnected ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
            color: isConnected ? "#34D399" : "#F87171",
          }}>
            {isConnected ? "Connected" : "Connecting..."}
          </span>
          <span style={{
            fontSize: "0.65rem", padding: "2px 8px", borderRadius: "12px",
            background: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
            color: "#4F46E5", fontFamily: "monospace",
          }}>
            {meetingCode}
          </span>
          {isCreator && (
            <span style={{
              fontSize: "0.6rem", padding: "2px 8px", borderRadius: "10px",
              background: "#10B981", color: "#fff",
            }}>Host</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button onClick={copyMeetingLink} className="meeting-btn" style={{
            padding: "6px 12px", borderRadius: "8px", border: `1px solid ${t.border}`,
            background: "transparent", color: t.textSecondary, cursor: "pointer",
            fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {copySuccess ? <Check size={14} /> : <Copy size={14} />}
            {copySuccess ? "Copied!" : "Copy Link"}
          </button>
          <button onClick={toggleFullscreen} className="meeting-btn" style={{
            padding: "6px 10px", borderRadius: "8px", border: "none",
            background: "transparent", color: t.textSecondary, cursor: "pointer",
          }}>
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={leaveMeeting} className="meeting-btn" style={{
            padding: "6px 16px", borderRadius: "8px", border: "none",
            background: "#EF4444", color: "#fff", cursor: "pointer",
            fontWeight: "500", fontSize: "0.85rem", fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <Phone size={16} style={{ transform: "rotate(135deg)" }} /> Leave
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {screenSharer ? (
            <div className="spotlight-wrap">
              {renderParticipant(screenSharer, "spotlight-main")}
              {otherParticipants.length > 0 && (
                <div className="spotlight-strip">
                  {otherParticipants.map((p) => renderParticipant(p, "spotlight-thumb"))}
                </div>
              )}
            </div>
          ) : (
            <div className="participant-grid" style={{
              gridTemplateColumns: `repeat(${Math.min(gridCols, 4)}, 1fr)`,
            }}>
              {allParticipants.map((p) => renderParticipant(p, "participant-item"))}
            </div>
          )}

          <div className="meeting-controls" style={{
            padding: "16px 20px", backgroundColor: t.card,
            borderTop: `1px solid ${t.border}`,
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: "12px", flexShrink: 0,
          }}>
            <button onClick={toggleMute} className="meeting-btn" style={{
              borderRadius: "50%", border: "none",
              background: isMuted ? "#EF4444" : "#4F46E5", color: "#fff",
              cursor: "pointer", width: "48px", height: "48px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button onClick={toggleVideo} className="meeting-btn" style={{
              borderRadius: "50%", border: "none",
              background: isVideoOff ? "#EF4444" : "#4F46E5", color: "#fff",
              cursor: "pointer", width: "48px", height: "48px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            <button onClick={toggleScreenShare} className="meeting-btn" style={{
              borderRadius: "50%",
              border: isScreenSharing ? "2px solid #10B981" : `1px solid ${t.border}`,
              background: isScreenSharing ? "rgba(16,185,129,0.15)" : "transparent",
              color: isScreenSharing ? "#10B981" : t.textSecondary,
              cursor: "pointer", width: "48px", height: "48px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isScreenSharing ? <Monitor size={20} /> : <ScreenShare size={20} />}
            </button>

            <button onClick={toggleHandRaise} className="meeting-btn" style={{
              borderRadius: "50%",
              border: handRaised ? "2px solid #F59E0B" : `1px solid ${t.border}`,
              background: handRaised ? "rgba(245,158,11,0.15)" : "transparent",
              color: handRaised ? "#F59E0B" : t.textSecondary,
              cursor: "pointer", width: "48px", height: "48px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Hand size={20} />
            </button>

            <button onClick={() => setShowChat(!showChat)} className="meeting-btn" style={{
              borderRadius: "50%",
              border: showChat ? "2px solid #4F46E5" : `1px solid ${t.border}`,
              background: showChat ? "rgba(79,70,229,0.15)" : "transparent",
              color: showChat ? "#4F46E5" : t.textSecondary,
              cursor: "pointer", width: "48px", height: "48px",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <MessageCircle size={20} />
              {messages.length > 0 && (
                <span style={{
                  position: "absolute", top: "-2px", right: "-2px",
                  width: "18px", height: "18px", borderRadius: "50%",
                  background: "#EF4444", color: "#fff",
                  fontSize: "9px", fontWeight: "700",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {messages.length}
                </span>
              )}
            </button>

            <button onClick={() => setShowParticipants(!showParticipants)} className="meeting-btn" style={{
              borderRadius: "50%",
              border: showParticipants ? "2px solid #4F46E5" : `1px solid ${t.border}`,
              background: showParticipants ? "rgba(79,70,229,0.15)" : "transparent",
              color: showParticipants ? "#4F46E5" : t.textSecondary,
              cursor: "pointer", width: "48px", height: "48px",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <Users size={20} />
              <span style={{
                position: "absolute", top: "-2px", right: "-2px",
                width: "18px", height: "18px", borderRadius: "50%",
                background: "#4F46E5", color: "#fff",
                fontSize: "9px", fontWeight: "700",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {participants.length + 1}
              </span>
            </button>
          </div>
        </div>

        {showChat && (
          <div className="chat-container fade-in">
            <div style={{
              padding: "12px 16px", borderBottom: `1px solid ${t.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
            }}>
              <span style={{ fontWeight: "600", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageCircle size={16} /> Chat
              </span>
              <button onClick={() => setShowChat(false)} className="meeting-btn" style={{
                padding: "4px", borderRadius: "6px", border: "none",
                background: "transparent", color: t.textMuted, cursor: "pointer",
              }}>
                <X size={16} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.isOwn ? "own" : "other"}`}>
                  <div style={{ fontSize: "0.65rem", fontWeight: "600", opacity: 0.7, marginBottom: "2px" }}>
                    {msg.userName}
                  </div>
                  <div style={{ fontSize: "0.85rem" }}>{msg.message}</div>
                  <div style={{ fontSize: "0.55rem", opacity: 0.5, marginTop: "2px" }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{
              padding: "12px", borderTop: `1px solid ${t.border}`,
              display: "flex", gap: "8px", flexShrink: 0,
            }}>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: "8px",
                  border: `1px solid ${t.border}`, background: t.bg,
                  color: t.textPrimary, fontSize: "0.85rem", outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <button type="submit" className="meeting-btn" style={{
                padding: "8px 16px", borderRadius: "8px", border: "none",
                background: "#4F46E5", color: "#fff", cursor: "pointer",
                fontWeight: "500", fontFamily: "'DM Sans', sans-serif",
              }}>
                Send
              </button>
            </form>
          </div>
        )}

        {showParticipants && (
          <div className="chat-container fade-in" style={{ width: "280px" }}>
            <div style={{
              padding: "12px 16px", borderBottom: `1px solid ${t.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
            }}>
              <span style={{ fontWeight: "600", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={16} /> Participants ({participants.length + 1})
              </span>
              <button onClick={() => setShowParticipants(false)} className="meeting-btn" style={{
                padding: "4px", borderRadius: "6px", border: "none",
                background: "transparent", color: t.textMuted, cursor: "pointer",
              }}>
                <X size={16} />
              </button>
            </div>

            <div className="chat-messages">
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "6px 8px", borderRadius: "8px",
                background: isDark ? "rgba(79,70,229,0.1)" : "#EEF2FF", marginBottom: "4px",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "#4F46E5", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#fff", fontSize: "0.7rem",
                  fontWeight: "600", flexShrink: 0,
                }}>
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontWeight: "500", fontSize: "0.85rem" }}>{user.name} (You)</span>
                {isCreator && (
                  <span style={{
                    fontSize: "0.6rem", padding: "1px 6px", borderRadius: "10px",
                    background: "#10B981", color: "#fff", marginLeft: "auto",
                  }}>Host</span>
                )}
              </div>

              {participants.map((p, idx) => (
                <div key={idx} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "6px 8px", borderRadius: "8px",
                }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: `hsl(${(p.userName?.charCodeAt(0) || 65) * 5 % 360}, 55%, ${isDark ? "45%" : "55%"})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "0.7rem", fontWeight: "600", flexShrink: 0,
                  }}>
                    {p.userName?.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: "0.85rem" }}>{p.userName}</span>
                  {p.isMuted && <MicOff size={12} style={{ color: t.textMuted }} />}
                  {p.isVideoOff && <VideoOff size={12} style={{ color: t.textMuted }} />}
                  {p.handRaised && <Hand size={12} style={{ color: "#F59E0B" }} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingRoom;