package ai.foodrescue.donation.repo;

import ai.foodrescue.donation.domain.Ngo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NgoRepository extends JpaRepository<Ngo, Long> {
}

