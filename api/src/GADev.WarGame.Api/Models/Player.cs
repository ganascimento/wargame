namespace GADev.WarGame.Api.Models
{
    public class Player
    {
        public string Name { get; set; }
        public int? X { get; set; }
        public int? Y { get; set; }
        public string Move { get; set; }
        public string ConnectionId { get; set; }
        public int Life { get; set; }
        public Shot Shot { get; set; }
    }
}