using LegacyOps.Enum;

namespace LegacyOps.DTOs
{
    public class BlueStakeResponse
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public string? TicketNumber { get; set; }
        public DateTimeOffset RequestDate { get; set; }
        public DateTimeOffset LegalDigDate { get; set; }
        public DateTimeOffset ExpiryDate { get; set; }
        public BlueStakeStatus Status { get; set; }
        public string? Notes { get; set; }
        public int CalledInBy { get; set; }
    }

    public class  CreateBlueStakeRequest
    {
        public int JobId { get; set; }
        public string? TicketNumber { get; set;}
        public DateTimeOffset RequestDate { get; set; }
        public DateTimeOffset LegalDigDate { get; set; }
        public DateTimeOffset ExpiryDate { get; set; }
        public string? Notes { get; set; }
        public int CalledInBy { get; set; }
    }
}
