using Dapper;
using MySql.Data.MySqlClient;
using LegacyOps.DTOs;
using Microsoft.AspNetCore.Http.HttpResults;


namespace LegacyOps.Repositories
{
    public class PunchCardRepository
    {
        private readonly string? _connectionString;

        public PunchCardRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<IEnumerable<PunchCardResponse>> GetAllPunchCardsAsync()
        {
            using var connection = new MySqlConnection(_connectionString);
            var punchCards = await connection.QueryAsync<PunchCardResponse>(
                "SELECT * FROM punch_records");

            foreach (var p in punchCards)
            { Normalize(p); }

            return punchCards;
        }

        public async Task<PunchCardResponse?> GetPunchCardByIdAsync(int id)
        {
            using var connection = new MySqlConnection(_connectionString);
            var punchCard = await connection.QueryFirstOrDefaultAsync<PunchCardResponse>(
                "SELECT * FROM punch_records WHERE id = @Id",
                new { Id = id }
                );

            if (punchCard == null)
            {
                return null;
            }
            Normalize(punchCard);

            return punchCard;
        }

        public async Task<IEnumerable<PunchCardResponse>> GetPunchCardsByEmployeeIdAsync(int empId)
        {
            using var connection = new MySqlConnection(_connectionString);
            var punchCards = await connection.QueryAsync<PunchCardResponse>(
                "SELECT * FROM punch_records WHERE empId = @EmpId",
                new { EmpId = empId }
                );

            foreach (var p in punchCards)
            { Normalize(p); }


            return punchCards;
        }

        public async Task<PunchCardResponse?> CreatePunchCardAsync(CreatePunchCardRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);
            Console.WriteLine("Made it here");
            var punchIn = DateTime.UtcNow;
            var punchCardId = await connection.ExecuteScalarAsync<int>(
                "INSERT INTO punch_records (empId, jobId, punchIn) VALUES (@EmpId, @JobId, @PunchIn); " +
                "SELECT LAST_INSERT_ID();",
                new
                {
                    EmpId = request.EmpId,
                    JobId = request.JobId,
                    PunchIn = punchIn
                }
                );
            return await GetPunchCardByIdAsync(punchCardId);
        }

        public async Task<PunchCardResponse?> UpdateClockOutPunchCardAsync(int id)
        {
            using var connection = new MySqlConnection(_connectionString);
            var clockOut = DateTime.UtcNow;
            var punchCard = await connection.QueryFirstOrDefaultAsync<PunchCardResponse?>(
                "SELECT * FROM punch_records WHERE id = @Id",
                new { Id = id }
                );
            if (punchCard == null)
            { return null; }


            var hours = Math.Round(
                (clockOut - punchCard.PunchIn).TotalHours,
                2
            );
            if (hours < 0.01f)
            {
                await connection.ExecuteAsync(
                    "DELETE FROM punch_records WHERE id=@ID",
                    new { Id = id });
                return new PunchCardResponse();
            }
            await connection.ExecuteAsync(
                "UPDATE punch_records SET punchOut = @PunchOut, totalHours = @TotalHours " +
                "WHERE id = @Id",
                new { PunchOut = clockOut, TotalHours = hours, Id = id });

            return await GetPunchCardByIdAsync(id);
            
        }

        private static DateTime EnsureUtc(DateTime dt)
        {
            return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
        }

        private void Normalize(PunchCardResponse p)
        {
            p.PunchIn = EnsureUtc(p.PunchIn);

            if (p.PunchOut.HasValue)
                p.PunchOut = EnsureUtc(p.PunchOut.Value);
        }

    }
}
