package ai.foodrescue.donation.web;

import ai.foodrescue.donation.domain.Donation;
import ai.foodrescue.donation.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
  private final PaymentService paymentService;
  private final ObjectMapper objectMapper;

  public PaymentController(PaymentService paymentService, ObjectMapper objectMapper) {
    this.paymentService = paymentService;
    this.objectMapper = objectMapper;
  }

  @PostMapping("/order")
  public PaymentService.CreateOrderResult createOrder(@Valid @RequestBody CreateOrderBody body) {
    return paymentService.createOrder(new PaymentService.CreateOrderRequest(
        body.donorName(),
        body.anonymous(),
        body.ngoId(),
        body.campaignId(),
        body.amountPaise(),
        body.message()
    ));
  }

  @PostMapping("/verify")
  public VerifyResponse verify(@Valid @RequestBody VerifyBody body) {
    Donation d = paymentService.verifyPayment(new PaymentService.VerifyPaymentRequest(
        body.razorpayOrderId(),
        body.razorpayPaymentId(),
        body.razorpaySignature()
    ));

    Map<String, Object> impact;
    try {
      impact = objectMapper.readValue(d.getImpactJson(), Map.class);
    } catch (Exception e) {
      impact = Map.of();
    }

    return new VerifyResponse(
        d.getId(),
        d.getPaymentStatus(),
        d.getTransactionId(),
        d.getMealsFunded(),
        impact
    );
  }

  public record CreateOrderBody(
      @NotBlank String donorName,
      Boolean anonymous,
      Long ngoId,
      Long campaignId,
      @NotNull Long amountPaise,
      String message
  ) {}

  public record VerifyBody(
      @NotBlank String razorpayOrderId,
      @NotBlank String razorpayPaymentId,
      @NotBlank String razorpaySignature
  ) {}

  public record VerifyResponse(
      Long donationId,
      String paymentStatus,
      String transactionId,
      Integer mealsFunded,
      Map<String, Object> impact
  ) {}
}

