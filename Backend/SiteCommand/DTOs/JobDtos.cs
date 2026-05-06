using LegacyOps.Enum;

namespace LegacyOps.DTOs
{
    public class JobResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Customer { get; set; }
        public string? Street { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        //public string? Zip { get; set; }
        public decimal Lat{ get; set; }
        public decimal Lng { get; set; }
        public JobStatus Status { get; set; }
        public string? Color { get; set; }
    }

    public class CreateJobRequest
    {
        public string? Name { get; set; }
        public string? Customer { get; set; }
        public string? Street { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        //public int Zip { get; set; }
        public decimal Lat { get; set; }
        public decimal Lng { get; set; }
        public JobStatus Status { get; set; }
        public string? Color { get; set; }
    }

    public class UpdateJobStatusRequest
    {
        public JobStatus Status { get; set; }
    }
}
