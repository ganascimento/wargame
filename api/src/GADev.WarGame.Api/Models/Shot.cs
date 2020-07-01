namespace GADev.WarGame.Api.Models
{
    public class Shot
    {
        public bool Enable { get; set; } = true;
        public int? X { get; set; }
        public int? Y { get; set; }
        public string LastMove { get; set; }
    }
}