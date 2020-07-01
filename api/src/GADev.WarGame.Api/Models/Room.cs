using System.Collections.Generic;

namespace GADev.WarGame.Api.Models
{
    public class Room
    {
        public string Name { get; set; }
        public string Owner { get; set; }
        public Dictionary<string, Player> Players { get; set; }
    }
}