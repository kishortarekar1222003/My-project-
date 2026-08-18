import React, { useState, useEffect, useMemo } from "react";
import { subscribeCollection, addItem, updateItem, deleteItem, uploadPhoto } from "./dataService";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Home, MapPin, Phone, Search, Plus, Sofa, Users, X, Loader2, IndianRupee, Wifi, Wind, Car, Droplets, Zap, UtensilsCrossed, ImageOff, ExternalLink, Sparkles, Camera, Image as ImageIcon, ShieldCheck, Globe, Wrench, Truck, Share2 } from "lucide-react";

const LANGS = ["hi", "en"];
const LANG_LABELS = { hi: "हिंदी", en: "EN" };
const STRINGS = {
  headline: { hi: "रूम, दुकान, घर,\nफार्म हाउस या विला?", en: "Room, Shop, House,\nFarm House or Villa?" },
  tagline: { hi: "सिर्फ लोकल। कोई बिचौलिया नहीं, सीधे मालिक से बात करो।", en: "Local only. No middleman, talk directly to the owner." },
  freeBadge: { hi: "100% मुफ़्त · कोई दलाली नहीं", en: "100% Free · No Brokerage" },
  liveListings: { hi: "लिस्टिंग लाइव हैं", en: "listings live" },
  tabBrowse: { hi: "कमरा ढूंढो", en: "Find a Place" },
  tabPost: { hi: "कमरा जोड़ो", en: "Add a Listing" },
  tabServices: { hi: "लोकल सेवाएं", en: "Local Services" },
  searchPlaceholder: { hi: "इलाका या मोहल्ला खोजो (जैसे सदर, धरमपेठ...)", en: "Search by area or locality" },
  verifiedBadge: { hi: "मालिक सत्यापित", en: "Owner Verified" },
  allCities: { hi: "सभी शहर", en: "All Cities" },
  allPropertyTypes: { hi: "सभी तरह की जगह", en: "All Property Types" },
  allRoomTypes: { hi: "सभी कमरे के प्रकार", en: "All Room Types" },
  anyGender: { hi: "किसी के लिए भी", en: "Anyone" },
  maxRentPlaceholder: { hi: "अधिकतम किराया (₹)", en: "Max rent (₹)" },
  noListingsYet: { hi: "अभी कोई लिस्टिंग नहीं है। सबसे पहले अपना कमरा जोड़ो!", en: "No listings yet. Be the first to add yours!" },
  noMatchFilter: { hi: "इस फ़िल्टर से कोई जगह नहीं मिली। फ़िल्टर बदल कर देखो।", en: "No matches for this filter. Try changing it." },
  postFormTitle: { hi: "अपनी जगह जोड़ो", en: "List your place" },
  labelTitle: { hi: "शीर्षक", en: "Title" },
  labelPropertyType: { hi: "जगह का प्रकार", en: "Property Type" },
  labelCity: { hi: "शहर", en: "City" },
  labelArea: { hi: "इलाका / मोहल्ला", en: "Area / Locality" },
  labelRent: { hi: "किराया (₹/महीना)", en: "Rent (₹/month)" },
  labelRoomType: { hi: "कमरे का प्रकार", en: "Room Type" },
  labelFurnishing: { hi: "फर्नीचर की स्थिति", en: "Furnishing" },
  labelGenderPref: { hi: "किसके लिए", en: "Preferred for" },
  labelAmenities: { hi: "सुविधाएं", en: "Amenities" },
  labelContact: { hi: "संपर्क नंबर", en: "Contact Number" },
  labelDescription: { hi: "विवरण (वैकल्पिक)", en: "Description (optional)" },
  labelPhotos: { hi: "फ़ोटो (वैकल्पिक)", en: "Photos (optional)" },
  verifyCheckboxTitle: { hi: "मैंने यह जगह खुद देखी है", en: "I have personally seen this place" },
  verifyCheckboxDesc: { hi: "अगर तुम खुद मालिक/मैनेजर हो और जगह असली है तो टिक करो। इससे तुम्हारी लिस्टिंग पर \"मालिक सत्यापित\" बैज दिखेगा।", en: "Check this if you're the real owner/manager and the place is genuine. Shows an \"Owner Verified\" badge." },
  submitButton: { hi: "लिस्टिंग पोस्ट करो", en: "Post Listing" },
  savingButton: { hi: "सेव हो रहा है...", en: "Saving..." },
  callButton: { hi: "कॉल", en: "Call" },
  manageMyListing: { hi: "मेरी लिस्टिंग मैनेज करो (एडिट/डिलीट)", en: "Manage my listing (edit/delete)" },

  // ListingCard
  numberDekho: { hi: "नंबर देखो", en: "Reveal number" },
  shareWhatsapp: { hi: "व्हाट्सऐप पर शेयर करो", en: "Share on WhatsApp" },
  staleWarning: { hi: "पुरानी लिस्टिंग हो सकती है", en: "This listing may be outdated" },
  reportListing: { hi: "गलत लिस्टिंग? रिपोर्ट करो", en: "Wrong listing? Report it" },
  reportedThanks: { hi: "रिपोर्ट हो गया, रिव्यू होगा", en: "Reported — will be reviewed" },
  openInMaps: { hi: "गूगल मैप्स में देखो", en: "Open in Google Maps" },
  perMonth: { hi: "/महीना", en: "/mo" },

  // Manage listing modal
  manageTitle: { hi: "मेरी लिस्टिंग मैनेज करो", en: "Manage my listing" },
  manageContactLabel: { hi: "संपर्क नंबर (जो लिस्टिंग में दिया था)", en: "Contact number (used in listing)" },
  managePinLabel: { hi: "4 अंकों का PIN", en: "4-digit PIN" },
  findMyListingBtn: { hi: "मेरी लिस्टिंग ढूंढो", en: "Find my listing" },
  statusLive: { hi: "लाइव है", en: "Live" },
  statusPending: { hi: "रिव्यू में है", en: "Under review" },
  renewBtn: { hi: "रिन्यू करो (अभी भी उपलब्ध है)", en: "Renew (still available)" },
  deleteBtn: { hi: "हटाओ (रेंट हो गया)", en: "Remove (rented out)" },

  // Admin modal
  adminTitle: { hi: "एडमिन — रिव्यू क्यू", en: "Admin — Review Queue" },
  adminPasscodeLabel: { hi: "एडमिन पासकोड", en: "Admin Passcode" },
  unlockBtn: { hi: "अनलॉक करो", en: "Unlock" },
  exportDataBtn: { hi: "पूरा डेटा बैकअप एक्सपोर्ट करो (.json)", en: "Export full data backup (.json)" },
  pendingListingsHeading: { hi: "लिस्टिंग्स", en: "Listings" },
  pendingServicesHeading: { hi: "सेवाएं", en: "Services" },
  pendingCount: { hi: "पेंडिंग", en: "pending" },
  noPendingListings: { hi: "कोई पेंडिंग लिस्टिंग नहीं है।", en: "No pending listings." },
  noPendingServices: { hi: "कोई पेंडिंग सेवा नहीं है।", en: "No pending services." },
  approveBtn: { hi: "अप्रूव करो", en: "Approve" },
  rejectBtn: { hi: "रिजेक्ट करो", en: "Reject" },

  // Services tab
  servicesHeading: { hi: "लोकल सेवाएं", en: "Local Services" },
  servicesSubtext: { hi: "पैकर्स-मूवर्स, इलेक्ट्रीशियन, फर्नीचर रेंटल, टिफिन — अपना लोकल बिजनेस यहां मुफ़्त में लिस्ट करो।", en: "Packers-movers, electrician, furniture rental, tiffin — list your local business here for free." },
  servicePostedMsg: { hi: "✓ सेवा सबमिट हो गई! रिव्यू के बाद लाइव होगी।", en: "✓ Service submitted! It'll go live after review." },
  addBusinessTitle: { hi: "अपना बिजनेस जोड़ो", en: "Add your business" },
  labelBusinessName: { hi: "बिजनेस / नाम", en: "Business / Name" },
  labelServiceType: { hi: "सेवा का प्रकार", en: "Service Type" },
  serviceSubmitBtn: { hi: "सेवा जोड़ो", en: "Add Service" },
  noServicesYet: { hi: "अभी कोई सेवा लिस्ट नहीं है।", en: "No services listed yet." },

  // Post-submit banner
  listingSubmittedMsg: { hi: "✓ लिस्टिंग सबमिट हो गई! रिव्यू के बाद जल्द लाइव होगी।", en: "✓ Listing submitted! It'll be live soon after review." },
  savePinMsg: { hi: "अपना PIN सेव करो", en: "Save your PIN" },
  pinHelpMsg: { hi: "इससे बाद में लिस्टिंग एडिट/डिलीट कर सकते हो", en: "Use it later to edit/delete your listing" },

  // Owner control panel
  tabPending: { hi: "पेंडिंग", en: "Pending" },
  tabAllListings: { hi: "सभी लिस्टिंग", en: "All Listings" },
  tabSettings: { hi: "सेटिंग्स", en: "Settings" },
  takeDownBtn: { hi: "हटाओ (कभी भी)", en: "Take Down (anytime)" },
  storageUsageLabel: { hi: "स्टोरेज इस्तेमाल", en: "Storage Usage" },
  totalRecordsLabel: { hi: "कुल रिकॉर्ड्स", en: "total records" },
  storageShardNote: { hi: "Firebase par koi practical size limit nahi hai — jitni chahe listings aur services add kar sakte ho.", en: "No practical size ceiling on Firebase — add as many listings and services as you need." },
  changePasscodeLabel: { hi: "नया Admin Passcode सेट करो", en: "Set a new Admin Passcode" },
  savePasscodeBtn: { hi: "Passcode सेव करो", en: "Save Passcode" },
  passcodeWarning: { hi: "ध्यान दो: ये passcode app के code me hi save hota hai (browser storage), koi real login security nahi hai. Sirf casual spam rokne ke liye hai.", en: "Note: this passcode is stored client-side, not real login security — it only helps block casual spam." },

  // Terms & Conditions
  termsLink: { hi: "नियम व शर्तें", en: "Terms & Conditions" },
  termsTitle: { hi: "नियम व शर्तें", en: "Terms & Conditions" },
  termsIntro: { hi: "Room Wala सिर्फ owners aur tenants ko connect karne ka platform hai — hum kisi property ke malik nahi hain aur kisi deal me party nahi hain.", en: "Room Wala is only a platform connecting owners and tenants — we do not own any property and are not a party to any deal." },
  termsPoint1Title: { hi: "1. Listing ki जिम्मेदारी", en: "1. Listing Responsibility" },
  termsPoint1Body: { hi: "Har listing ki jaankari (photos, rent, availability) us owner ne di hai jisne usse post kiya. Room Wala inki accuracy guarantee nahi karta. Property dekhne se pehle khud verify karo.", en: "Each listing's details (photos, rent, availability) are provided by the owner who posted it. Room Wala does not guarantee their accuracy. Verify everything yourself before visiting." },
  termsPoint2Title: { hi: "2. Koi Brokerage Nahi", en: "2. No Brokerage" },
  termsPoint2Body: { hi: "Platform free hai, koi commission ya brokerage nahi liya jaata. Rent, deposit, agreement seedha owner aur tenant ke beech tay hota hai — Room Wala isme shaamil nahi hai.", en: "The platform is free — no commission or brokerage is charged. Rent, deposit, and agreements are settled directly between owner and tenant — Room Wala is not involved." },
  termsPoint3Title: { hi: "3. Data & Privacy", en: "3. Data & Privacy" },
  termsPoint3Body: { hi: "Jo contact number tum listing me dete ho, wo publicly dikhta hai taaki log tumse contact kar saken. Spam calls se bachne ke liye masked number wala option use karo.", en: "The contact number you provide on a listing is shown publicly so people can reach you. Use the masked-number option to reduce spam calls." },
  termsPoint4Title: { hi: "4. Disputes", en: "4. Disputes" },
  termsPoint4Body: { hi: "Kisi bhi rent ya property dispute me Room Wala party nahi hai. Fraud ya galat listing lage toh 'Report' button use karo — hum review karke hata denge.", en: "Room Wala is not a party to any rent or property dispute. If a listing looks fraudulent or wrong, use the 'Report' button — we'll review and remove it." },
};

const CITIES = ["Nagpur", "Bhandara", "Sakoli", "Lakhani", "Pauni", "Varthi", "Jawaharnagar Petrol Pump", "Kondha"];
const PROPERTY_TYPES = ["Room", "Shop", "Ghar", "Farm House", "Villa"];
const ROOM_TYPES = ["Single Room", "Shared Room", "1 RK", "1 BHK", "PG"];
const FURNISHING = ["Unfurnished", "Semi-furnished", "Fully furnished"];
const GENDER_PREFS = ["Any", "Male", "Female"];

const PROPERTY_TYPE_LABELS = {
  Room: { hi: "कमरा", en: "Room" },
  Shop: { hi: "दुकान", en: "Shop" },
  Ghar: { hi: "घर", en: "House" },
  "Farm House": { hi: "फार्म हाउस", en: "Farm House" },
  Villa: { hi: "विला", en: "Villa" },
};
const ROOM_TYPE_LABELS = {
  "Single Room": { hi: "सिंगल रूम", en: "Single Room" },
  "Shared Room": { hi: "शेयर्ड रूम", en: "Shared Room" },
  "1 RK": { hi: "1 RK", en: "1 RK" },
  "1 BHK": { hi: "1 BHK", en: "1 BHK" },
  PG: { hi: "पीजी", en: "PG" },
};
const FURNISHING_LABELS = {
  Unfurnished: { hi: "बिना फर्नीचर", en: "Unfurnished" },
  "Semi-furnished": { hi: "सेमी-फर्निश्ड", en: "Semi-furnished" },
  "Fully furnished": { hi: "पूरी तरह फर्निश्ड", en: "Fully furnished" },
};
const GENDER_LABELS = {
  Any: { hi: "किसी के लिए भी", en: "Anyone" },
  Male: { hi: "पुरुष", en: "Male" },
  Female: { hi: "महिला", en: "Female" },
};
const SERVICE_TYPE_LABELS = {
  "Packers & Movers": { hi: "पैकर्स एंड मूवर्स", en: "Packers & Movers" },
  Electrician: { hi: "इलेक्ट्रीशियन", en: "Electrician" },
  Plumber: { hi: "प्लंबर", en: "Plumber" },
  "Furniture Rental": { hi: "फर्नीचर रेंटल", en: "Furniture Rental" },
  "Tiffin/Food": { hi: "टिफिन/खाना", en: "Tiffin/Food" },
  Cleaning: { hi: "सफाई", en: "Cleaning" },
  Other: { hi: "अन्य", en: "Other" },
};
function label(dict, key, lang) {
  return dict[key]?.[lang] || dict[key]?.hi || key;
}
const PHOTO_CATEGORIES_BY_TYPE = {
  Room: ["Bedroom", "Bathroom", "Toilet", "Kitchen", "Hall"],
  Ghar: ["Bedroom", "Bathroom", "Toilet", "Kitchen", "Hall", "Exterior"],
  Villa: ["Bedroom", "Bathroom", "Toilet", "Kitchen", "Hall", "Exterior"],
  "Farm House": ["Bedroom", "Bathroom", "Toilet", "Kitchen", "Hall", "Exterior", "Land"],
  Shop: ["Front", "Inside", "Storage"],
};
const ROOM_SUBTYPE_PHOTO_CATEGORIES = {
  "Shared Room": ["My Bed / Space", "Bathroom", "Toilet", "Kitchen", "Common Hall"],
  "PG": ["My Bed / Space", "Bathroom", "Toilet", "Kitchen", "Common Hall", "Mess/Dining"],
};

function getPhotoCategories(form) {
  if (form.propertyType === "Room" && ROOM_SUBTYPE_PHOTO_CATEGORIES[form.roomType]) {
    return ROOM_SUBTYPE_PHOTO_CATEGORIES[form.roomType];
  }
  return PHOTO_CATEGORIES_BY_TYPE[form.propertyType] || PHOTO_CATEGORIES_BY_TYPE.Room;
}
const AMENITIES = [
  { id: "wifi", label: { hi: "वाई-फाई", en: "Wi-Fi" }, icon: Wifi },
  { id: "ac", label: { hi: "एसी", en: "AC" }, icon: Wind },
  { id: "parking", label: { hi: "पार्किंग", en: "Parking" }, icon: Car },
  { id: "water", label: { hi: "24 घंटे पानी", en: "24hr Water" }, icon: Droplets },
  { id: "power", label: { hi: "पावर बैकअप", en: "Power Backup" }, icon: Zap },
  { id: "food", label: { hi: "खाना शामिल", en: "Food Included" }, icon: UtensilsCrossed },
];

const SERVICE_TYPES = ["Packers & Movers", "Electrician", "Plumber", "Furniture Rental", "Tiffin/Food", "Cleaning", "Other"];

const emptyForm = {
  title: "",
  propertyType: "Room",
  city: "Nagpur",
  area: "",
  rent: "",
  roomType: "Single Room",
  furnishing: "Semi-furnished",
  genderPref: "Any",
  amenities: [],
  contact: "",
  description: "",
  images: [],
  verified: false,
};

const emptyServiceForm = {
  name: "",
  serviceType: "Packers & Movers",
  city: "Nagpur",
  area: "",
  contact: "",
  description: "",
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function genPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function maskPhone(num) {
  const digits = (num || "").replace(/\D/g, "");
  if (digits.length < 6) return num;
  return digits.slice(0, 5) + "•••" + digits.slice(-2);
}

// Simple in-app moderation gate. Not real security (visible in client code),
// just enough to keep casual spam out — change this before real-world use.
const ADMIN_PASSCODE = "7788";

// Reads an image file, resizes it down, and returns a compressed base64 data URL
// so it can be stored as plain text and stay well under storage size limits.
function compressImage(file, maxDim = 480, quality = 0.45) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [tab, setTab] = useState("browse");
  const [lang, setLang] = useState("hi");
  const t = (key) => STRINGS[key]?.[lang] || STRINGS[key]?.hi || key;

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [posted, setPosted] = useState(false);

  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [serviceError, setServiceError] = useState("");
  const [serviceSaving, setServiceSaving] = useState(false);
  const [servicePosted, setServicePosted] = useState(false);

  const [filters, setFilters] = useState({ city: "All", propertyType: "All", roomType: "All", genderPref: "All", maxRent: "", query: "" });
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [lastPin, setLastPin] = useState("");

  const [manageOpen, setManageOpen] = useState(false);
  const [manageContact, setManageContact] = useState("");
  const [managePin, setManagePin] = useState("");
  const [manageError, setManageError] = useState("");
  const [manageResults, setManageResults] = useState(null);

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminTab, setAdminTab] = useState("pending");
  const [currentPasscode, setCurrentPasscode] = useState(ADMIN_PASSCODE);
  const [newPasscode, setNewPasscode] = useState("");
  const [passcodeMsg, setPasscodeMsg] = useState("");
  const [tcOpen, setTcOpen] = useState(false);

  useEffect(() => {
    let listingsLoaded = false;
    let servicesLoaded = false;
    const maybeStopLoading = () => {
      if (listingsLoaded && servicesLoaded) setLoading(false);
    };

    const unsubListings = subscribeCollection(
      "listings",
      (items) => {
        setListings(items);
        listingsLoaded = true;
        maybeStopLoading();
      },
      () => {
        listingsLoaded = true;
        maybeStopLoading();
      }
    );

    const unsubServices = subscribeCollection(
      "services",
      (items) => {
        setServices(items);
        servicesLoaded = true;
        maybeStopLoading();
      },
      () => {
        servicesLoaded = true;
        maybeStopLoading();
      }
    );

    (async () => {
      try {
        const settingsSnap = await getDoc(doc(db, "settings", "app"));
        if (settingsSnap.exists() && settingsSnap.data().adminPasscode) {
          setCurrentPasscode(settingsSnap.data().adminPasscode);
        }
      } catch (e) {
        // no custom passcode set yet — use default
      }
    })();

    return () => {
      unsubListings();
      unsubServices();
    };
  }, []);

  const filtered = useMemo(() => {
    return listings
      .filter((l) => (l.status || "approved") === "approved")
      .filter((l) => (filters.city === "All" ? true : l.city === filters.city))
      .filter((l) => (filters.propertyType === "All" ? true : (l.propertyType || "Room") === filters.propertyType))
      .filter((l) => (filters.roomType === "All" ? true : l.roomType === filters.roomType))
      .filter((l) => (filters.genderPref === "All" ? true : (l.genderPref || "Any") === "Any" || l.genderPref === filters.genderPref))
      .filter((l) => (filters.maxRent ? Number(l.rent) <= Number(filters.maxRent) : true))
      .filter((l) =>
        filters.query
          ? (l.area + " " + l.title + " " + l.description + " " + (l.propertyType || "")).toLowerCase().includes(filters.query.toLowerCase())
          : true
      )
      .sort((a, b) => b.postedAt - a.postedAt);
  }, [listings, filters]);

  const statsCount = listings.length;

  function toggleAmenity(id) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(id) ? f.amenities.filter((a) => a !== id) : [...f.amenities, id],
    }));
  }

  async function handlePhotoSelect(file, label) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Sirf image file upload karein.");
      return;
    }
    setFormError("");
    setPhotoBusy(true);
    try {
      const dataUrl = await compressImage(file);
      setForm((f) => ({ ...f, images: [...f.images, { id: uid(), url: dataUrl, label }] }));
    } catch (err) {
      setFormError("Photo upload nahi ho payi, dobara try karein.");
    } finally {
      setPhotoBusy(false);
    }
  }

  function removePhoto(id) {
    setForm((f) => ({ ...f, images: f.images.filter((img) => img.id !== id) }));
  }

  async function submitListing(e) {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim() || !form.area.trim() || !form.rent || !form.contact.trim()) {
      setFormError("Title, area, rent aur contact number zaroori hai.");
      return;
    }
    if (!/^[0-9+\-\s]{7,15}$/.test(form.contact.trim())) {
      setFormError("Sahi contact number daalein.");
      return;
    }
    setSaving(true);
    try {
      const pin = genPin();
      const pendingImages = form.images; // base64 previews still sitting in memory
      const { images, ...rest } = form;
      const newId = await addItem("listings", {
        ...rest,
        rent: Number(form.rent),
        postedAt: Date.now(),
        status: "pending",
        pin,
        images: [],
      });

      // Now that we have a real document id, upload each photo to Storage
      // and save back the real download URLs (not raw base64) on the doc.
      const uploadedImages = [];
      for (const img of pendingImages) {
        try {
          const url = await uploadPhoto(img.url, `listings/${newId}/${img.label}-${uid()}.jpg`);
          uploadedImages.push({ id: img.id, url, label: img.label });
        } catch (photoErr) {
          // one failed photo shouldn't block the whole listing from going up
        }
      }
      if (uploadedImages.length > 0) {
        await updateItem("listings", newId, { images: uploadedImages });
      }

      setForm(emptyForm);
      setLastPin(pin);
      setPosted(true);
      setTimeout(() => setPosted(false), 8000);
      setTab("browse");
    } catch (err) {
      setFormError("Kuch gadbad ho gayi, dobara try karein.");
    } finally {
      setSaving(false);
    }
  }

  async function submitService(e) {
    e.preventDefault();
    setServiceError("");
    if (!serviceForm.name.trim() || !serviceForm.area.trim() || !serviceForm.contact.trim()) {
      setServiceError("Naam, area aur contact number zaroori hai.");
      return;
    }
    if (!/^[0-9+\-\s]{7,15}$/.test(serviceForm.contact.trim())) {
      setServiceError("Sahi contact number daalein.");
      return;
    }
    setServiceSaving(true);
    try {
      const pin = genPin();
      await addItem("services", { ...serviceForm, postedAt: Date.now(), status: "pending", pin });
      setServiceForm(emptyServiceForm);
      setLastPin(pin);
      setServicePosted(true);
      setTimeout(() => setServicePosted(false), 8000);
    } catch (err) {
      setServiceError("Kuch gadbad ho gayi, dobara try karein.");
    } finally {
      setServiceSaving(false);
    }
  }

  function findMyListings() {
    setManageError("");
    setManageResults(null);
    if (!manageContact.trim() || !managePin.trim()) {
      setManageError("Contact number aur PIN dono bharo.");
      return;
    }
    const matches = listings.filter(
      (l) => l.contact.replace(/\D/g, "").endsWith(manageContact.replace(/\D/g, "").slice(-10)) && l.pin === managePin.trim()
    );
    if (matches.length === 0) {
      setManageError("Koi listing nahi mili. Contact number aur PIN check karo.");
      return;
    }
    setManageResults(matches);
  }

  async function deleteMyListing(id) {
    try {
      await deleteItem("listings", id);
      setManageResults((r) => r.filter((l) => l.id !== id));
    } catch (e) {
      setManageError("Delete nahi ho paya, dobara try karo.");
    }
  }

  async function setListingStatus(id, status) {
    try {
      await updateItem("listings", id, { status });
    } catch (e) {
      // realtime listener will simply not reflect the change; UI stays consistent
    }
  }

  async function reportListing(id) {
    try {
      await updateItem("listings", id, { status: "pending", reported: true });
    } catch (e) {}
  }

  async function deleteListingAdmin(id) {
    try {
      await deleteItem("listings", id);
    } catch (e) {}
  }

  async function setServiceStatus(id, status) {
    try {
      await updateItem("services", id, { status });
    } catch (e) {}
  }

  async function deleteServiceAdmin(id) {
    try {
      await deleteItem("services", id);
    } catch (e) {}
  }

  async function refreshMyListing(id) {
    try {
      await updateItem("listings", id, { postedAt: Date.now() });
      setManageResults((r) => r.map((l) => (l.id === id ? { ...l, postedAt: Date.now() } : l)));
    } catch (e) {
      setManageError("Refresh nahi ho paya, dobara try karo.");
    }
  }

  function exportAllData() {
    downloadJSON({ listings, services, exportedAt: new Date().toISOString() }, `roomwala-backup-${Date.now()}.json`);
  }

  async function changePasscode() {
    setPasscodeMsg("");
    if (!/^\d{4,8}$/.test(newPasscode.trim())) {
      setPasscodeMsg("4-8 digit ka naya passcode daalo.");
      return;
    }
    try {
      await setDoc(doc(db, "settings", "app"), { adminPasscode: newPasscode.trim() }, { merge: true });
      setCurrentPasscode(newPasscode.trim());
      setNewPasscode("");
      setPasscodeMsg("✓ Passcode change ho gaya.");
    } catch (e) {
      setPasscodeMsg("Save nahi hua, dobara try karo.");
    }
  }

  async function takeDownListing(id) {
    try {
      await deleteItem("listings", id);
    } catch (e) {}
  }

  async function takeDownService(id) {
    try {
      await deleteItem("services", id);
    } catch (e) {}
  }

  return (
    <div style={{ fontFamily: "'Work Sans', ui-sans-serif, system-ui", background: "#F6EFE2", minHeight: "100vh", color: "#1B2A4A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Work+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        .display { font-family: 'Space Grotesk', ui-sans-serif, system-ui; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        button { font-family: inherit; cursor: pointer; }
        input, select, textarea { font-family: inherit; }
        input:focus, select:focus, textarea:focus, button:focus-visible {
          outline: 2px solid #E8672B; outline-offset: 2px;
        }
        ::placeholder { color: #9C8F78; }
        .chip { transition: all 0.15s ease; }
        .card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(27,42,74,0.14); }
        @media (prefers-reduced-motion: reduce) {
          .card, .chip { transition: none !important; }
          .card:hover { transform: none; }
        }
      `}</style>

      {/* Header */}
      <header style={{ background: "linear-gradient(160deg, #1B2A4A 0%, #101B34 100%)", padding: "22px 16px 30px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,163,78,0.16) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "linear-gradient(135deg, #E8672B, #C9A34E)", width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(201,163,78,0.35)" }}>
              <Home size={18} color="#1B2A4A" strokeWidth={2.5} />
            </div>
            <span className="display" style={{ color: "#F6EFE2", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Room Wala
            </span>
            <span className="mono" style={{ color: "#D9B96A", fontSize: 11, background: "rgba(201,163,78,0.14)", padding: "2px 8px", borderRadius: 20, marginLeft: 2, border: "1px solid rgba(201,163,78,0.3)" }}>
              NAGPUR · BHANDARA
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 3, background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: 3 }}>
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 16, border: "none",
                    background: lang === l ? "#D9B96A" : "transparent", color: lang === l ? "#1B2A4A" : "#C7CEDD",
                  }}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAdminOpen(true)}
              aria-label="Admin"
              style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", color: "#C7CEDD", flexShrink: 0 }}
            >
              <ShieldCheck size={13} />
            </button>
          </div>
          <h1 className="display" style={{ color: "#F6EFE2", fontSize: 26, fontWeight: 700, marginTop: 16, marginBottom: 6, lineHeight: 1.25, letterSpacing: "-0.02em", whiteSpace: "pre-line" }}>
            {t("headline")}
          </h1>
          <p style={{ color: "#C7CEDD", fontSize: 14, margin: 0 }}>{t("tagline")}</p>

          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,163,78,0.25)", borderRadius: 10, padding: "6px 12px" }}>
              <Sparkles size={13} color="#D9B96A" />
              <span style={{ color: "#F6EFE2", fontSize: 12.5, fontWeight: 600 }}>{statsCount} {t("liveListings")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(47,110,93,0.18)", border: "1px solid rgba(93,196,164,0.35)", borderRadius: 10, padding: "6px 12px" }}>
              <ShieldCheck size={13} color="#7FD9BB" />
              <span style={{ color: "#F6EFE2", fontSize: 12.5, fontWeight: 600 }}>{t("freeBadge")}</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <button
              onClick={() => setTab("browse")}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, border: "none",
                background: tab === "browse" ? "linear-gradient(135deg, #E8672B, #D9843F)" : "rgba(255,255,255,0.08)",
                color: tab === "browse" ? "#1B2A4A" : "#F6EFE2", fontWeight: 600, fontSize: 12.5,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                boxShadow: tab === "browse" ? "0 4px 14px rgba(232,103,43,0.35)" : "none",
              }}
            >
              <Search size={14} /> {t("tabBrowse")}
            </button>
            <button
              onClick={() => setTab("post")}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, border: "none",
                background: tab === "post" ? "linear-gradient(135deg, #E8672B, #D9843F)" : "rgba(255,255,255,0.08)",
                color: tab === "post" ? "#1B2A4A" : "#F6EFE2", fontWeight: 600, fontSize: 12.5,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                boxShadow: tab === "post" ? "0 4px 14px rgba(232,103,43,0.35)" : "none",
              }}
            >
              <Plus size={14} /> {t("tabPost")}
            </button>
            <button
              onClick={() => setTab("services")}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, border: "none",
                background: tab === "services" ? "linear-gradient(135deg, #E8672B, #D9843F)" : "rgba(255,255,255,0.08)",
                color: tab === "services" ? "#1B2A4A" : "#F6EFE2", fontWeight: 600, fontSize: 12.5,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                boxShadow: tab === "services" ? "0 4px 14px rgba(232,103,43,0.35)" : "none",
              }}
            >
              <Wrench size={14} /> {t("tabServices")}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px" }}>
        {posted && (
          <div style={{ background: "#2F6E5D", color: "#fff", padding: "12px 14px", borderRadius: 10, fontSize: 13.5, marginBottom: 16, fontWeight: 500, lineHeight: 1.5 }}>
            {t("listingSubmittedMsg")}<br />
            <strong>{t("savePinMsg")}: {lastPin}</strong> — {t("pinHelpMsg")}.
          </div>
        )}

        {tab === "browse" && (
          <button
            type="button"
            onClick={() => setManageOpen(true)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", background: "#fff", border: "1px dashed #D8CCAE", borderRadius: 10, padding: "9px", fontSize: 12.5, color: "#5C5646", fontWeight: 600, marginBottom: 14 }}
          >
            <ShieldCheck size={13} /> {t("manageMyListing")}
          </button>
        )}

        {tab === "browse" ? (
          <BrowseView
            loading={loading}
            filtered={filtered}
            filters={filters}
            setFilters={setFilters}
            total={listings.length}
            t={t}
            lang={lang}
            onReport={reportListing}
          />
        ) : tab === "post" ? (
          <PostForm
            form={form}
            setForm={setForm}
            toggleAmenity={toggleAmenity}
            onSubmit={submitListing}
            saving={saving}
            formError={formError}
            onPhotoSelect={handlePhotoSelect}
            onPhotoRemove={removePhoto}
            photoBusy={photoBusy}
            t={t}
            lang={lang}
          />
        ) : (
          <ServicesView
            services={services}
            serviceForm={serviceForm}
            setServiceForm={setServiceForm}
            onSubmit={submitService}
            saving={serviceSaving}
            formError={serviceError}
            posted={servicePosted}
            t={t}
            lang={lang}
          />
        )}

        {error && <p style={{ color: "#B23A2E", fontSize: 13 }}>{error}</p>}
      </main>

      {manageOpen && (
        <ManageModal
          onClose={() => { setManageOpen(false); setManageResults(null); setManageError(""); setManageContact(""); setManagePin(""); }}
          manageContact={manageContact}
          setManageContact={setManageContact}
          managePin={managePin}
          setManagePin={setManagePin}
          manageError={manageError}
          manageResults={manageResults}
          onFind={findMyListings}
          onDelete={deleteMyListing}
          onRenew={refreshMyListing}
          t={t}
        />
      )}

      {adminOpen && (
        <AdminModal
          unlocked={adminUnlocked}
          passInput={adminPassInput}
          setPassInput={setAdminPassInput}
          error={adminError}
          onUnlock={() => {
            if (adminPassInput === currentPasscode) { setAdminUnlocked(true); setAdminError(""); }
            else setAdminError("Galat passcode.");
          }}
          onClose={() => { setAdminOpen(false); setAdminPassInput(""); setAdminError(""); }}
          listings={listings}
          services={services}
          onApproveListing={(id) => setListingStatus(id, "approved")}
          onRejectListing={deleteListingAdmin}
          onApproveService={(id) => setServiceStatus(id, "approved")}
          onRejectService={deleteServiceAdmin}
          onTakeDownListing={takeDownListing}
          onTakeDownService={takeDownService}
          onExport={exportAllData}
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          newPasscode={newPasscode}
          setNewPasscode={setNewPasscode}
          onChangePasscode={changePasscode}
          passcodeMsg={passcodeMsg}
          t={t}
        />
      )}

      {tcOpen && <TermsModal onClose={() => setTcOpen(false)} t={t} />}

      <footer style={{ textAlign: "center", padding: "10px 16px 30px", maxWidth: 720, margin: "0 auto" }}>
        <button type="button" onClick={() => setTcOpen(true)} style={{ background: "none", border: "none", color: "#9C8F78", fontSize: 11.5, textDecoration: "underline", padding: 0 }}>
          {t("termsLink")}
        </button>
      </footer>
    </div>
  );
}

function BrowseView({ loading, filtered, filters, setFilters, total, t, lang, onReport }) {
  return (
    <div>
      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 18, boxShadow: "0 2px 10px rgba(27,42,74,0.06)" }}>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <Search size={16} color="#9C8F78" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            placeholder={t("searchPlaceholder")}
            style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: "1px solid #E5DDC8", fontSize: 14 }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <select value={filters.propertyType} onChange={(e) => setFilters((f) => ({ ...f, propertyType: e.target.value }))} style={selectStyle}>
            <option value="All">{t("allPropertyTypes")}</option>
            {PROPERTY_TYPES.map((p) => <option key={p} value={p}>{label(PROPERTY_TYPE_LABELS, p, lang)}</option>)}
          </select>
          <select value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} style={selectStyle}>
            <option value="All">{t("allCities")}</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.roomType} onChange={(e) => setFilters((f) => ({ ...f, roomType: e.target.value }))} style={selectStyle}>
            <option value="All">{t("allRoomTypes")}</option>
            {ROOM_TYPES.map((r) => <option key={r} value={r}>{label(ROOM_TYPE_LABELS, r, lang)}</option>)}
          </select>
          <select value={filters.genderPref} onChange={(e) => setFilters((f) => ({ ...f, genderPref: e.target.value }))} style={selectStyle}>
            <option value="All">{t("anyGender")}</option>
            {GENDER_PREFS.map((g) => <option key={g} value={g}>{label(GENDER_LABELS, g, lang)}</option>)}
          </select>
          <input
            type="number"
            value={filters.maxRent}
            onChange={(e) => setFilters((f) => ({ ...f, maxRent: e.target.value }))}
            placeholder={t("maxRentPlaceholder")}
            style={{ ...selectStyle }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader2 className="animate-spin" size={24} color="#E8672B" />
        </div>
      ) : total === 0 ? (
        <EmptyState text={t("noListingsYet")} />
      ) : filtered.length === 0 ? (
        <EmptyState text={t("noMatchFilter")} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((l) => <ListingCard key={l.id} listing={l} onReport={onReport} t={t} lang={lang} />)}
        </div>
      )}
    </div>
  );
}

const selectStyle = { padding: "9px 10px", borderRadius: 10, border: "1px solid #E5DDC8", fontSize: 13, background: "#fff", color: "#1B2A4A" };

function EmptyState({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "50px 20px", color: "#7A7261" }}>
      <Home size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
      <p style={{ fontSize: 14, margin: 0 }}>{text}</p>
    </div>
  );
}

const serviceInputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E5DDC8", fontSize: 14, background: "#fff", color: "#1B2A4A" };

function CallButton({ contact, flex, t }) {
  const [revealed, setRevealed] = useState(false);
  const baseStyle = {
    marginTop: flex ? 0 : 10, flex: flex ? 1 : undefined, width: flex ? undefined : "100%",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    background: "linear-gradient(135deg, #1B2A4A, #223864)", color: "#F0D9A0", padding: flex ? "10px" : "9px",
    borderRadius: flex ? 10 : 9, fontSize: flex ? 14 : 13, fontWeight: 600, border: "1px solid rgba(201,163,78,0.3)", textDecoration: "none",
  };
  if (!revealed) {
    return (
      <button type="button" onClick={() => setRevealed(true)} style={{ ...baseStyle, borderStyle: "solid" }}>
        <Phone size={flex ? 14 : 13} /> {flex ? t("callButton") : `${maskPhone(contact)} · ${t("numberDekho")}`}
      </button>
    );
  }
  return (
    <a href={`tel:${contact}`} style={baseStyle}>
      <Phone size={flex ? 14 : 13} /> {contact}
    </a>
  );
}

function ServicesView({ services, serviceForm, setServiceForm, onSubmit, saving, formError, posted, t, lang }) {
  const set = (k) => (e) => setServiceForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #FBEADD, #F6E3C4)", border: "1px solid rgba(201,163,78,0.35)", borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Truck size={16} color="#9A5A16" />
          <h2 className="display" style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: "#7A4212" }}>{t("servicesHeading")}</h2>
        </div>
        <p style={{ fontSize: 12.5, color: "#7A4212", margin: 0 }}>{t("servicesSubtext")}</p>
      </div>

      {posted && (
        <div style={{ background: "#2F6E5D", color: "#fff", padding: "10px 14px", borderRadius: 10, fontSize: 13.5, marginBottom: 16, fontWeight: 500 }}>
          {t("servicePostedMsg")}
        </div>
      )}

      {services.filter((s) => (s.status || "approved") === "approved").length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {services.filter((s) => (s.status || "approved") === "approved").map((s) => (
            <div key={s.id} style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 2px 10px rgba(27,42,74,0.06)", border: "1px solid #EFE8D6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <h3 className="display" style={{ margin: 0, fontSize: 15.5, fontWeight: 700 }}>{s.name}</h3>
                  <span style={{ fontSize: 12, color: "#7A7261" }}>{s.area}, {s.city}</span>
                </div>
                <Tag icon={Wrench} text={label(SERVICE_TYPE_LABELS, s.serviceType, lang)} />
              </div>
              {s.description && <p style={{ fontSize: 12.5, color: "#5C5646", margin: "8px 0 0" }}>{s.description}</p>}
              <CallButton contact={s.contact} t={t} />
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 12.5, color: "#9C8F78", marginBottom: 18 }}>{t("noServicesYet")}</p>
      )}

      <form onSubmit={onSubmit} style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 2px 10px rgba(27,42,74,0.06)" }}>
        <h2 className="display" style={{ fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 14 }}>{t("addBusinessTitle")}</h2>

        <Field label={t("labelBusinessName")}>
          <input value={serviceForm.name} onChange={set("name")} placeholder="e.g. Sharma Movers" style={serviceInputStyle} />
        </Field>

        <Field label={t("labelServiceType")}>
          <select value={serviceForm.serviceType} onChange={set("serviceType")} style={serviceInputStyle}>
            {SERVICE_TYPES.map((s) => <option key={s} value={s}>{label(SERVICE_TYPE_LABELS, s, lang)}</option>)}
          </select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label={t("labelCity")}>
            <select value={serviceForm.city} onChange={set("city")} style={serviceInputStyle}>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label={t("labelArea")}>
            <input value={serviceForm.area} onChange={set("area")} placeholder="e.g. Sadar" style={serviceInputStyle} />
          </Field>
        </div>

        <Field label={t("labelContact")}>
          <input value={serviceForm.contact} onChange={set("contact")} placeholder="e.g. 9876543210" style={serviceInputStyle} />
        </Field>

        <Field label={t("labelDescription")}>
          <textarea value={serviceForm.description} onChange={set("description")} placeholder="Kya-kya service dete ho..." rows={2} style={{ ...serviceInputStyle, resize: "vertical" }} />
        </Field>

        {formError && <p style={{ color: "#B23A2E", fontSize: 13, margin: "4px 0 12px" }}>{formError}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%", padding: "12px", background: "#E8672B", color: "#fff", border: "none", borderRadius: 10,
            fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> {t("savingButton")}</> : t("serviceSubmitBtn")}
        </button>
      </form>
    </div>
  );
}

const overlayStyle = { position: "fixed", inset: 0, background: "rgba(16,27,52,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50, padding: 0 };
const sheetStyle = { background: "#F6EFE2", width: "100%", maxWidth: 720, maxHeight: "85vh", overflowY: "auto", borderRadius: "20px 20px 0 0", padding: 18 };

function ManageModal({ onClose, manageContact, setManageContact, managePin, setManagePin, manageError, manageResults, onFind, onDelete, onRenew, t }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 className="display" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{t("manageTitle")}</h2>
          <button type="button" onClick={onClose} style={{ background: "#EFE8D6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <Field label={t("manageContactLabel")}>
            <input value={manageContact} onChange={(e) => setManageContact(e.target.value)} placeholder="e.g. 9876543210" style={inputStyle} />
          </Field>
          <Field label={t("managePinLabel")}>
            <input value={managePin} onChange={(e) => setManagePin(e.target.value)} placeholder="e.g. 4821" maxLength={4} style={inputStyle} />
          </Field>
          {manageError && <p style={{ color: "#B23A2E", fontSize: 13, margin: "0 0 10px" }}>{manageError}</p>}
          <button
            type="button"
            onClick={onFind}
            style={{ width: "100%", padding: "11px", background: "#1B2A4A", color: "#F0D9A0", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}
          >
            {t("findMyListingBtn")}
          </button>
        </div>

        {manageResults && manageResults.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {manageResults.map((l) => {
              const ageDays = Math.floor((Date.now() - (l.postedAt || Date.now())) / 86400000);
              return (
                <div key={l.id} style={{ background: "#fff", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{l.title}</div>
                      <div style={{ fontSize: 12, color: "#7A7261" }}>{l.area}, {l.city} · {(l.status || "approved") === "pending" ? t("statusPending") : t("statusLive")}</div>
                    </div>
                  </div>
                  {ageDays > 30 && (l.status || "approved") === "approved" && (
                    <div style={{ background: "#FBEADD", color: "#9A5A16", fontSize: 11.5, borderRadius: 8, padding: "6px 8px", marginTop: 8 }}>
                      ⏱ {t("staleWarning")} ({ageDays}d)
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    {ageDays > 30 && (l.status || "approved") === "approved" && (
                      <button
                        type="button"
                        onClick={() => onRenew(l.id)}
                        style={{ flex: 1, background: "#E8F2EE", color: "#2F6E5D", border: "1px solid rgba(47,110,93,0.3)", borderRadius: 8, padding: "7px", fontSize: 12.5, fontWeight: 700 }}
                      >
                        {t("renewBtn")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(l.id)}
                      style={{ flex: 1, background: "#FBEAE7", color: "#B23A2E", border: "1px solid rgba(178,58,46,0.3)", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}
                    >
                      {t("deleteBtn")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminModal({ unlocked, passInput, setPassInput, error, onUnlock, onClose, listings, services, onApproveListing, onRejectListing, onApproveService, onRejectService, onTakeDownListing, onTakeDownService, onExport, adminTab, setAdminTab, newPasscode, setNewPasscode, onChangePasscode, passcodeMsg, t }) {
  const pendingListings = listings.filter((l) => (l.status || "approved") === "pending");
  const pendingServices = services.filter((s) => (s.status || "approved") === "pending");
  const totalDocs = listings.length + services.length;

  const tabs = [
    { id: "pending", label: t("tabPending") },
    { id: "all", label: t("tabAllListings") },
    { id: "settings", label: t("tabSettings") },
  ];

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 className="display" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{t("adminTitle")}</h2>
          <button type="button" onClick={onClose} style={{ background: "#EFE8D6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} />
          </button>
        </div>

        {!unlocked ? (
          <div style={{ background: "#fff", borderRadius: 14, padding: 14 }}>
            <Field label={t("adminPasscodeLabel")}>
              <input type="password" value={passInput} onChange={(e) => setPassInput(e.target.value)} placeholder="••••" style={inputStyle} />
            </Field>
            {error && <p style={{ color: "#B23A2E", fontSize: 13, margin: "0 0 10px" }}>{error}</p>}
            <button type="button" onClick={onUnlock} style={{ width: "100%", padding: "11px", background: "#1B2A4A", color: "#F0D9A0", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              {t("unlockBtn")}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#EFE8D6", borderRadius: 10, padding: 3 }}>
              {tabs.map((tb) => (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => setAdminTab(tb.id)}
                  style={{ flex: 1, padding: "7px 4px", borderRadius: 8, border: "none", fontSize: 11.5, fontWeight: 700, background: adminTab === tb.id ? "#1B2A4A" : "transparent", color: adminTab === tb.id ? "#F0D9A0" : "#5C5646" }}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {adminTab === "pending" && (
              <>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#5C5646", margin: "0 0 8px" }}>{t("pendingListingsHeading")} ({pendingListings.length} {t("pendingCount")})</h3>
                {pendingListings.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: "#9C8F78", marginBottom: 16 }}>{t("noPendingListings")}</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                    {pendingListings.map((l) => (
                      <div key={l.id} style={{ background: "#fff", borderRadius: 12, padding: 12, border: l.reported ? "1px solid rgba(178,58,46,0.4)" : "1px solid transparent" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{l.title}</div>
                          {l.reported && <span style={{ fontSize: 10, color: "#B23A2E", fontWeight: 700, background: "#FBEAE7", padding: "2px 6px", borderRadius: 20 }}>🚩 Reported</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#7A7261", marginBottom: 8 }}>{l.area}, {l.city} · ₹{l.rent} · {l.contact}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button type="button" onClick={() => onApproveListing(l.id)} style={{ flex: 1, background: "#E8F2EE", color: "#2F6E5D", border: "1px solid rgba(47,110,93,0.3)", borderRadius: 8, padding: "7px", fontSize: 12.5, fontWeight: 700 }}>{t("approveBtn")}</button>
                          <button type="button" onClick={() => onRejectListing(l.id)} style={{ flex: 1, background: "#FBEAE7", color: "#B23A2E", border: "1px solid rgba(178,58,46,0.3)", borderRadius: 8, padding: "7px", fontSize: 12.5, fontWeight: 700 }}>{t("rejectBtn")}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#5C5646", margin: "0 0 8px" }}>{t("pendingServicesHeading")} ({pendingServices.length} {t("pendingCount")})</h3>
                {pendingServices.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: "#9C8F78" }}>{t("noPendingServices")}</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {pendingServices.map((s) => (
                      <div key={s.id} style={{ background: "#fff", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: "#7A7261", marginBottom: 8 }}>{label(SERVICE_TYPE_LABELS, s.serviceType, "en")} · {s.area}, {s.city} · {s.contact}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button type="button" onClick={() => onApproveService(s.id)} style={{ flex: 1, background: "#E8F2EE", color: "#2F6E5D", border: "1px solid rgba(47,110,93,0.3)", borderRadius: 8, padding: "7px", fontSize: 12.5, fontWeight: 700 }}>{t("approveBtn")}</button>
                          <button type="button" onClick={() => onRejectService(s.id)} style={{ flex: 1, background: "#FBEAE7", color: "#B23A2E", border: "1px solid rgba(178,58,46,0.3)", borderRadius: 8, padding: "7px", fontSize: 12.5, fontWeight: 700 }}>{t("rejectBtn")}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {adminTab === "all" && (
              <>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#5C5646", margin: "0 0 8px" }}>{t("tabAllListings")} ({listings.length})</h3>
                {listings.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: "#9C8F78", marginBottom: 16 }}>{t("noPendingListings")}</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                    {listings.map((l) => {
                      const status = l.status || "approved";
                      return (
                        <div key={l.id} style={{ background: "#fff", borderRadius: 12, padding: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{l.title}</div>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: status === "approved" ? "#E8F2EE" : "#FBEADD", color: status === "approved" ? "#2F6E5D" : "#9A5A16" }}>
                              {status === "approved" ? t("statusLive") : t("statusPending")}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "#7A7261", marginBottom: 8 }}>{l.area}, {l.city} · ₹{l.rent} · {l.contact}</div>
                          <button type="button" onClick={() => onTakeDownListing(l.id)} style={{ width: "100%", background: "#FBEAE7", color: "#B23A2E", border: "1px solid rgba(178,58,46,0.3)", borderRadius: 8, padding: "7px", fontSize: 12.5, fontWeight: 700 }}>{t("takeDownBtn")}</button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#5C5646", margin: "0 0 8px" }}>{t("tabServices")} ({services.length})</h3>
                {services.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: "#9C8F78" }}>{t("noServicesYet")}</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {services.map((s) => {
                      const status = s.status || "approved";
                      return (
                        <div key={s.id} style={{ background: "#fff", borderRadius: 12, padding: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: status === "approved" ? "#E8F2EE" : "#FBEADD", color: status === "approved" ? "#2F6E5D" : "#9A5A16" }}>
                              {status === "approved" ? t("statusLive") : t("statusPending")}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "#7A7261", marginBottom: 8 }}>{label(SERVICE_TYPE_LABELS, s.serviceType, "en")} · {s.area}, {s.city} · {s.contact}</div>
                          <button type="button" onClick={() => onTakeDownService(s.id)} style={{ width: "100%", background: "#FBEAE7", color: "#B23A2E", border: "1px solid rgba(178,58,46,0.3)", borderRadius: 8, padding: "7px", fontSize: 12.5, fontWeight: 700 }}>{t("takeDownBtn")}</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {adminTab === "settings" && (
              <div>
                <div style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 14 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#5C5646", margin: "0 0 8px" }}>{t("storageUsageLabel")}</h3>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#1B2A4A", margin: "0 0 4px" }}>
                    {totalDocs} <span style={{ fontSize: 13, fontWeight: 500 }}>{t("totalRecordsLabel")}</span>
                  </p>
                  <p style={{ fontSize: 11.5, color: "#7A7261", margin: 0, lineHeight: 1.5 }}>{t("storageShardNote")}</p>
                </div>

                <button
                  type="button"
                  onClick={onExport}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", background: "#fff", border: "1px solid #E5DDC8", borderRadius: 10, padding: "10px", fontSize: 12.5, color: "#1B2A4A", fontWeight: 700, marginBottom: 14 }}
                >
                  ⬇ {t("exportDataBtn")}
                </button>

                <div style={{ background: "#fff", borderRadius: 14, padding: 14 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#5C5646", margin: "0 0 8px" }}>{t("changePasscodeLabel")}</h3>
                  <input
                    type="password"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="e.g. 4321"
                    maxLength={8}
                    style={{ ...inputStyle, marginBottom: 8 }}
                  />
                  {passcodeMsg && <p style={{ fontSize: 12, color: passcodeMsg.startsWith("✓") ? "#2F6E5D" : "#B23A2E", margin: "0 0 8px" }}>{passcodeMsg}</p>}
                  <button type="button" onClick={onChangePasscode} style={{ width: "100%", padding: "10px", background: "#1B2A4A", color: "#F0D9A0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                    {t("savePasscodeBtn")}
                  </button>
                  <p style={{ fontSize: 10.5, color: "#B8AC90", margin: "8px 0 0", lineHeight: 1.4 }}>{t("passcodeWarning")}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TermsModal({ onClose, t }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 className="display" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{t("termsTitle")}</h2>
          <button type="button" onClick={onClose} style={{ background: "#EFE8D6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, fontSize: 12.5, color: "#5C5646", lineHeight: 1.7 }}>
          <p style={{ marginTop: 0 }}>{t("termsIntro")}</p>
          <p><strong>{t("termsPoint1Title")}</strong><br />{t("termsPoint1Body")}</p>
          <p><strong>{t("termsPoint2Title")}</strong><br />{t("termsPoint2Body")}</p>
          <p><strong>{t("termsPoint3Title")}</strong><br />{t("termsPoint3Body")}</p>
          <p style={{ marginBottom: 0 }}><strong>{t("termsPoint4Title")}</strong><br />{t("termsPoint4Body")}</p>
        </div>
      </div>
    </div>
  );
}

function ListingCard({ listing, onReport, t, lang }) {
  const images = listing.images?.length ? listing.images : (listing.imageUrl ? [{ id: "legacy", url: listing.imageUrl, label: null }] : []);
  const [active, setActive] = useState(0);
  const [reported, setReported] = useState(false);
  const current = images[active];

  const ageDays = Math.floor((Date.now() - (listing.postedAt || Date.now())) / 86400000);

  const mapQuery = encodeURIComponent(`${listing.area}, ${listing.city}, Maharashtra`);
  const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="card" style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 18px rgba(27,42,74,0.10)", border: "1px solid #EFE8D6", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #E8672B, #C9A34E)", zIndex: 1 }} />
      {listing.verified && (
        <div style={{ position: "absolute", top: 9, right: 9, zIndex: 2, display: "flex", alignItems: "center", gap: 4, background: "rgba(47,110,93,0.92)", color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "4px 9px", borderRadius: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
          <ShieldCheck size={12} /> {t("verifiedBadge")}
        </div>
      )}
      {current ? (
        <div>
          <div style={{ position: "relative" }}>
            <img src={current.url} alt={current.label || listing.title} style={{ width: "100%", height: 170, objectFit: "cover", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
            {current.label && (
              <span className="mono" style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(27,42,74,0.82)", color: "#F0D9A0", fontSize: 10.5, padding: "3px 8px", borderRadius: 6, fontWeight: 600, letterSpacing: "0.02em", border: "1px solid rgba(201,163,78,0.4)" }}>
                {current.label.toUpperCase()}
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 6, padding: "8px 10px", overflowX: "auto", background: "#FAF6EC" }}>
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActive(i)}
                  style={{
                    flexShrink: 0, width: 46, height: 46, borderRadius: 8, overflow: "hidden", padding: 0,
                    border: i === active ? "2px solid #C9A34E" : "2px solid transparent", background: "none",
                  }}
                >
                  <img src={img.url} alt={img.label || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ width: "100%", height: 100, background: "#F1ECDD", display: "flex", alignItems: "center", justifyContent: "center", color: "#B8AC90" }}>
          <ImageOff size={22} />
        </div>
      )}
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <h3 className="display" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{listing.title}</h3>
            <a
              href={mapOpenUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("openInMaps")}
              title={t("openInMaps")}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#B8873A", fontSize: 13, marginTop: 3, textDecoration: "none", fontWeight: 500 }}
            >
              <MapPin size={13} /> {listing.area}, {listing.city}
              <ExternalLink size={11} style={{ marginLeft: 1, opacity: 0.7 }} />
            </a>
          </div>
          <div className="mono" style={{ background: "linear-gradient(135deg, #FBEADD, #F6E3C4)", color: "#9A5A16", padding: "6px 10px", borderRadius: 8, fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", display: "flex", alignItems: "center", border: "1px solid rgba(201,163,78,0.35)" }}>
            <IndianRupee size={13} />{listing.rent}<span style={{ fontSize: 10, fontWeight: 500, marginLeft: 2 }}>{t("perMonth")}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          <Tag icon={Home} text={label(PROPERTY_TYPE_LABELS, listing.propertyType || "Room", lang)} />
          {(listing.propertyType || "Room") === "Room" && <Tag icon={Home} text={label(ROOM_TYPE_LABELS, listing.roomType, lang)} />}
          <Tag icon={Sofa} text={label(FURNISHING_LABELS, listing.furnishing, lang)} />
          {(listing.propertyType || "Room") === "Room" && (
            <Tag icon={Users} text={label(GENDER_LABELS, listing.genderPref || "Any", lang)} />
          )}
        </div>

        {listing.amenities?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {listing.amenities.map((id) => {
              const a = AMENITIES.find((x) => x.id === id);
              if (!a) return null;
              const Icon = a.icon;
              return (
                <span key={id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#2F6E5D", background: "#E8F2EE", padding: "3px 8px", borderRadius: 20 }}>
                  <Icon size={11} /> {a.label[lang] || a.label.hi}
                </span>
              );
            })}
          </div>
        )}

        {listing.description && (
          <p style={{ fontSize: 13, color: "#5C5646", margin: "10px 0 0", lineHeight: 1.5 }}>{listing.description}</p>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <CallButton contact={listing.contact} flex t={t} />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `${listing.title}\n📍 ${listing.area}, ${listing.city}\n💰 ₹${listing.rent}/month\n${listing.propertyType || "Room"}${listing.roomType ? " · " + listing.roomType : ""}\n📞 ${listing.contact}\n\nvia Room Wala`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: 46, display: "flex", alignItems: "center", justifyContent: "center",
              background: "#E8F2EE", color: "#2F6E5D", borderRadius: 10, border: "1px solid rgba(47,110,93,0.25)", flexShrink: 0,
            }}
            aria-label={t("shareWhatsapp")}
          >
            <Share2 size={17} />
          </a>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          {ageDays > 30 ? (
            <span style={{ fontSize: 10.5, color: "#B8873A", fontWeight: 600 }}>⏱ {t("staleWarning")}</span>
          ) : <span />}
          {reported ? (
            <span style={{ fontSize: 11, color: "#7A7261" }}>{t("reportedThanks")}</span>
          ) : (
            <button
              type="button"
              onClick={() => { onReport?.(listing.id); setReported(true); }}
              style={{ background: "none", border: "none", color: "#9C8F78", fontSize: 11, textDecoration: "underline", padding: 0 }}
            >
              🚩 {t("reportListing")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Tag({ icon: Icon, text }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "#1B2A4A", background: "#F1ECDD", padding: "4px 9px", borderRadius: 20, fontWeight: 500 }}>
      <Icon size={12} /> {text}
    </span>
  );
}

function PostForm({ form, setForm, toggleAmenity, onSubmit, saving, formError, onPhotoSelect, onPhotoRemove, photoBusy, t, lang }) {
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={onSubmit} style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 2px 10px rgba(27,42,74,0.06)" }}>
      <h2 className="display" style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 14 }}>{t("postFormTitle")}</h2>

      <Field label={t("labelPropertyType")}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PROPERTY_TYPES.map((p) => {
            const active = form.propertyType === p;
            return (
              <button
                type="button"
                key={p}
                onClick={() => setForm((f) => ({ ...f, propertyType: p }))}
                className="chip"
                style={{
                  fontSize: 13, padding: "8px 14px", borderRadius: 20,
                  border: active ? "1.5px solid #E8672B" : "1.5px solid #E5DDC8",
                  background: active ? "#FBEADD" : "#fff", color: active ? "#B94E15" : "#5C5646", fontWeight: 600,
                }}
              >
                {label(PROPERTY_TYPE_LABELS, p, lang)}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label={t("labelTitle")}>
        <input value={form.title} onChange={set("title")} placeholder="e.g. Sunny single room near college" style={inputStyle} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label={t("labelCity")}>
          <select value={form.city} onChange={set("city")} style={inputStyle}>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label={t("labelArea")}>
          <input value={form.area} onChange={set("area")} placeholder="e.g. Sadar" style={inputStyle} />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label={t("labelRent")}>
          <input type="number" value={form.rent} onChange={set("rent")} placeholder="e.g. 6000" style={inputStyle} />
        </Field>
        {form.propertyType === "Room" && (
          <Field label={t("labelRoomType")}>
            <select value={form.roomType} onChange={set("roomType")} style={inputStyle}>
              {ROOM_TYPES.map((r) => <option key={r} value={r}>{label(ROOM_TYPE_LABELS, r, lang)}</option>)}
            </select>
          </Field>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: form.propertyType === "Room" ? "1fr 1fr" : "1fr", gap: 10 }}>
        <Field label={t("labelFurnishing")}>
          <select value={form.furnishing} onChange={set("furnishing")} style={inputStyle}>
            {FURNISHING.map((f) => <option key={f} value={f}>{label(FURNISHING_LABELS, f, lang)}</option>)}
          </select>
        </Field>
        {form.propertyType === "Room" && (
          <Field label={t("labelGenderPref")}>
            <select value={form.genderPref} onChange={set("genderPref")} style={inputStyle}>
              {GENDER_PREFS.map((g) => <option key={g} value={g}>{label(GENDER_LABELS, g, lang)}</option>)}
            </select>
          </Field>
        )}
      </div>

      <Field label={t("labelAmenities")}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {AMENITIES.map((a) => {
            const Icon = a.icon;
            const active = form.amenities.includes(a.id);
            return (
              <button
                type="button"
                key={a.id}
                onClick={() => toggleAmenity(a.id)}
                className="chip"
                style={{
                  display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, padding: "7px 11px", borderRadius: 20,
                  border: active ? "1.5px solid #E8672B" : "1.5px solid #E5DDC8",
                  background: active ? "#FBEADD" : "#fff", color: active ? "#B94E15" : "#5C5646", fontWeight: 500,
                }}
              >
                <Icon size={13} /> {a.label[lang] || a.label.hi}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label={t("labelContact")}>
        <input value={form.contact} onChange={set("contact")} placeholder="e.g. 9876543210" style={inputStyle} />
      </Field>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#EAF4EF", border: "1px solid rgba(47,110,93,0.25)", borderRadius: 10, padding: "10px 12px", marginBottom: 12, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={form.verified}
          onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))}
          style={{ marginTop: 2 }}
        />
        <span style={{ fontSize: 12.5, color: "#1F4A3D", lineHeight: 1.4 }}>
          <strong>{t("verifyCheckboxTitle")}</strong> — {t("verifyCheckboxDesc")}
        </span>
      </label>

      <Field label={t("labelDescription")}>
        <textarea value={form.description} onChange={set("description")} placeholder="Kuch aur bataana ho toh..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      </Field>

      <Field label={t("labelPhotos")}>
        {form.images.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {form.images.map((img) => (
              <div key={img.id} style={{ position: "relative", width: 78 }}>
                <img src={img.url} alt={img.label} style={{ width: 78, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #E5DDC8", display: "block" }} />
                <span className="mono" style={{ display: "block", fontSize: 9.5, textAlign: "center", color: "#7A7261", marginTop: 2 }}>{img.label}</span>
                <button
                  type="button"
                  onClick={() => onPhotoRemove(img.id)}
                  style={{ position: "absolute", top: -6, right: -6, background: "#1B2A4A", color: "#fff", border: "2px solid #fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}
                  aria-label={`${img.label} photo hatao`}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {getPhotoCategories(form).map((cat) => (
            <div
              key={cat}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                border: "1.5px dashed #D8CCAE", borderRadius: 10, padding: "8px 10px",
                background: "#FBF8F0", opacity: photoBusy ? 0.6 : 1,
              }}
            >
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "#5C5646" }}>{cat}</span>

              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: "#B94E15", background: "#FBEADD", border: "1px solid rgba(232,103,43,0.3)", borderRadius: 8, padding: "6px 9px", cursor: photoBusy ? "default" : "pointer" }}>
                <Camera size={13} /> Camera
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={photoBusy}
                  onChange={(e) => { onPhotoSelect(e.target.files?.[0], cat); e.target.value = ""; }}
                  style={{ display: "none" }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: "#1B2A4A", background: "#EDEFF6", border: "1px solid rgba(27,42,74,0.15)", borderRadius: 8, padding: "6px 9px", cursor: photoBusy ? "default" : "pointer" }}>
                <ImageIcon size={13} /> Gallery
                <input
                  type="file"
                  accept="image/*"
                  disabled={photoBusy}
                  onChange={(e) => { onPhotoSelect(e.target.files?.[0], cat); e.target.value = ""; }}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          ))}
        </div>
        {photoBusy && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: "#7A7261", fontSize: 12 }}>
            <Loader2 size={13} className="animate-spin" /> Photo process ho rahi hai...
          </div>
        )}
        <p style={{ fontSize: 11, color: "#9C8F78", margin: "8px 0 0" }}>
          Note: is preview window me "Camera" button browser ki security ki wajah se kaam na kare toh "Gallery" use karo — jab app real phone browser me khulegi tab Camera bhi seedha khulega.
        </p>
      </Field>

      {formError && <p style={{ color: "#B23A2E", fontSize: 13, margin: "4px 0 12px" }}>{formError}</p>}

      <p style={{ fontSize: 11.5, color: "#9C8F78", margin: "0 0 14px" }}>
        Ye listing sabko dikhegi jo is app ko use karte hain.
      </p>

      <button
        type="submit"
        disabled={saving}
        style={{
          width: "100%", padding: "12px", background: "#E8672B", color: "#fff", border: "none", borderRadius: 10,
          fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? <><Loader2 size={16} className="animate-spin" /> {t("savingButton")}</> : t("submitButton")}
      </button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#5C5646", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E5DDC8", fontSize: 14, background: "#fff", color: "#1B2A4A" };
