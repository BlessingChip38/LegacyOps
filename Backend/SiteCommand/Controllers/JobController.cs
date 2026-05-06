using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LegacyOps.DTOs;
using LegacyOps.Repositories;


namespace LegacyOps.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class JobController : ControllerBase
    {
        private readonly JobRepository _jobRepository;

        public JobController(JobRepository jobRepository)
        {
            _jobRepository = jobRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllJobs()
        {
            var jobs = await _jobRepository.GetAllJobsAsync();
            return Ok(jobs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJobById(int id)
        {
            var job = await _jobRepository.GetJobByIdAsync(id);
            if (job == null)
            {
                return NotFound();
            }
            return Ok(job);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateJob(CreateJobRequest request)
        {
            var job = await _jobRepository.CreateJobAsync(request);
            if (job == null)
            {
                return BadRequest();
            }
            return CreatedAtAction(nameof(GetJobById), new { id = job.Id }, job);
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var hardDeleted = await _jobRepository.DeleteJobAsync(id);
            return Ok(hardDeleted);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateJobStatus(int id, [FromBody] UpdateJobStatusRequest request)
        {
            await _jobRepository.UpdateJobStatusAsync(id, request.Status!);
            return NoContent();
        }
    }
}
