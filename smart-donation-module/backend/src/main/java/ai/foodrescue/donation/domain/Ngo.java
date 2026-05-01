package ai.foodrescue.donation.domain;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ngo")
public class Ngo {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false, columnDefinition = "text")
  private String description;

  @Column(name = "urgency_level", nullable = false)
  private Integer urgencyLevel = 1;

  @Column(name = "total_funds", nullable = false)
  private Long totalFunds = 0L; // paise

  @Column(nullable = false)
  private Boolean verified = false;

  private String city;
  private Double latitude;
  private Double longitude;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt = OffsetDateTime.now();

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Integer getUrgencyLevel() {
    return urgencyLevel;
  }

  public void setUrgencyLevel(Integer urgencyLevel) {
    this.urgencyLevel = urgencyLevel;
  }

  public Long getTotalFunds() {
    return totalFunds;
  }

  public void setTotalFunds(Long totalFunds) {
    this.totalFunds = totalFunds;
  }

  public Boolean getVerified() {
    return verified;
  }

  public void setVerified(Boolean verified) {
    this.verified = verified;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public Double getLatitude() {
    return latitude;
  }

  public void setLatitude(Double latitude) {
    this.latitude = latitude;
  }

  public Double getLongitude() {
    return longitude;
  }

  public void setLongitude(Double longitude) {
    this.longitude = longitude;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }
}

