package ai.foodrescue.donation.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
  private Cors cors = new Cors();
  private Razorpay razorpay = new Razorpay();

  public Cors getCors() {
    return cors;
  }

  public void setCors(Cors cors) {
    this.cors = cors;
  }

  public Razorpay getRazorpay() {
    return razorpay;
  }

  public void setRazorpay(Razorpay razorpay) {
    this.razorpay = razorpay;
  }

  public static class Cors {
    private List<String> allowedOrigins = List.of("http://localhost:3005");

    public List<String> getAllowedOrigins() {
      return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
      this.allowedOrigins = allowedOrigins;
    }
  }

  public static class Razorpay {
    private String keyId;
    private String keySecret;
    private String webhookSecret;

    public String getKeyId() {
      return keyId;
    }

    public void setKeyId(String keyId) {
      this.keyId = keyId;
    }

    public String getKeySecret() {
      return keySecret;
    }

    public void setKeySecret(String keySecret) {
      this.keySecret = keySecret;
    }

    public String getWebhookSecret() {
      return webhookSecret;
    }

    public void setWebhookSecret(String webhookSecret) {
      this.webhookSecret = webhookSecret;
    }
  }
}

