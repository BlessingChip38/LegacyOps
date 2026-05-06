using Dapper;
using MySql.Data.MySqlClient;
using LegacyOps.DTOs;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;

namespace LegacyOps.Repositories
{
    public class JobPhotoRepository
    {
        private readonly string? _connectionString;

        private static readonly string[] AllowedTypes =
        { "image/jpeg", "image/png", "image/webp" };

        private const int MaxFileSizeBytes = 10 * 1024 * 1024;



        public JobPhotoRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<JobPhotoResponse?> GetJobPhotoByIdAsync(int id)
        {
            using var connection = new MySqlConnection(_connectionString);

            var jobPhoto = await connection.QueryFirstOrDefaultAsync<JobPhotoResponse>(
                "SELECT * FROM job_pictures WHERE id = @Id",
                new { Id = id });

            return jobPhoto;
        }

        public async Task<IEnumerable<JobPhotoResponse>> GetAllJobPhotosByJobIdAsync(int jobId)
        {
            using var connection = new MySqlConnection(_connectionString);

            var jobPhotos = await connection.QueryAsync<JobPhotoResponse>(
                "SELECT * FROM job_pictures WHERE jobId = @JobId",
                new { JobId = jobId });

            return jobPhotos;
        }

        public async Task<IEnumerable<JobPhotoResponse>> GetAllJobPhotosAsync()
        {
            using var connection = new MySqlConnection(_connectionString);

            var jobPhotos = await connection.QueryAsync<JobPhotoResponse>(
                "SELECT * FROM job_pictures");

            return jobPhotos;
        }

        public async Task<JobPhotoResponse?> CreateJobPhotoAsync(CreateJobPhotoRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);

            

            await connection.OpenAsync();
            using var transaction = await connection.BeginTransactionAsync();
            try
            {
                ValidateImage(request.File!);

                var url = await SaveJobPhotoAsync(request.File!, request.JobId);
                
                var sortOrder = await connection.ExecuteScalarAsync<int>(
                    "SELECT COALESCE(MAX(sortOrder), -1) + 1 FROM job_pictures WHERE jobId = @JobId",
                    new { JobId = request.JobId },
                    transaction);

                await connection.ExecuteAsync(
                    @"INSERT INTO job_pictures (jobId, url, fileName, description, sortOrder, uploadedAt, uploadedBy) 
                    VALUES (@JobId, @Url, @FileName, @Description, @SortOrder, @UploadedAt, @UploadedBy)",
                    new
                    {
                        JobId = request.JobId,
                        Url = url,
                        FileName = request.FileName,
                        Description = request.Description,
                        SortOrder = sortOrder,
                        UploadedAt = DateTime.UtcNow,
                        UploadedBy = request.UploadedBy
                    },
                    transaction);

                var id = await connection.ExecuteScalarAsync<int>(
                    "SELECT LAST_INSERT_ID()",
                    transaction);

                await transaction.CommitAsync();

                return await GetJobPhotoByIdAsync(id);

            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<string> SaveJobPhotoAsync(IFormFile file, int jobId)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", jobId.ToString());

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return $"/uploads/{jobId}/{fileName}";
        }

        public void ValidateImage(IFormFile file)
        {
            if (file == null || file.Length == 0) 
            { 
                throw new Exception("No file provided."); 
            }

            if (file.Length > MaxFileSizeBytes)
            {
                throw new Exception("File is too large. Max 5MB allowed.");
            }
            if (!AllowedTypes.Contains(file.ContentType))
            {
                throw new Exception("Invalid file type. Only JPG, PNG, WEBP allowed.");
            }
            
            using var stream = file.OpenReadStream();
            if (!IsValidImage(stream))
                throw new Exception("File is not a valid image.");
        }
        private bool IsValidImage(Stream stream)
        {
            try
            {
                stream.Position = 0;

                using var image = Image.Load(stream);

                return image.Width > 0 && image.Height > 0;
            }
            catch
            {
                return false;
            }
        }
    }
}
