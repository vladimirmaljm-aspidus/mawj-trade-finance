/**
 * REAL CBI data — sourced from cbiuae.com (Branch Locator API + Contact page).
 * Retrieved 2026-11-27. Do not invent values here.
 */

export interface BranchLocation {
  id: number;
  name: string;
  address: string;
  emirate: string;
  phone: string;
  lat: number;
  lng: number;
  isBranch: boolean;
  hasAtm: boolean;
  hasCcdm: boolean;
  /** Mon–Thu hours; Friday hours differ in UAE work week. */
  hours: string;
  friday: string;
  /** Open around the clock (electronic banking units / lobbies). */
  alwaysOpen?: boolean;
  /** Extra descriptor from the official listing. */
  note?: string;
}

/** 9 official CBI locations (api: /Umbraco/Api/BranchLocatorApi/GetAll). */
export const CBI_LOCATIONS: BranchLocation[] = [
  {
    id: 14,
    name: "Dubai Main Branch",
    address: "Al Riqqa Street, Deira — CBI Building",
    emirate: "Dubai",
    phone: "04 503 9000",
    lat: 25.265082,
    lng: 55.319831,
    isBranch: true,
    hasAtm: true,
    hasCcdm: true,
    hours: "08:00 – 15:00",
    friday: "07:15 – 12:15",
    note: "CBI Headquarters",
  },
  {
    id: 26,
    name: "Dubai Mall Branch",
    address: "Dubai Mall, Unit TDM-LG-150, Banking Area, Financial Centre Road",
    emirate: "Dubai",
    phone: "04 503 9000",
    lat: 25.198588,
    lng: 55.279507,
    isBranch: true,
    hasAtm: true,
    hasCcdm: true,
    hours: "10:00 – 21:30",
    friday: "16:00 – 21:30",
  },
  {
    id: 16,
    name: "Jumeirah Branch",
    address: "Jumeira St — Jumeirah 1",
    emirate: "Dubai",
    phone: "600544440",
    lat: 25.229204,
    lng: 55.261586,
    isBranch: true,
    hasAtm: true,
    hasCcdm: true,
    hours: "08:00 – 15:00",
    friday: "07:15 – 12:15",
  },
  {
    id: 79,
    name: "Radisson Blu Hotel — Dubai Waterfront",
    address: "Lobby Area, Marasi Drive, Business Bay",
    emirate: "Dubai",
    phone: "600544440",
    lat: 25.1865,
    lng: 55.268121,
    isBranch: false,
    hasAtm: true,
    hasCcdm: true,
    hours: "Open 24 hours",
    friday: "Open 24 hours",
    alwaysOpen: true,
    note: "ATM & Cash Deposit Machine only",
  },
  {
    id: 10,
    name: "Abu Dhabi Branch",
    address: "Al Bateen Street — near Corniche (landmark: Sheikha Fatima Park)",
    emirate: "Abu Dhabi",
    phone: "600544440",
    lat: 24.467981,
    lng: 54.33835,
    isBranch: true,
    hasAtm: true,
    hasCcdm: true,
    hours: "08:00 – 15:00",
    friday: "07:15 – 12:15",
    note: "24/7 ATM and CCDM",
  },
  {
    id: 13,
    name: "Al Ain Electronic Banking Unit",
    address: "Al Ain Mall",
    emirate: "Al Ain",
    phone: "600544440",
    lat: 24.221742,
    lng: 55.781714,
    isBranch: true,
    hasAtm: false,
    hasCcdm: true,
    hours: "Open 24 hours",
    friday: "Open 24 hours",
    alwaysOpen: true,
  },
  {
    id: 20,
    name: "Sharjah Buhaira Branch",
    address: "Al Dana Tower, Buhaira Corniche — Corniche St, Al Majaz 3",
    emirate: "Sharjah",
    phone: "04 503 9000",
    lat: 25.331738,
    lng: 55.376163,
    isBranch: true,
    hasAtm: false,
    hasCcdm: true,
    hours: "08:00 – 15:00",
    friday: "07:15 – 12:15",
  },
  {
    id: 2,
    name: "Sharjah Electronic Banking Unit",
    address: "Business Tower, Al Majaz 2",
    emirate: "Sharjah",
    phone: "600544440",
    lat: 25.329672,
    lng: 55.39128,
    isBranch: true,
    hasAtm: true,
    hasCcdm: true,
    hours: "Open 24 hours",
    friday: "Open 24 hours",
    alwaysOpen: true,
  },
  {
    id: 18,
    name: "Julphar Towers Branch",
    address: "Shops 1–4, Ground Floor, Julphar Towers Shopping Centre, Al Hesen Street",
    emirate: "Ras Al Khaimah",
    phone: "04 503 9000",
    lat: 25.791246,
    lng: 55.959828,
    isBranch: true,
    hasAtm: true,
    hasCcdm: true,
    hours: "08:00 – 15:00",
    friday: "07:15 – 12:15",
  },
];

/** Contact channels (page: /en/personal/contact-and-support/contact-us). */
export const CBI_CONTACT = {
  withinUae: "600544440",
  outsideUae: "+971 4 503 9000",
  email: "customercare@cbiuae.ae",
  /** CBI commitment shown on the contact page. */
  responseNote: "CBI is committed to responding to your concern within 5 working days.",
};

/** Help / FAQ content — themed on CBI customer-support topics. */
export interface FaqItem {
  q: string;
  a: string;
}

export const CBI_FAQS: FaqItem[] = [
  {
    q: "I forgot my username — how do I recover it?",
    a: "Tap 'Forgot Username?' on the login screen. Your registered mobile number or email address is required; your username will be sent to your registered contact details.",
  },
  {
    q: "I forgot my password — how do I reset it?",
    a: "Tap 'Forgot Password?' on the login screen and enter your username with your registered mobile number. A one-time password (OTP) is sent by SMS to verify your identity before you can set a new password.",
  },
  {
    q: "How do I register for CBI Mobile Banking?",
    a: "Tap 'Register' on the login screen. You need an active CBI account, your account number and registered mobile number. Corporate users also need a trade licence number and an authorised signatory nomination.",
  },
  {
    q: "Why is biometric login not working?",
    a: "Make sure fingerprint or Face ID is enrolled in your device settings and that the device supports FIDO2 biometric authentication. If it still fails, use LOGIN with your username and password, then re-enable biometrics under Security settings.",
  },
  {
    q: "How do I block my card if it is lost or stolen?",
    a: "Open Card Services, select the card and toggle it to 'Block' — the card is frozen instantly. To permanently cancel and reissue, call 600544440 (within UAE) or +971 4 503 9000 (outside UAE), available 24/7.",
  },
  {
    q: "Where can I find my IBAN?",
    a: "Your IBAN is shown under each account on the Account Summary screen and in Account Details. You can also generate your IBAN from your CBI account number on cbiuae.com under 'IBAN and SWIFT Code'. CBI's SWIFT/BIC code is CLBIAEAD.",
  },
  {
    q: "What are CBI's branch opening hours?",
    a: "Most branches open 08:00–15:00 Monday to Thursday and Saturday, 07:15–12:15 on Friday. Dubai Mall Branch operates 10:00–21:30. Electronic Banking Units and 24/7 ATMs are listed under Branch & ATM.",
  },
  {
    q: "How do I complain or give feedback?",
    a: "Call 600544440 or raise your concern via Contact Us. CBI is committed to responding to your concern within 5 working days. Escalation and complaint process details are available on cbiuae.com under Customer Complaint Process.",
  },
];
