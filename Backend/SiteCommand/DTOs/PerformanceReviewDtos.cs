namespace LegacyOps.DTOs
{
    public class PerformanceReviewResponse
    {
        public int Id { get; set; }
        public int EmpId { get; set; }
        public int JobId { get; set; }
        public DateTimeOffset? ReviewDate { get; set; }
        public int SafetyScore { get; set; }
        public int ProductivityScore { get; set; }
        public int AttitudeScore { get; set; }
        public int QualityScore { get; set; }
        public int ForemanId { get; set; }
        public string? Notes { get; set; }
    }

    public class CreatePerformanceReviewRequest
    {   
        public int EmpId { get; set; }
        public int JobId { get; set; }
        public DateTimeOffset? ReviewDate { get; set; }
        public int SafetyScore { get; set; }
        public int ProductivityScore { get; set; }
        public int AttitudeScore { get; set; }
        public int QualityScore { get; set; }
        public int ForemanId { get; set; }
        public string? Notes { get; set; }
    }
}
