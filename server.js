import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import chatHandler from "./api/chat.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, "dist")));

// API endpoint for chatbot
app.use("/api", chatHandler);

// Serve the index.html file for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
