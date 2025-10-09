import express from "express";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

//Security middleware
app.use(helmet());
app.use(cors({ origin: "https://localhost:3000" })); 
app.use(express.json());

//HTTPS redirection middleware
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV !== "development") {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

//Example route
app.get("/api/health", (req, res) => {
  res.json({ status: "secure", message: "HTTPS server running" });
});

//Load SSL certificates
const sslKey = fs.readFileSync(path.join("./certs/key.pem"));
const sslCert = fs.readFileSync(path.join("./certs/cert.pem"));
const credentials = { key: sslKey, cert: sslCert };

//HTTPS Server
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
https.createServer(credentials, app).listen(HTTPS_PORT, () => {
  console.log('HTTPS Server running on https://localhost:${HTTPS_PORT}');
});

//Optional HTTP Server (for redirecting traffic)
const HTTP_PORT = process.env.HTTP_PORT || 3080;
http
  .createServer((req, res) => {
    const host = req.headers["host"];
    res.writeHead(301, { Location: `https://${host}${req.url}` });
    res.end();
  })
  .listen(HTTP_PORT, () => {
    console.log('HTTP redirect server running on http://localhost:${HTTP_PORT}');
  });
