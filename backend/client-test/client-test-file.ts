import { io, Socket } from "socket.io-client";
import { randomBytes } from "crypto";

/**
 * Generate a random session ID (for demo/testing)
 */
const sessionId = randomBytes(8).toString("hex");
console.log("🆔 Generated Session ID:", sessionId);

/**
 * ✅ Fake Passport-style session object
 * Matches: req.session.passport = { user: '103186626245417430431' }
 */
const fakePassport = {
  user: "103186626245417430431",
};

/**
 * Connect to the Socket.IO server
 */
const socket: Socket = io("http://127.0.0.1:3000", {
  transports: ["websocket"],
  withCredentials: true, // ✅ needed if you use real express-session
  query: {
    sessionId,
    passport: JSON.stringify({ passport: fakePassport }),
  },
});

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);

  // Optionally emit passport session manually too
  socket.emit("passport-session", { passport: fakePassport });

  // Example: send test input
  socket.emit("input", "hello google gemini", "gemini");

  // Listen for live responses
  socket.on("live-data", (data: any) => {
    console.log("📡 Live data:", data);
  });
});

socket.on("connect_error", (err: Error) => {
  console.error("❌ Connection failed:", err.message);
});

socket.on("disconnect", () => {
  console.log("🔌 Disconnected from server");
});
