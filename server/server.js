const { instrument } = require("@socket.io/admin-ui");

const io = require("socket.io")(3000, {
  cors: {
    origin: ["http://localhost:8080", "https://admin.socket.io"],
  },
});

const userIo = io.of("/user");
userIo.on("connection", (socket) => {
  console.log("connected to user namespace with username", socket.username);
});

userIo.use((socket, next) => {
  if (socket.handshake.auth.token) {
    socket.username = getUsernameFromToken(socket.handshake.auth.token);
    next();
  } else {
    next(new Error("Please send token"));
  }
});

function getUsernameFromToken(token) {
  return token;
}

io.on("connection", (socket) => {
  console.log(socket.id);
  //   socket.on("custom-event", (number, string, obj) => {
  //     console.log(number, string, obj);
  //   });
  socket.on("send-message", (message, room) => {
    // io.emit("recieve-message", message); // Broadcast to all clients and also the sender

    if (room === "") {
      socket.broadcast.emit("recieve-message", message); // Broadcast to all clients except the sender
    } else {
      socket.to(room).emit("recieve-message", message); // send to a specific room
    }
    console.log(message);
  });
  socket.on("join-room", (room, cb) => {
    socket.join(room);
    cb(`Joined room ${room}`);
  });
  socket.on("ping", (n) => console.log(n));
});

instrument(io, { auth: false });
