"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_client_1 = require("socket.io-client");
var crypto_1 = require("crypto");
/**
 * Generate a random session ID (for demo/testing)
 */
var sessionId = (0, crypto_1.randomBytes)(8).toString("hex");
console.log("🆔 Generated Session ID:", sessionId);
/**
 * ✅ Fake Passport-style session object
 * Matches: req.session.passport = { user: '103186626245417430431' }
 */
var fakePassport = {
    user: "103186626245417430431",
};
/**
 * Connect to the Socket.IO server
 */
var socket = (0, socket_io_client_1.io)("http://127.0.0.1:3000", {
    transports: ["websocket"],
    withCredentials: true, // ✅ needed if you use real express-session
    query: {
        sessionId: sessionId,
        passport: JSON.stringify({ passport: fakePassport }),
    },
});
socket.on("connect", function () {
    console.log("✅ Connected to server:", socket.id);
    // Optionally emit passport session manually too
    socket.emit("passport-session", { passport: fakePassport });
    // Example: send test input
    socket.emit("input", "hello google gemini", "gemini");
    // Listen for live responses
    socket.on("live-data", function (data) {
        console.log("📡 Live data:", data);
    });
});
socket.on("connect_error", function (err) {
    console.error("❌ Connection failed:", err.message);
});
socket.on("disconnect", function () {
    console.log("🔌 Disconnected from server");
});
