import { getRandomVillagers } from "../lib/villagers";

const rooms = new Map();
const socketToRoom = new Map();
const ROOM_TTL_MS = 1000 * 60 * 60;

const randomCode = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase();

const cleanExpiredRooms = () => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.createdAt > ROOM_TTL_MS) {
      rooms.delete(code);
    }
  }
};

const createRoom = (player, count = 24) => {
  cleanExpiredRooms();
  let code = randomCode();
  while (rooms.has(code)) code = randomCode();

  const room = {
    code,
    createdAt: Date.now(),
    villagers: getRandomVillagers(count),
    players: {
      [player.socketId]: {
        socketId: player.socketId,
        name: player.name,
        secretId: null,
        eliminated: [],
      },
    },
  };

  rooms.set(code, room);
  socketToRoom.set(player.socketId, code);
  return room;
};

const joinRoom = (code, player) => {
  cleanExpiredRooms();
  const room = rooms.get(code);
  if (!room) return { error: "Room not found." };
  const playerIds = Object.keys(room.players);
  if (playerIds.length >= 2) return { error: "Room is full." };

  room.players[player.socketId] = {
    socketId: player.socketId,
    name: player.name,
    secretId: null,
    eliminated: [],
  };
  socketToRoom.set(player.socketId, code);
  return { room };
};

const getOpponentId = (room, socketId) =>
  Object.keys(room.players).find((id) => id !== socketId);

const setSecret = (room, socketId, secretId) => {
  if (!room.players[socketId]) return;
  room.players[socketId].secretId = secretId;
};

const toggleEliminated = (room, socketId, villagerId) => {
  const player = room.players[socketId];
  if (!player) return;
  const set = new Set(player.eliminated);
  if (set.has(villagerId)) set.delete(villagerId);
  else set.add(villagerId);
  player.eliminated = Array.from(set);
};

const getRoomStateFor = (room, socketId) => {
  const opponentId = getOpponentId(room, socketId);
  const self = room.players[socketId];
  const opponent = opponentId ? room.players[opponentId] : null;

  return {
    code: room.code,
    villagers: room.villagers,
    players: {
      self: self
        ? {
            name: self.name,
            secretId: self.secretId,
            eliminated: self.eliminated,
          }
        : null,
      opponent: opponent
        ? {
            name: opponent.name,
            hasSecret: Boolean(opponent.secretId),
          }
        : null,
    },
  };
};

const removePlayer = (room, socketId) => {
  if (!room) return;
  delete room.players[socketId];
  socketToRoom.delete(socketId);
  if (Object.keys(room.players).length === 0) {
    rooms.delete(room.code);
  }
};

const getRoom = (code) => rooms.get(code);
const getRoomCodeForSocket = (socketId) => socketToRoom.get(socketId);

export {
  createRoom,
  joinRoom,
  setSecret,
  toggleEliminated,
  getRoomStateFor,
  removePlayer,
  getRoom,
  getRoomCodeForSocket,
};
