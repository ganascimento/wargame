using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using System.Linq;
using System;
using GADev.WarGame.Api.Models;

namespace GADev.WarGame.Api.Hubs
{
    public class GameHub : Hub
    {
        static Dictionary<string, Room> Rooms = new Dictionary<string, Room>();

        public async override Task OnConnectedAsync() {
            await Clients.Client(Context.ConnectionId).SendAsync("Start", Context.ConnectionId, Rooms);
        }

        public async override Task OnDisconnectedAsync(Exception exception) {
            try {
                var roomIds = Rooms.Keys;

                foreach (var roomId in roomIds) {
                    var playerId = Rooms[roomId].Players.Keys.FirstOrDefault(id => Rooms[roomId].Players[id].ConnectionId == Context.ConnectionId);

                    if (!string.IsNullOrWhiteSpace(playerId)) {
                        var room = Rooms[roomId];
                        room.Players.Remove(playerId);

                        if (room.Owner == playerId && room.Players.Count > 0) {
                            room.Owner = room.Players.First().Key;
                        }

                        Rooms[roomId] = room;
                        await Clients.All.SendAsync("UpdateRoom", roomId, room);

                        break;
                    }
                }
            }
            catch {}
        }

        public async Task AddRoom(string nameRoom) {
            var room = new Room {
                Name = nameRoom,
                Players = new Dictionary<string, Player>()
            };

            var roomId = Guid.NewGuid().ToString();
            var newRoom = new Dictionary<string, Room>();

            newRoom[roomId] = room;

            await Clients.All.SendAsync("AddRoom", newRoom);

            Rooms[roomId] = room;
        }

        public async Task RegisterPlayerInRoom(string playerId, string connectionId, string name, string roomId) {
            var room = Rooms[roomId];

            if (room.Players.ContainsKey(playerId)) return;

            var player = new Player {
                ConnectionId = connectionId,
                Name = name,
                Shot = new Shot(),
                Life = 100
            };

            if (room.Players.Keys.Count == 0) {
                room.Owner = playerId;
            }

            room.Players[playerId] = player;

            Rooms[roomId] = room;

            await Clients.All.SendAsync("UpdateRoom", roomId, room);
        }

        public async Task RemovePlayerRoom(string playerId, string roomId) {
            var room = Rooms[roomId];
            room.Players.Remove(playerId);

            if (room.Owner == playerId && room.Players.Keys.Count > 0) {
                room.Owner = room.Players.Select(x => x.Key).First();
            }
            else if (room.Players.Keys.Count == 0) {
                room.Owner = null;
            }

            Rooms[roomId] = room;

            await Clients.All.SendAsync("UpdateRoom", roomId, room);
        }

        public async Task PlayGame(string roomId) {
            var room = Rooms[roomId];            
            int count = 0;

            foreach (var key in room.Players.Keys) {
                switch (count) {
                    case 0:
                        room.Players[key].X = 0;
                        room.Players[key].Y = 0;
                        room.Players[key].Move = "Down";
                        break;
                    case 1:
                        room.Players[key].X = 47;
                        room.Players[key].Y = 0;
                        room.Players[key].Move = "Down";
                        break;
                    case 2:
                        room.Players[key].X = 0;
                        room.Players[key].Y = 47;
                        room.Players[key].Move = "Up";
                        break;
                    case 3:
                        room.Players[key].X = 47;
                        room.Players[key].Y = 46;
                        room.Players[key].Move = "Up";
                        break;
                }

                room.Players[key].Shot = ConfigShoot(room.Players[key]);

                count++;
            }

            foreach (var player in room.Players.Keys) {
                await Groups.AddToGroupAsync(room.Players[player].ConnectionId, roomId);
            }

            await Clients.Group(roomId).SendAsync("PlayGame", room);
        }

        public async Task MovePlayer(string roomId, string playerId, string move) {
            try {
                var player = Rooms[roomId].Players[playerId];

                switch (move) {
                    case "ArrowUp":
                        if (player.Y <= 0) return;
                        player.Y -= 1;
                        player.Move = "Up";
                        break;
                    case "ArrowDown":
                        if (player.Y >= 47) return;
                        player.Y += 1;
                        player.Move = "Down";
                        break;
                    case "ArrowLeft":
                        if (player.X <= 0) return;
                        player.X -= 1;
                        player.Move = "Left";
                        break;
                    case "ArrowRight":
                        if (player.X >= 47) return;
                        player.X += 1;
                        player.Move = "Right";
                        break;
                    case "f":
                        if (!player.Shot.Enable) return;
                        player.Shot = ConfigShoot(player);
                        player.Shot.Enable = false;
                        player.Shot.LastMove = player.Move;
                        break;
                }

                player.Shot = ConfigShoot(player);

                Rooms[roomId].Players[playerId] = player;

                await Clients.Group(roomId).SendAsync("RegisterMove", playerId, player);
            }
            catch {}
        }

        public async Task Shoot(string roomId, string playerId) {
            try {
                var player = Rooms[roomId].Players[playerId];
                string playerIdStruck = null;

                switch (player.Shot.LastMove) {
                    case "Up":
                        player.Shot.Y -= 1;
                        break;
                    case "Down":
                        player.Shot.Y += 1;
                        break;
                    case "Left":
                        player.Shot.X -= 1;
                        break;
                    case "Right":
                        player.Shot.X += 1;
                        break;
                }

                foreach (var key in Rooms[roomId].Players.Keys) {
                    if (playerId == key) continue;
                    var playerCompare = Rooms[roomId].Players[key];

                    bool direction = playerCompare.Move == "Up" || playerCompare.Move == "Down" ? true : false;

                    if (player.Shot.X >= playerCompare.X && player.Shot.X <= (playerCompare.X + (direction ? 2 : 3)) && player.Shot.Y >= playerCompare.Y && player.Shot.Y <= (playerCompare.Y + (direction ? 3 : 2))) {
                        player.Shot.Enable = true;
                        player.Shot = ConfigShoot(player);
                        playerIdStruck = key;
                        break;
                    }
                }

                if (player.Shot.X >= 50 || player.Shot.Y >= 50 || player.Shot.X < 0 || player.Shot.Y < 0) {
                    player.Shot.Enable = true;
                    player.Shot = ConfigShoot(player);
                }

                Rooms[roomId].Players[playerId] = player;

                await Clients.Group(roomId).SendAsync("RegisterMove", playerId, player);

                if (playerIdStruck != null) {
                    var playerStruck = Rooms[roomId].Players[playerIdStruck];
                    playerStruck.Life -= 35;
                    if (playerStruck.Life <= 0) {
                        Rooms[roomId].Players.Remove(playerIdStruck);

                        await Clients.Group(roomId).SendAsync("PlayerDead", playerIdStruck);
                        await Clients.Group(roomId).SendAsync("UpdateRoom", roomId, Rooms[roomId]);
                    }
                    else {
                        Rooms[roomId].Players[playerIdStruck] = playerStruck;

                        await Clients.Group(roomId).SendAsync("PlayerStruck", playerIdStruck);
                        await Clients.Group(roomId).SendAsync("UpdateRoom", roomId, Rooms[roomId]);
                    }
                }
            }
            catch {}
        }

        private Shot ConfigShoot(Player player) {
            try {
                if (!player.Shot.Enable) return player.Shot;

                switch (player.Move) {
                    case "Up":
                        player.Shot.X = player.X + 1;
                        player.Shot.Y = player.Y;
                        break;
                    case "Down":
                        player.Shot.X = player.X + 1;
                        player.Shot.Y = player.Y + 3;
                        break;
                    case "Left":
                        player.Shot.X = player.X;
                        player.Shot.Y = player.Y + 1;
                        break;
                    case "Right":
                        player.Shot.X = player.X + 3;
                        player.Shot.Y = player.Y + 1;
                        break;
                }

                return player.Shot;
            }
            catch {
                return null;
            }            
        }
    }
} 