const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

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

  socket.on("callUser", ({ offer, from }) => {
    console.log(`Call from ${from} with offer,${offer}`);
    socket.broadcast.emit("incomingCall", { from, offer });
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

server.listen(5000, () => console.log("server is running on port 5000"));
