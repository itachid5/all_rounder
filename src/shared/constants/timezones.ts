export interface TimezoneInfo {
  value: string;
  label: string;
  offset: string;
  region: string;
}

export const TIMEZONES: TimezoneInfo[] = [
  { value: "Asia/Dhaka", label: "Asia/Dhaka (UTC+06:00)", offset: "UTC+06:00", region: "Bangladesh, Dhaka" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (UTC+05:30)", offset: "UTC+05:30", region: "India, New Delhi / Mumbai" },
  { value: "Asia/Karachi", label: "Asia/Karachi (UTC+05:00)", offset: "UTC+05:00", region: "Pakistan, Karachi" },
  { value: "Asia/Kathmandu", label: "Asia/Kathmandu (UTC+05:45)", offset: "UTC+05:45", region: "Nepal, Kathmandu" },
  { value: "Asia/Colombo", label: "Asia/Colombo (UTC+05:30)", offset: "UTC+05:30", region: "Sri Lanka, Colombo" },
  { value: "Asia/Dubai", label: "Asia/Dubai (UTC+04:00)", offset: "UTC+04:00", region: "United Arab Emirates, Dubai" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh (UTC+03:00)", offset: "UTC+03:00", region: "Saudi Arabia, Riyadh" },
  { value: "Asia/Doha", label: "Asia/Doha (UTC+03:00)", offset: "UTC+03:00", region: "Qatar, Doha" },
  { value: "Asia/Muscat", label: "Asia/Muscat (UTC+04:00)", offset: "UTC+04:00", region: "Oman, Muscat" },
  { value: "Asia/Kuwait", label: "Asia/Kuwait (UTC+03:00)", offset: "UTC+03:00", region: "Kuwait, Kuwait City" },
  { value: "Asia/Bahrain", label: "Asia/Bahrain (UTC+03:00)", offset: "UTC+03:00", region: "Bahrain, Manama" },
  { value: "Asia/Singapore", label: "Asia/Singapore (UTC+08:00)", offset: "UTC+08:00", region: "Singapore" },
  { value: "Asia/Kuala_Lumpur", label: "Asia/Kuala_Lumpur (UTC+08:00)", offset: "UTC+08:00", region: "Malaysia, Kuala Lumpur" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (UTC+07:00)", offset: "UTC+07:00", region: "Thailand, Bangkok" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta (UTC+07:00)", offset: "UTC+07:00", region: "Indonesia, Jakarta" },
  { value: "Asia/Manila", label: "Asia/Manila (UTC+08:00)", offset: "UTC+08:00", region: "Philippines, Manila" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (UTC+08:00)", offset: "UTC+08:00", region: "China, Beijing / Shanghai" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (UTC+09:00)", offset: "UTC+09:00", region: "Japan, Tokyo" },
  { value: "Asia/Seoul", label: "Asia/Seoul (UTC+09:00)", offset: "UTC+09:00", region: "South Korea, Seoul" },
  { value: "UTC", label: "UTC (UTC+00:00)", offset: "UTC+00:00", region: "Coordinated Universal Time" },
  { value: "Europe/London", label: "Europe/London (UTC+00:00)", offset: "UTC+00:00", region: "United Kingdom, London" },
  { value: "Europe/Paris", label: "Europe/Paris (UTC+01:00)", offset: "UTC+01:00", region: "France, Paris" },
  { value: "Europe/Berlin", label: "Europe/Berlin (UTC+01:00)", offset: "UTC+01:00", region: "Germany, Berlin" },
  { value: "Europe/Rome", label: "Europe/Rome (UTC+01:00)", offset: "UTC+01:00", region: "Italy, Rome" },
  { value: "Europe/Madrid", label: "Europe/Madrid (UTC+01:00)", offset: "UTC+01:00", region: "Spain, Madrid" },
  { value: "Europe/Amsterdam", label: "Europe/Amsterdam (UTC+01:00)", offset: "UTC+01:00", region: "Netherlands, Amsterdam" },
  { value: "Europe/Zurich", label: "Europe/Zurich (UTC+01:00)", offset: "UTC+01:00", region: "Switzerland, Zurich" },
  { value: "Europe/Istanbul", label: "Europe/Istanbul (UTC+03:00)", offset: "UTC+03:00", region: "Turkey, Istanbul" },
  { value: "Europe/Moscow", label: "Europe/Moscow (UTC+03:00)", offset: "UTC+03:00", region: "Russia, Moscow" },
  { value: "America/New_York", label: "America/New_York (UTC-05:00)", offset: "UTC-05:00", region: "US Eastern Time (New York)" },
  { value: "America/Chicago", label: "America/Chicago (UTC-06:00)", offset: "UTC-06:00", region: "US Central Time (Chicago)" },
  { value: "America/Denver", label: "America/Denver (UTC-07:00)", offset: "UTC-07:00", region: "US Mountain Time (Denver)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (UTC-08:00)", offset: "UTC-08:00", region: "US Pacific Time (Los Angeles)" },
  { value: "America/Toronto", label: "America/Toronto (UTC-05:00)", offset: "UTC-05:00", region: "Canada, Toronto" },
  { value: "America/Vancouver", label: "America/Vancouver (UTC-08:00)", offset: "UTC-08:00", region: "Canada, Vancouver" },
  { value: "America/Mexico_City", label: "America/Mexico_City (UTC-06:00)", offset: "UTC-06:00", region: "Mexico, Mexico City" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (UTC-03:00)", offset: "UTC-03:00", region: "Brazil, São Paulo" },
  { value: "America/Buenos_Aires", label: "America/Buenos_Aires (UTC-03:00)", offset: "UTC-03:00", region: "Argentina, Buenos Aires" },
  { value: "Australia/Sydney", label: "Australia/Sydney (UTC+10:00)", offset: "UTC+10:00", region: "Australia, Sydney" },
  { value: "Australia/Melbourne", label: "Australia/Melbourne (UTC+10:00)", offset: "UTC+10:00", region: "Australia, Melbourne" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (UTC+12:00)", offset: "UTC+12:00", region: "New Zealand, Auckland" },
  { value: "Africa/Cairo", label: "Africa/Cairo (UTC+02:00)", offset: "UTC+02:00", region: "Egypt, Cairo" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (UTC+02:00)", offset: "UTC+02:00", region: "South Africa, Johannesburg" },
  { value: "Africa/Lagos", label: "Africa/Lagos (UTC+01:00)", offset: "UTC+01:00", region: "Nigeria, Lagos" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi (UTC+03:00)", offset: "UTC+03:00", region: "Kenya, Nairobi" }
].sort((a, b) => a.value.localeCompare(b.value));

export function getTimezoneByValue(value?: string): TimezoneInfo {
  if (!value) return TIMEZONES.find(t => t.value === "Asia/Dhaka") || TIMEZONES[0];
  const found = TIMEZONES.find(t => t.value === value);
  return found || { value: value, label: value, offset: "", region: "" };
}
