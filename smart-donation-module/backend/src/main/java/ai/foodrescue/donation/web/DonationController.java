package ai.foodrescue.donation.web;

import ai.foodrescue.donation.domain.Donation;
import ai.foodrescue.donation.repo.DonationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationController {
  private final DonationRepository donationRepository;
  private final ObjectMapper objectMapper;

  public DonationController(DonationRepository donationRepository, ObjectMapper objectMapper) {
    this.donationRepository = donationRepository;
    this.objectMapper = objectMapper;
  }

  @GetMapping("/history")
  public List<DonationItem> history(@RequestParam(name = "limit", defaultValue = "25") int limit) {
    int safeLimit = Math.max(1, Math.min(100, limit));
    return donationRepository.findRecent(PageRequest.of(0, safeLimit)).stream()
        .map(this::toItem)
        .toList();
  }

  private DonationItem toItem(Donation d) {
    Map<String, Object> impact;
    try {
      impact = objectMapper.readValue(d.getImpactJson(), Map.class);
    } catch (Exception e) {
      impact = Map.of();
    }
    String ngoName = d.getNgo() == null ? null : d.getNgo().getName();
    Long ngoId = d.getNgo() == null ? null : d.getNgo().getId();
    return new DonationItem(
        d.getId(),
        d.getAnonymous() ? "Anonymous" : d.getDonorName(),
        ngoId,
        ngoName,
        d.getAmount(),
        d.getTransactionId(),
        d.getPaymentStatus(),
        d.getMealsFunded(),
        d.getCreatedAt(),
        impact
    );
  }

  public record DonationItem(
      Long id,
      String donorName,
      Long ngoId,
      String ngoName,
      Long amount,
      String transactionId,
      String paymentStatus,
      Integer mealsFunded,
      OffsetDateTime createdAt,
      Map<String, Object> impact
  ) {}
}

