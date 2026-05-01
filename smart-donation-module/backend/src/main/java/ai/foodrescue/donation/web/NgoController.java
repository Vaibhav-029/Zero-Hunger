package ai.foodrescue.donation.web;

import ai.foodrescue.donation.domain.Ngo;
import ai.foodrescue.donation.repo.NgoRepository;
import ai.foodrescue.donation.service.RecommendationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/ngos")
public class NgoController {
  private final NgoRepository ngoRepository;
  private final RecommendationService recommendationService;

  public NgoController(NgoRepository ngoRepository, RecommendationService recommendationService) {
    this.ngoRepository = ngoRepository;
    this.recommendationService = recommendationService;
  }

  @GetMapping
  public List<NgoDto> list() {
    return ngoRepository.findAll().stream()
        .sorted(Comparator.comparing(Ngo::getUrgencyLevel).reversed())
        .map(NgoDto::from)
        .toList();
  }

  @GetMapping("/recommended")
  public RecommendationService.Recommendation recommended() {
    return recommendationService.recommend();
  }

  public record NgoDto(
      Long id,
      String name,
      String description,
      Integer urgencyLevel,
      Long totalFunds,
      Boolean verified,
      String city
  ) {
    static NgoDto from(Ngo n) {
      return new NgoDto(
          n.getId(),
          n.getName(),
          n.getDescription(),
          n.getUrgencyLevel(),
          n.getTotalFunds(),
          n.getVerified(),
          n.getCity()
      );
    }
  }
}

