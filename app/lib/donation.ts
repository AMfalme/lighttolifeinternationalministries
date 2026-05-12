export const DEFAULT_DONATION_NUMBER = "+254 700 123 456";
const DONATION_NUMBER_KEY = "donationNumber";

export const getStoredDonationNumber = () => {
  if (typeof window === "undefined") return DEFAULT_DONATION_NUMBER;

  return window.localStorage.getItem(DONATION_NUMBER_KEY) || DEFAULT_DONATION_NUMBER;
};

export const setStoredDonationNumber = (number: string) => {
  if (typeof window === "undefined") return;

  const nextNumber = number.trim() || DEFAULT_DONATION_NUMBER;
  window.localStorage.setItem(DONATION_NUMBER_KEY, nextNumber);
  window.dispatchEvent(new CustomEvent("donationnumberchange", { detail: nextNumber }));
};
