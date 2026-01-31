"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [roomState, setRoomState] = useState(null);
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [secretPick, setSecretPick] = useState("");
  const [villagerCount, setVillagerCount] = useState(24);

  const socket = useMemo(() => {
    if (typeof window === "undefined") return null;
    return io({ path: "/api/socket" });
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    fetch("/api/socket");
    socket.on("roomState", (state) => setRoomState(state));
    return () => socket.disconnect();
  }, [socket]);

  const hasSecret = Boolean(roomState?.players?.self?.secretId);

  const handleCreate = () => {
    if (!socket) return;
    setStatus("");
    socket.emit(
      "createRoom",
      { name, count: Number(villagerCount) || 24 },
      (response) => {
        if (!response?.ok) {
          setStatus(response?.error || "Failed to create room.");
          return;
        }
        setRoomCode(response.code);
      }
    );
  };

  const handleJoin = () => {
    if (!socket) return;
    setStatus("");
    socket.emit("joinRoom", { code: roomCode, name }, (response) => {
      if (!response?.ok) {
        setStatus(response?.error || "Failed to join room.");
      }
    });
  };

  const handleSecret = () => {
    if (!socket || !roomState?.code || !secretPick) return;
    socket.emit("setSecret", { code: roomState.code, villagerId: secretPick });
  };

  const handleEliminate = (villagerId) => {
    if (!socket || !roomState?.code) return;
    socket.emit("toggleEliminated", { code: roomState.code, villagerId });
  };

  const eliminatedSet = new Set(roomState?.players?.self?.eliminated || []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Animal Crossing Guess Who</h1>
          <p className="text-slate-300">
            Create or join a room, pick your secret villager, and use the grid to
            narrow down as you play over voice chat.
          </p>
        </header>

        {!roomState && (
          <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="grid gap-2">
              <label className="text-sm text-slate-400">Your name</label>
              <input
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Player name"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-400">
                Room code (join only)
              </label>
              <input
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 uppercase"
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value)}
                placeholder="ABCD"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-400">
                Villagers per game
              </label>
              <select
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                value={villagerCount}
                onChange={(event) => setVillagerCount(event.target.value)}
              >
                {[24, 30, 36].map((count) => (
                  <option key={count} value={count}>
                    {count} villagers
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
                onClick={handleCreate}
              >
                Create Room
              </button>
              <button
                className="rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-100 hover:border-slate-500"
                onClick={handleJoin}
              >
                Join Room
              </button>
            </div>
            {status && <p className="text-sm text-amber-300">{status}</p>}
          </section>
        )}

        {roomState && (
          <section className="grid gap-6">
            <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div>
                <p className="text-sm text-slate-400">Room</p>
                <p className="text-2xl font-semibold">{roomState.code}</p>
              </div>
              <div className="grid gap-2 text-sm text-slate-300">
                <p>
                  You:{" "}
                  <span className="font-semibold">
                    {roomState.players?.self?.name || "You"}
                  </span>
                </p>
                <p>
                  Opponent:{" "}
                  <span className="font-semibold">
                    {roomState.players?.opponent?.name || "Waiting..."}
                  </span>
                  {roomState.players?.opponent?.hasSecret
                    ? " (secret set)"
                    : " (secret not set)"}
                </p>
              </div>
              <div className="grid gap-3">
                <label className="text-sm text-slate-400">
                  Choose your secret villager
                </label>
                <div className="flex flex-wrap gap-3">
                  <select
                    className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                    value={secretPick}
                    onChange={(event) => setSecretPick(event.target.value)}
                    disabled={hasSecret}
                  >
                    <option value="">Select villager</option>
                    {roomState.villagers.map((villager) => (
                      <option key={villager.id} value={villager.id}>
                        {villager.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50"
                    onClick={handleSecret}
                    disabled={hasSecret || !secretPick}
                  >
                    {hasSecret ? "Secret locked" : "Lock Secret"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roomState.villagers.map((villager) => (
                <button
                  key={villager.id}
                  type="button"
                  onClick={() => handleEliminate(villager.id)}
                  className={`group grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left transition ${
                    eliminatedSet.has(villager.id)
                      ? "opacity-50 grayscale"
                      : "hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={villager.imageUrl}
                      alt={villager.name}
                      className="h-28 w-28 shrink-0 rounded-full border-2 border-slate-700 bg-slate-950 object-contain"
                    />
                    <div>
                      <p className="text-lg font-semibold">{villager.name}</p>
                      <p className="text-sm text-slate-400">
                        {villager.gender} • {villager.species}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                    <div>
                      <p className="text-xs uppercase text-slate-500">
                        Personality
                      </p>
                      <p>{villager.personality}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">Zodiac</p>
                      <p>{villager.zodiac}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">Hobby</p>
                      <p>{villager.hobby}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">Gender</p>
                      <p>{villager.gender}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
