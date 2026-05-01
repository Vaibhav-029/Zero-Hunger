package ai.foodrescue.donation.domain;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "campaign")
public class Campaign {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "ngo_id", nullable = false)
  private Ngo ngo;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false, columnDefinition = "text")
  private String description;

  @Column(name = "goal_amount", nullable = false)
  private Long goalAmount; // paise

  @Column(name = "raised_amount", nullable = false)
  private Long raisedAmount = 0L; // paise

  @Column(name = "ends_at", nullable = false)
  private OffsetDateTime endsAt;

  @Column(name = "is_emergency", nullable = false)
  private Boolean emergency = false;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt = OffsetDateTime.now();

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Ngo getNgo() {
    return ngo;
  }

  public void setNgo(Ngo ngo) {
    this.ngo = ngo;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Long getGoalAmount() {
    return goalAmount;
  }

  public void setGoalAmount(Long goalAmount) {
    this.goalAmount = goalAmount;
  }

  public Long getRaisedAmount() {
    return raisedAmount;
  }

  public void setRaisedAmount(Long raisedAmount) {
    this.raisedAmount = raisedAmount;
  }

  public OffsetDateTime getEndsAt() {
    return endsAt;
  }

  public void setEndsAt(OffsetDateTime endsAt) {
    this.endsAt = endsAt;
  }

  public Boolean getEmergency() {
    return emergency;
  }

  public void setEmergency(Boolean emergency) {
    this.emergency = emergency;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }
}

