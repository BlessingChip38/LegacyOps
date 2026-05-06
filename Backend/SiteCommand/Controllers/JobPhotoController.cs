using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LegacyOps.DTOs;
using LegacyOps.Repositories;

namespace LegacyOps.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class JobPhotoController : ControllerBase
    {
        private readonly JobPhotoRepository _jobPhotoRepository;

        public JobPhotoController(JobPhotoRepository jobPhotoRepository)
        {
            _jobPhotoRepository = jobPhotoRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPhotos()
        {
            var photos = await _jobPhotoRepository.GetAllJobPhotosAsync();
            return Ok(photos);
        }

        [HttpGet("job/{jobId}")]
        public async Task<IActionResult> GetAllPhotosByJob(int jobId)
        {
            var photos = await _jobPhotoRepository.GetAllJobPhotosByJobIdAsync(jobId);
            return Ok(photos);

        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPhotoById(int id)
        {
            var photo = await _jobPhotoRepository.GetJobPhotoByIdAsync(id);
            if(photo == null)
            {
                return NotFound();
            }
            return Ok(photo);
         }

        [HttpPost]
        public async Task<IActionResult> CreateJobPhoto([FromBody] CreateJobPhotoRequest request)
        {
            var createdPhoto = await _jobPhotoRepository.CreateJobPhotoAsync(request);
            return CreatedAtAction(nameof(GetPhotoById), new { id = createdPhoto?.Id }, createdPhoto);
        }


    }
}
