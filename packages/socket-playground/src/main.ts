import { io } from "socket.io-client";

localStorage.debug = "socket.io-client:*";

// const socket = io("http://localhost:8083", {
const socket = io("http://localhost:81", {
  path: "/ws",
  transports: ["websocket"], // опционально, чтобы сразу websocket
});

socket.on("connect", () => {
  console.log("connected", socket.id);
});

socket.on("disconnect", (a) => {
  console.log(">>> a", a);
});

socket.on("connect_error", (e) => console.error(e));

socket.on("board_event", (p) => {
  console.log(">>> p", p);
});

setTimeout(() => {
  // console.log(">>> socket", socket);
  socket.emit("board.join", { boardId: "06988f46-8b3c-4575-bc2a-d1b82a9e9366" }, (r) => {
    // socket.emit("events", {}, (r) => {
    console.log(">>>     r", r);
  });
}, 2000);
