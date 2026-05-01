package ai.foodrescue.donation.repo;

import ai.foodrescue.donation.domain.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
  @Query("select c from Campaign c where c.emergency = true and c.endsAt > ?1 order by c.endsAt asc")
  List<Campaign> findActiveEmergency(OffsetDateTime now);
}

