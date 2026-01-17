const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const QRCode = require("qrcode");
const path = require("path");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// 🎥 LIVEKIT CONFIGURATION
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'ws://localhost:7880';

// 🔥 SERVIR LE DOSSIER PUBLIC
app.use(express.static(path.join(__dirname, "public")));

// 🔥 ROUTE RACINE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ===== VISITEUR ===== */
app.post("/visit", (req, res) => {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress;

  console.log("👀 VISITEUR :", ip);

  io.emit("visitor-log", {
    ip,
    userAgent: req.headers["user-agent"],
    timestamp: new Date().toISOString()
  });

  res.sendStatus(200);
});

/* ===== JOUEUR ===== */
app.post("/collect", (req, res) => {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress;

  console.log("🎮 JOUEUR :", ip);

  io.emit("player-registered", {
    ip,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    accuracy: req.body.accuracy,
    timestamp: new Date().toISOString(),
    userAgent: req.headers["user-agent"]
  });

  res.sendStatus(200);
});

/* ===== QR ===== */
app.get("/qr", async (req, res) => {
  const qr = await QRCode.toDataURL(req.query.url);
  res.send(`<img src="${qr}" />`);
});

/* ===== LIVEKIT TOKEN GENERATION ===== */
app.post("/api/token", (req, res) => {
  const { roomName, userName } = req.body;

  if (!roomName || !userName) {
    return res.status(400).json({ error: "Room name and user name are required" });
  }

  // Create access token
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: userName,
    ttl: '10h', // Token valid for 10 hours
  });

  // Grant permissions
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = at.toJwt();

  console.log(`🎥 TOKEN GENERATED for ${userName} in room ${roomName}`);

  res.json({
    token,
    url: LIVEKIT_URL,
    roomName,
    userName
  });
});

/* ===== LIVEKIT ROOM INFO ===== */
app.get("/api/rooms", (req, res) => {
  // This would require LiveKit server API integration
  // For now, return a placeholder
  res.json({
    message: "Room listing requires LiveKit server connection",
    livekitUrl: LIVEKIT_URL
  });
});

server.listen(3000, () => {
  console.log("🚀 Serveur actif sur http://127.0.0.1:3000");
  console.log("🎥 LiveKit enabled - Configure with env vars:");
  console.log("   LIVEKIT_API_KEY:", LIVEKIT_API_KEY);
  console.log("   LIVEKIT_URL:", LIVEKIT_URL);
});
