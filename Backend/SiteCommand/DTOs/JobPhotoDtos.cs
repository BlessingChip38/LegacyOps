namespace LegacyOps.DTOs
{
    public class JobPhotoResponse
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public string? Url { get; set; }
        public string? Description { get; set; }
        public string? FileName { get; set; }
        public string? SortOrder { get; set; }
        public DateTimeOffset? UploadedAt { get; set; }
        public int UploadedBy { get; set; }

    }

    public class CreateJobPhotoRequest
    {
        public int JobId { get; set; }
        public string? Description { get; set; }
        public string? FileName { get; set; }
        public IFormFile? File { get; set; }
        public int UploadedBy { get; set; }
    }
}
