package ai.foodrescue.donation.service;

import ai.foodrescue.donation.config.AppProperties;
import ai.foodrescue.donation.domain.Campaign;
import ai.foodrescue.donation.domain.Donation;
import ai.foodrescue.donation.domain.Ngo;
import ai.foodrescue.donation.repo.CampaignRepository;
import ai.foodrescue.donation.repo.DonationRepository;
import ai.foodrescue.donation.repo.NgoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Map;

@Service
public class PaymentService {
  private final AppProperties props;
  private final NgoRepository ngoRepository;
  private final CampaignRepository campaignRepository;
  private final DonationRepository donationRepository;
  private final ObjectMapper objectMapper;

  public PaymentService(
      AppProperties props,
      NgoRepository ngoRepository,
      CampaignRepository campaignRepository,
      DonationRepository donationRepository,
      ObjectMapper objectMapper
  ) {
    this.props = props;
    this.ngoRepository = ngoRepository;
    this.campaignRepository = campaignRepository;
    this.donationRepository = donationRepository;
    this.objectMapper = objectMapper;
  }

  private RazorpayClient razorpay() {
    String keyId = props.getRazorpay().getKeyId();
    String secret = props.getRazorpay().getKeySecret();
    if (keyId == null || keyId.isBlank() || secret == null || secret.isBlank()) {
      throw new IllegalStateException("Missing Razorpay keys. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    }
    try {
      return new RazorpayClient(keyId, secret);
    } catch (Exception e) {
      throw new RuntimeException("Failed to init Razorpay client", e);
    }
  }

  @Transactional
  public CreateOrderResult createOrder(CreateOrderRequest req) {
    long amountPaise = req.amountPaise();
    if (amountPaise < 1000) {
      throw new IllegalArgumentException("Minimum amount is ₹10 (1000 paise) for demo.");
    }

    Ngo ngo = null;
    if (req.ngoId() != null) {
      ngo = ngoRepository.findById(req.ngoId())
          .orElseThrow(() -> new IllegalArgumentException("NGO not found"));
    }

    Campaign campaign = null;
    if (req.campaignId() != null) {
      campaign = campaignRepository.findById(req.campaignId())
          .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));
      ngo = campaign.getNgo();
    }

    int meals = ImpactService.mealsForAmountPaise(amountPaise);
    Map<String, Object> impact = ImpactService.impactForAmountPaise(amountPaise);

    Donation donation = new Donation();
    donation.setDonorName(req.donorName());
    donation.setAnonymous(Boolean.TRUE.equals(req.anonymous()));
    donation.setNgo(ngo);
    donation.setCampaign(campaign);
    donation.setAmount(amountPaise);
    donation.setCurrency("INR");
    donation.setMealsFunded(meals);
    donation.setMessage(req.message());
    try {
      donation.setImpactJson(objectMapper.writeValueAsString(impact));
    } catch (Exception e) {
      donation.setImpactJson("{}");
    }
    donation.setPaymentStatus("CREATED");
    donation = donationRepository.save(donation);

    try {
      JSONObject orderReq = new JSONObject();
      orderReq.put("amount", amountPaise);
      orderReq.put("currency", "INR");
      orderReq.put("receipt", "FR-" + donation.getId());
      Order order = razorpay().orders.create(orderReq);

      donation.setRazorpayOrderId(order.get("id"));
      donationRepository.save(donation);

      return new CreateOrderResult(
          donation.getId(),
          order.get("id"),
          props.getRazorpay().getKeyId(),
          meals,
          ImpactService.badgeForMeals(meals),
          impact
      );
    } catch (Exception e) {
      donation.setPaymentStatus("FAILED");
      donationRepository.save(donation);
      throw new RuntimeException("Failed to create Razorpay order", e);
    }
  }

  @Transactional
  public Donation verifyPayment(VerifyPaymentRequest req) {
    Donation donation = donationRepository.findByRazorpayOrderId(req.razorpayOrderId())
        .orElseThrow(() -> new IllegalArgumentException("Donation for order not found"));

    boolean valid = verifySignature(req.razorpayOrderId(), req.razorpayPaymentId(), req.razorpaySignature());
    donation.setTransactionId(req.razorpayPaymentId());
    donation.setPaymentSignature(req.razorpaySignature());
    donation.setPaymentStatus(valid ? "PAID" : "FAILED");

    if (valid && donation.getNgo() != null) {
      Ngo ngo = donation.getNgo();
      ngo.setTotalFunds((ngo.getTotalFunds() == null ? 0 : ngo.getTotalFunds()) + donation.getAmount());
      ngoRepository.save(ngo);
    }
    if (valid && donation.getCampaign() != null) {
      Campaign c = donation.getCampaign();
      c.setRaisedAmount((c.getRaisedAmount() == null ? 0 : c.getRaisedAmount()) + donation.getAmount());
      campaignRepository.save(c);
    }

    return donationRepository.save(donation);
  }

  private boolean verifySignature(String orderId, String paymentId, String signature) {
    String secret = props.getRazorpay().getKeySecret();
    String payload = orderId + "|" + paymentId;
    String computed = hmacSha256Hex(payload, secret);
    return computed.equals(signature);
  }

  private static String hmacSha256Hex(String data, String secret) {
    try {
      Mac sha256Hmac = Mac.getInstance("HmacSHA256");
      SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
      sha256Hmac.init(keySpec);
      byte[] macData = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(macData);
    } catch (Exception e) {
      throw new RuntimeException("HMAC calculation failed", e);
    }
  }

  public record CreateOrderRequest(
      String donorName,
      Boolean anonymous,
      Long ngoId,
      Long campaignId,
      Long amountPaise,
      String message
  ) {}

  public record CreateOrderResult(
      Long donationId,
      String razorpayOrderId,
      String razorpayKeyId,
      Integer mealsFunded,
      String badge,
      Map<String, Object> impact
  ) {}

  public record VerifyPaymentRequest(
      String razorpayOrderId,
      String razorpayPaymentId,
      String razorpaySignature
  ) {}
}

