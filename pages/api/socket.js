import { Server } from "socket.io";
import {
  createRoom,
  joinRoom,
  setSecret,
  toggleEliminated,
  getRoomStateFor,
  removePlayer,
  getRoom,
  getRoomCodeForSocket,
} from "../../server/gameState";

const emitRoomState = (io, room) => {
  if (!room) return;
  Object.keys(room.players).forEach((socketId) => {
    io.to(socketId).emit("roomState", getRoomStateFor(room, socketId));
  });
};

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("createRoom", ({ name, count }, ack) => {
        const room = createRoom(
          { socketId: socket.id, name: name?.trim() || "Player 1" },
          count
        );
        socket.join(room.code);
        emitRoomState(io, room);
        ack?.({ ok: true, code: room.code });
      });

      socket.on("joinRoom", ({ code, name }, ack) => {
        const roomCode = code?.trim().toUpperCase();
        const { room, error } = joinRoom(roomCode, {
          socketId: socket.id,
          name: name?.trim() || "Player 2",
        });
        if (error) {
          ack?.({ ok: false, error });
          return;
        }
        socket.join(room.code);
        emitRoomState(io, room);
        ack?.({ ok: true, code: room.code });
      });

      socket.on("setSecret", ({ code, villagerId }) => {
        const room = getRoom(code);
        if (!room) return;
        setSecret(room, socket.id, villagerId);
        emitRoomState(io, room);
      });

      socket.on("toggleEliminated", ({ code, villagerId }) => {
        const room = getRoom(code);
        if (!room) return;
        toggleEliminated(room, socket.id, villagerId);
        emitRoomState(io, room);
      });

      socket.on("disconnect", () => {
        const code = getRoomCodeForSocket(socket.id);
        if (!code) return;
        const room = getRoom(code);
        if (!room) return;
        removePlayer(room, socket.id);
        emitRoomState(io, room);
      });
    });
  }
  res.end();
}
