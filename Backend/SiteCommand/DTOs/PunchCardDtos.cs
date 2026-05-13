namespace LegacyOps.DTOs
{
    public class PunchCardResponse
    {
        public int Id { get; set; }
        public int EmpId { get; set; }
        public int JobId { get; set; }
        public DateTime PunchIn { get; set; }
        public DateTime? PunchOut { get; set; }
        public decimal TotalHours { get; set; }
    }

    public class CreatePunchCardRequest
    {
        public int EmpId { get; set; }
        public int JobId { get; set; }
    }
}
