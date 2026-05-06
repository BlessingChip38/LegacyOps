namespace LegacyOps.DTOs
{
    public class ChangePasswordRequest
    {
        public int EmpId { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}