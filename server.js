const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const QRCode = require("qrcode");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

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

server.listen(3000, () => {
  console.log("🚀 Serveur actif sur http://127.0.0.1:3000");
});
