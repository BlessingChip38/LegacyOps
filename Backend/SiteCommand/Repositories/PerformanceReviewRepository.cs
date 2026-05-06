using Dapper;
using MySql.Data.MySqlClient;
using LegacyOps.DTOs;
using System.ComponentModel.DataAnnotations.Schema;


namespace LegacyOps.Repositories
{
    public class PerformanceReviewRepository
    {
        private readonly string? _connectionString;

        public PerformanceReviewRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<PerformanceReviewResponse?> GetReviewByIdAsync(int id)
        {
            using var connection = new MySqlConnection(_connectionString);
            var review = await connection.QueryFirstOrDefaultAsync<PerformanceReviewResponse>(
                "SELECT * FROM perf_reviews WHERE id = @Id",
                new
                {
                    Id = id
                });
            return review;
        }

        public async Task<IEnumerable<PerformanceReviewResponse>> GetAllReviewsAsync()
        {

            using var connection = new MySqlConnection(_connectionString);
            var reviews = await connection.QueryAsync<PerformanceReviewResponse>(
                "SELECT * FROM perf_reviews"
                );

            return reviews;
        }

        public async Task<IEnumerable<PerformanceReviewResponse>> GetAllReviewsByEmployeeIdAsync(int employeeId)
        {
            using var connection = new MySqlConnection(_connectionString);
            var reviews = await connection.QueryAsync<PerformanceReviewResponse>(
                "SELECT * FROM perf_reviews WHERE empId = @EmployeeId",
                new { EmployeeId = employeeId }
                );

            return reviews;
        }

        public async Task<IEnumerable<PerformanceReviewResponse>> GetAllReviewsByForemanIdAsync(int foremanId)
        {
            using var connection = new MySqlConnection(_connectionString);
            var reviews = await connection.QueryAsync<PerformanceReviewResponse>(
                "SELECT * FROM perf_reviews WHERE foremanId = @ForemanId",
                new { ForemanId = foremanId }
                );
            return reviews;
        }

        public async Task<PerformanceReviewResponse?> CreateReviewAsync(CreatePerformanceReviewRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);
            var date = DateTime.UtcNow;
            await connection.ExecuteAsync(
                "INSERT INTO perf_reviews (empId, jobId, reviewDate, safetyScore, productivityScore, attitudeScore, qualityScore, foremanId, notes) " +
                "VALUES (@EmpId, @JobId, @ReviewDate, @SafetyScore, @ProductivityScore, @AttitudeScore, @QualityScore, @ForemanId, @Notes);",
                new {EmpId = request.EmpId, 
                    JobId = request.JobId, 
                    ReviewDate = date,
                    SafetyScore = request.SafetyScore,
                    ProductivityScore = request.ProductivityScore,
                    AttitudeScore = request.AttitudeScore,
                    QualityScore = request.QualityScore,
                    ForemanId = request.ForemanId,
                    Notes = request.Notes }
                );
            var id = await connection.ExecuteScalarAsync<int>(
                "SELECT LAST_INSERT_ID()");

     

            return await GetReviewByIdAsync(id);
        }
    }
}
