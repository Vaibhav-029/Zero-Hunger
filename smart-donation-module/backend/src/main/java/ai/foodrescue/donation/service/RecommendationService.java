package ai.foodrescue.donation.service;

import ai.foodrescue.donation.domain.Campaign;
import ai.foodrescue.donation.domain.Ngo;
import ai.foodrescue.donation.repo.CampaignRepository;
import ai.foodrescue.donation.repo.NgoRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class RecommendationService {
  private final NgoRepository ngoRepository;
  private final CampaignRepository campaignRepository;

  public RecommendationService(NgoRepository ngoRepository, CampaignRepository campaignRepository) {
    this.ngoRepository = ngoRepository;
    this.campaignRepository = campaignRepository;
  }

  public Recommendation recommend() {
    List<Campaign> emergencies = campaignRepository.findActiveEmergency(OffsetDateTime.now());
    Optional<Campaign> topEmergency = emergencies.stream()
        .min(Comparator.comparing(Campaign::getEndsAt));

    if (topEmergency.isPresent()) {
      Campaign c = topEmergency.get();
      return new Recommendation(
          c.getNgo().getId(),
          c.getNgo().getName(),
          c.getId(),
          "Emergency campaign ends soon: " + c.getTitle(),
          "AI suggests helping \"" + c.getNgo().getName() + "\" for immediate relief."
      );
    }

    List<Ngo> ngos = ngoRepository.findAll();
    Ngo best = ngos.stream()
        .max(Comparator.comparingDouble(this::scoreNgo))
        .orElse(null);

    if (best == null) {
      return new Recommendation(null, null, null, "No NGOs available", "Please add NGOs to seed data.");
    }

    return new Recommendation(
        best.getId(),
        best.getName(),
        null,
        "Highest urgency + low funds",
        "“" + best.getName() + "” urgently needs support for upcoming food rescue runs."
    );
  }

  private double scoreNgo(Ngo ngo) {
    double urgency = Math.min(10, Math.max(1, ngo.getUrgencyLevel()));
    double fundsInr = (ngo.getTotalFunds() == null ? 0 : ngo.getTotalFunds()) / 100.0;
    double lowFundsBoost = 1.0 / (1.0 + (fundsInr / 50000.0));
    double verifiedBoost = Boolean.TRUE.equals(ngo.getVerified()) ? 0.2 : 0.0;
    return urgency * 0.7 + lowFundsBoost * 3.0 + verifiedBoost;
  }

  public record Recommendation(
      Long ngoId,
      String ngoName,
      Long campaignId,
      String reason,
      String message
  ) {}
}

