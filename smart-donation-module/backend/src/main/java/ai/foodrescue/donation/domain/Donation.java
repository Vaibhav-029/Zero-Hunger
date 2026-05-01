package ai.foodrescue.donation.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@Entity
@Table(name = "donation")
public class Donation {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "donor_name", nullable = false)
  private String donorName;

  @Column(nullable = false)
  private Boolean anonymous = false;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "ngo_id")
  private Ngo ngo;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "campaign_id")
  private Campaign campaign;

  @Column(nullable = false)
  private Long amount; // paise

  @Column(nullable = false)
  private String currency = "INR";

  @Column(name = "razorpay_order_id")
  private String razorpayOrderId;

  @Column(name = "transaction_id")
  private String transactionId; // razorpay_payment_id

  @Column(name = "payment_signature")
  private String paymentSignature;

  @Column(name = "payment_status", nullable = false)
  private String paymentStatus = "CREATED";

  @Column(name = "meals_funded", nullable = false)
  private Integer mealsFunded = 0;

  @Column(columnDefinition = "text")
  private String message;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "impact_json", nullable = false, columnDefinition = "jsonb")
  private String impactJson = "{}";

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt = OffsetDateTime.now();

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getDonorName() {
    return donorName;
  }

  public void setDonorName(String donorName) {
    this.donorName = donorName;
  }

  public Boolean getAnonymous() {
    return anonymous;
  }

  public void setAnonymous(Boolean anonymous) {
    this.anonymous = anonymous;
  }

  public Ngo getNgo() {
    return ngo;
  }

  public void setNgo(Ngo ngo) {
    this.ngo = ngo;
  }

  public Campaign getCampaign() {
    return campaign;
  }

  public void setCampaign(Campaign campaign) {
    this.campaign = campaign;
  }

  public Long getAmount() {
    return amount;
  }

  public void setAmount(Long amount) {
    this.amount = amount;
  }

  public String getCurrency() {
    return currency;
  }

  public void setCurrency(String currency) {
    this.currency = currency;
  }

  public String getRazorpayOrderId() {
    return razorpayOrderId;
  }

  public void setRazorpayOrderId(String razorpayOrderId) {
    this.razorpayOrderId = razorpayOrderId;
  }

  public String getTransactionId() {
    return transactionId;
  }

  public void setTransactionId(String transactionId) {
    this.transactionId = transactionId;
  }

  public String getPaymentSignature() {
    return paymentSignature;
  }

  public void setPaymentSignature(String paymentSignature) {
    this.paymentSignature = paymentSignature;
  }

  public String getPaymentStatus() {
    return paymentStatus;
  }

  public void setPaymentStatus(String paymentStatus) {
    this.paymentStatus = paymentStatus;
  }

  public Integer getMealsFunded() {
    return mealsFunded;
  }

  public void setMealsFunded(Integer mealsFunded) {
    this.mealsFunded = mealsFunded;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public String getImpactJson() {
    return impactJson;
  }

  public void setImpactJson(String impactJson) {
    this.impactJson = impactJson;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }
}

