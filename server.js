const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const io = require("socket.io")(server, {
  cors: {
    origin: [process.env.HOST, "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});
app.use(
  cors({
    origin: [process.env.HOST, "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const users = new Map();

io.on("connection", (socket) => {
  console.log("users", users);
  socket.on("register-user", (username) => {
    console.log("User connected:", socket.id);
    users.set(socket.id, username);
    io.emit(
      "users-list",
      Array.from(users, ([socketId, username]) => ({ socketId, username }))
    );
  });

  socket.on("callUser", ({ offer, from,to }) => {
    console.log(`Call from ${from} with offer,${offer}`);
    io.to(to).emit("incomingCall", { from, offer });
  });

  // Handle call acceptance
  socket.on("acceptCall", ({ answer, to }) => {
    console.log(`Call accepted by ${to}`);
    io.to(to).emit("callAccepted", { answer });
  });

  // Handle ICE candidates
  socket.on("iceCandidate", ({ candidate }) => {
    socket.broadcast.emit("iceCandidate", { candidate });
  });

  socket.on("endCall", ({ to }) => {
    console.log(`Call ended by ${socket.id}`);
    io.to(to).emit("callEnded"); 
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    users.delete(socket.id);
    io.emit(
      "users-list",
      Array.from(users, ([socketId, username]) => ({ socketId, username }))
    );
  });
});

server.listen(5000,"192.168.0.105", () => console.log("server is running on port 5000"));
