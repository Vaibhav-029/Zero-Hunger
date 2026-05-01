export function formatInrPaise(paise: number) {
  const inr = paise / 100;
  return inr.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });
}

export function toPaise(inr: number) {
  return Math.round(inr * 100);
}

