package ai.foodrescue.donation.repo;

import ai.foodrescue.donation.domain.Donation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DonationRepository extends JpaRepository<Donation, Long> {
  Optional<Donation> findByRazorpayOrderId(String razorpayOrderId);

  @Query("select d from Donation d order by d.createdAt desc")
  List<Donation> findRecent(Pageable pageable);
}

