package ai.foodrescue.donation.web;

import ai.foodrescue.donation.domain.Campaign;
import ai.foodrescue.donation.repo.CampaignRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {
  private final CampaignRepository campaignRepository;

  public CampaignController(CampaignRepository campaignRepository) {
    this.campaignRepository = campaignRepository;
  }

  @GetMapping
  public List<CampaignDto> list(@RequestParam(name = "emergency", required = false) Boolean emergency) {
    List<Campaign> campaigns = campaignRepository.findAll();
    return campaigns.stream()
        .filter(c -> emergency == null || c.getEmergency().equals(emergency))
        .map(CampaignDto::from)
        .toList();
  }

  @GetMapping("/active-emergency")
  public List<CampaignDto> activeEmergency() {
    return campaignRepository.findActiveEmergency(OffsetDateTime.now())
        .stream().map(CampaignDto::from).toList();
  }

  public record CampaignDto(
      Long id,
      Long ngoId,
      String ngoName,
      String title,
      String description,
      Long goalAmount,
      Long raisedAmount,
      OffsetDateTime endsAt,
      Boolean emergency
  ) {
    static CampaignDto from(Campaign c) {
      return new CampaignDto(
          c.getId(),
          c.getNgo().getId(),
          c.getNgo().getName(),
          c.getTitle(),
          c.getDescription(),
          c.getGoalAmount(),
          c.getRaisedAmount(),
          c.getEndsAt(),
          c.getEmergency()
      );
    }
  }
}

