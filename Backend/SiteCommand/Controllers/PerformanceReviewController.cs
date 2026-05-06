using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LegacyOps.DTOs;
using LegacyOps.Repositories;


namespace LegacyOps.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PerformanceReviewController : ControllerBase
    {
        private readonly PerformanceReviewRepository _performanceReviewRepository;

        public PerformanceReviewController(PerformanceReviewRepository performanceReviewRepository)
        {
            _performanceReviewRepository = performanceReviewRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllReviews()
        {
            var reviews = await _performanceReviewRepository.GetAllReviewsAsync();
            return Ok(reviews);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReviewById(int id)
        {
            var review = await _performanceReviewRepository.GetReviewByIdAsync(id);
            if (review == null)
            {
                return NotFound();
            }
            return Ok(review);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetReviewsByEmployeeId(int employeeId)
        {
            var reviews = await _performanceReviewRepository.GetAllReviewsByEmployeeIdAsync(employeeId);
            return Ok(reviews);
        }

        [HttpGet("foreman/{foremanId}")]
        public async Task<IActionResult> GetReviewsByForemanId(int foremanId)
        {
            var reviews = await _performanceReviewRepository.GetAllReviewsByForemanIdAsync(foremanId);
            return Ok(reviews);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReview(CreatePerformanceReviewRequest request)
        {
            //if (string.IsNullOrEmpty(request.EmpId) || string.IsNullOrEmpty(request.JobId) || string.IsNullOrEmpty(request.ForemanId))
            //{
            //    return BadRequest("Missing important identification data.");
            //}
            Console.WriteLine("API end reached.");
            var createdReview = await _performanceReviewRepository.CreateReviewAsync(request);
            
            if (createdReview == null)
                return StatusCode(500, "Failed to create review.");

            return CreatedAtAction(nameof(GetReviewById), new {id =createdReview.Id }, createdReview);
        }


    }
}

