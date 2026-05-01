package ai.foodrescue.donation.web;

import ai.foodrescue.donation.repo.DonationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {
  private final DonationRepository donationRepository;
  private final ObjectMapper objectMapper;

  public MetricsController(DonationRepository donationRepository, ObjectMapper objectMapper) {
    this.donationRepository = donationRepository;
    this.objectMapper = objectMapper;
  }

  @GetMapping("/impact")
  public Map<String, Object> impact() {
    List<Map<String, Object>> impacts = donationRepository.findAll().stream()
        .filter(d -> "PAID".equals(d.getPaymentStatus()))
        .map(d -> {
          try {
            return (Map<String, Object>) objectMapper.readValue(d.getImpactJson(), Map.class);
          } catch (Exception e) {
            return Map.<String, Object>of();
          }
        }).toList();

    double meals = impacts.stream().mapToDouble(m -> asDouble(m.get("mealsFunded"))).sum();
    double foodKg = impacts.stream().mapToDouble(m -> asDouble(m.get("foodRescuedKg"))).sum();
    double co2Kg = impacts.stream().mapToDouble(m -> asDouble(m.get("co2ReducedKg"))).sum();
    double children = impacts.stream().mapToDouble(m -> asDouble(m.get("childrenSupported"))).sum();

    return Map.of(
        "mealsFundedTotal", (int) meals,
        "foodRescuedKgTotal", round1(foodKg),
        "co2ReducedKgTotal", round1(co2Kg),
        "childrenSupportedTotal", (int) children,
        "donationsPaidCount", donationRepository.findAll().stream().filter(d -> "PAID".equals(d.getPaymentStatus())).count()
    );
  }

  private static double asDouble(Object o) {
    if (o == null) return 0.0;
    if (o instanceof Number n) return n.doubleValue();
    try {
      return Double.parseDouble(String.valueOf(o));
    } catch (Exception e) {
      return 0.0;
    }
  }

  private static double round1(double v) {
    return Math.round(v * 10.0) / 10.0;
  }
}

