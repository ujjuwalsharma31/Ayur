require("dotenv").config();

// fix dns issues for mongodb atlas
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const remedyRoutes = require("./routes/remedyRoutes");

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients and local development, plus configured deployments.
      if (!origin || process.env.NODE_ENV !== "production" || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
  }),
);
app.use(express.json());

// connect to mongo
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("missing mongodb uri in env");
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

console.log("connecting to mongodb...");

mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 45000,
    socketTimeoutMS: 60000,
  })
  .then(() => console.log("connected to mongodb"))
  .catch((err) => {
    console.error("failed to connect to mongo:", err.message);
  });

mongoose.connection.on("disconnected", () =>
  console.log("mongodb disconnected"),
);
mongoose.connection.on("reconnected", () =>
  console.log("mongodb reconnected"),
);

// simple health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "api is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// check app version
app.get("/api/version", (req, res) => {
  res.json({
    latestVersion: "1.2.0",
    minVersion: "1.0.0",
    releaseNotes: [
      "🌿 Know Your Bio-Energy: New Prakriti (Dosha) Analysis feature!",
      "✨ Brand new Apple-inspired UI",
      "🤖 Faster AI-powered search",
      "🧘 Improved yoga detail screens",
      "🐛 Bug fixes and performance improvements",
    ],
    updateUrl: "https://expo.dev/@ayushthakur4/ayursaathi-app",
    mandatory: false,
  });
});

app.use("/api/remedies", remedyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`server started on port ${PORT}`),
);
