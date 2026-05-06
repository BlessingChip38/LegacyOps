using Dapper;
using MySql.Data.MySqlClient;
using LegacyOps.DTOs;
using LegacyOps.Enum;

namespace LegacyOps.Repositories
{
    public class JobRepository
    {

        private readonly string? _connectionString;

        public JobRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<IEnumerable<JobResponse>> GetAllJobsAsync()
        {
            using var connection = new MySqlConnection(_connectionString);
            var jobs = await connection.QueryAsync<JobResponse>(
                "SELECT * FROM jobs WHERE isActive = true"
                );
            return jobs;
        }

        public async Task<JobResponse?> GetJobByIdAsync(int id)
        {
            using var connection = new MySqlConnection(_connectionString);
            var job = await connection.QueryFirstOrDefaultAsync<JobResponse>(
                "SELECT * FROM jobs WHERE id = @Id",
                new { Id = id }
                );
            return job;
        }

        public async Task<JobResponse?> CreateJobAsync(CreateJobRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.ExecuteAsync(
                "INSERT INTO jobs (name, customer, street, city, state, lat, lng, status, color, isActive) VALUES (@Name, @Customer, @Street, @City, @State, @Lat, @Lng, @Status, @Color, @IsActive)",
                new
                {
                    Name = request.Name,
                    Customer = request.Customer,
                    Street = request.Street,
                    City = request.City,
                    State = request.State,
                    Lat = request.Lat,
                    Lng = request.Lng,
                    Status = request.Status,
                    Color = request.Color,
                    IsActive = true
                });
            var id = await connection.ExecuteScalarAsync<int>("SELECT LAST_INSERT_ID()");

            return await GetJobByIdAsync(id);
        }

        public async Task<bool> DeleteJobAsync(int id)
        {
            using var connection = new MySqlConnection(_connectionString);

            var hasData = await connection.QueryFirstOrDefaultAsync<int>(
                @"SELECT COUNT(*) FROM (
            SELECT id FROM punch_records WHERE jobId = @Id
            UNION ALL
            SELECT id FROM blue_stakes WHERE jobId = @Id
            UNION ALL
            SELECT id FROM perf_reviews WHERE jobId = @Id
        ) AS related",
                new { Id = id }
            );

            if (hasData > 0)
            {
                // Soft delete
                await connection.ExecuteAsync(
                    "UPDATE jobs SET isActive = false WHERE id = @Id",
                    new { Id = id }
                );

                await connection.ExecuteAsync(
                    "UPDATE jobs SET status = deleted WHERE id = @Id",
                    new {Id = id }
                    );

                return false; // false = soft deleted
            }
            else
            {
                // Hard delete
                await connection.ExecuteAsync(
                    "DELETE FROM jobs WHERE id = @Id",
                    new { Id = id }
                );
                return true; // true = hard deleted
            }
        }

        public async Task UpdateJobStatusAsync(int id, JobStatus status)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.ExecuteAsync(
                "UPDATE jobs SET status = @Status WHERE id = @Id",
                new { Status = status, Id = id }
            );
        }
    }
}
