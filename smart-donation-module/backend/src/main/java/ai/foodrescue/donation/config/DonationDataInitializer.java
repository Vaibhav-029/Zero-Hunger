package ai.foodrescue.donation.config;

import ai.foodrescue.donation.domain.Campaign;
import ai.foodrescue.donation.domain.Ngo;
import ai.foodrescue.donation.repo.CampaignRepository;
import ai.foodrescue.donation.repo.NgoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@Profile("dev")
public class DonationDataInitializer implements CommandLineRunner {

  private final NgoRepository ngoRepository;
  private final CampaignRepository campaignRepository;

  public DonationDataInitializer(NgoRepository ngoRepository, CampaignRepository campaignRepository) {
    this.ngoRepository = ngoRepository;
    this.campaignRepository = campaignRepository;
  }

  @Override
  public void run(String... args) {
    Ngo hope = seedNgo("Hope Shelter", "Night meal drives for children and homeless families.", 9, 5420000L, true, "Mumbai", 19.0760, 72.8777);
    seedNgo("GreenPlate Rescue", "Rescues surplus food from events and redistributes locally.", 6, 1785000L, true, "Pune", 18.5204, 73.8567);
    seedNgo("Milk for Smiles", "Milk and nutrition kits for children in high-risk zones.", 8, 920000L, false, "Delhi", 28.6139, 77.2090);

    if (campaignRepository.findAll().stream().noneMatch(c -> "50 children need meals tonight".equals(c.getTitle()))) {
      Campaign campaign = new Campaign();
      campaign.setNgo(hope);
      campaign.setTitle("50 children need meals tonight");
      campaign.setDescription("Emergency hunger relief required for tonight's meal drive.");
      campaign.setGoalAmount(10_000_000L);
      campaign.setRaisedAmount(5_420_000L);
      campaign.setEndsAt(OffsetDateTime.now().plusHours(8));
      campaign.setEmergency(true);
      campaignRepository.save(campaign);
    }
  }

  private Ngo seedNgo(String name, String description, int urgency, long funds, boolean verified, String city, double lat, double lng) {
    return ngoRepository.findAll().stream()
        .filter(n -> name.equals(n.getName()))
        .findFirst()
        .orElseGet(() -> {
          Ngo ngo = new Ngo();
          ngo.setName(name);
          ngo.setDescription(description);
          ngo.setUrgencyLevel(urgency);
          ngo.setTotalFunds(funds);
          ngo.setVerified(verified);
          ngo.setCity(city);
          ngo.setLatitude(lat);
          ngo.setLongitude(lng);
          return ngoRepository.save(ngo);
        });
  }
}
