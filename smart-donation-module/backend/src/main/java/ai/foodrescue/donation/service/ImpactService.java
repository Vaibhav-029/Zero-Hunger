package ai.foodrescue.donation.service;

import java.util.LinkedHashMap;
import java.util.Map;

public class ImpactService {
  // Hackathon heuristics:
  // - 1 meal ~= ₹30
  // - 1kg food rescued per ₹25
  // - CO2 reduced ~= 0.9kg per 1kg food rescued
  public static int mealsForAmountPaise(long amountPaise) {
    long amountInr = Math.max(0, amountPaise / 100);
    return (int) Math.max(1, amountInr / 30);
  }

  public static Map<String, Object> impactForAmountPaise(long amountPaise) {
    int meals = mealsForAmountPaise(amountPaise);
    double foodKg = Math.max(1.0, (amountPaise / 100.0) / 25.0);
    double co2Kg = foodKg * 0.9;
    int childrenSupported = Math.max(1, meals / 3);

    Map<String, Object> m = new LinkedHashMap<>();
    m.put("mealsFunded", meals);
    m.put("foodRescuedKg", Math.round(foodKg * 10.0) / 10.0);
    m.put("co2ReducedKg", Math.round(co2Kg * 10.0) / 10.0);
    m.put("childrenSupported", childrenSupported);
    m.put("impactScore", Math.min(999, meals * 3));
    return m;
  }

  public static String badgeForMeals(int meals) {
    if (meals >= 150) return "Gold Food Rescuer";
    if (meals >= 60) return "Hunger Hero";
    return "Bronze Donor";
  }
}

