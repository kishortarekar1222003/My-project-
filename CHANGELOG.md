# Room Wala — Kya Badla (Changelog)

Ye document dikhata hai ki kaunsi cheez **pehle** kaisi thi aur **ab** kaisi hai —
dono round of changes ke saath: (A) State→District→Taluka cascading dropdowns,
aur (B) Real Phone-OTP login + Owner Dashboard + Save feature.

---

## 🅰️ Round 1 — Cascading Location (State → District → Taluka)

### 1. City field ab free-text nahi, real dropdown hai

**Pehle:**
```jsx
<Field label={t("labelCity")}>
  <input list="city-suggestions" value={form.city} onChange={set("city")} placeholder="e.g. Nagpur" />
</Field>
```
Sirf ek chhoti hardcoded list thi (`CITY_SUGGESTIONS`) — Nagpur, Bhandara, Sakoli, waghera 24 shehar — baaki sab free-typing.

**Ab:**
```jsx
<Field label={t("labelDistrict")}>
  {getDistricts(form.state).length > 0 ? (
    <select value={form.city} onChange={...}>
      {getDistricts(form.state).map((d) => <option key={d} value={d}>{d}</option>)}
    </select>
  ) : (
    <input value={form.city} onChange={set("city")} />
  )}
</Field>
{getTalukas(form.state, form.city).length > 0 && (
  <Field label={t("labelTaluka")}>
    <select>...</select>
  </Field>
)}
```
Ek naya `INDIA_LOCATIONS` object bana — Maharashtra ke saare 36 districts +
har district ke saare talukas (Nagpur ke 14, Bhandara ke 6, waghera), aur baaki
27 states + UTs ke districts. State badalte hi District aur Taluka dono reset
ho jaate hain.

### 2. Photo verification jud gaya
```js
function isValidImageUrl(url) {
  return url.startsWith("data:image/") || url.startsWith("http://") || url.startsWith("https://");
}
```
Broken photo pe ab silent-hide nahi, "📷 Photo unavailable" placeholder dikhta hai.

### 3. Filters aur Google Maps link — Taluka bhi include karte hain
Browse-tab filter me ab teesra dropdown hai (Taluka), aur "Open in Maps" link
me area + taluka + city + state sab jud ke jaate hain (pehle sirf area+city+Maharashtra
hardcoded tha).

---

## 🅱️ Round 2 — Real Phone-OTP Login + Owner Dashboard + Save

### 1. PIN system poora hata diya, real login aaya

**Pehle** — koi bhi bina login ke listing daal sakta tha, ek random 4-digit
PIN milta tha edit/delete ke liye:
```js
async function submitListing(e) {
  ...
  const pin = genPin(); // random 4-digit
  await addItem("listings", { ...rest, status: "pending", pin, ... });
  setLastPin(pin);
  setPosted(true);
}
```

**Ab** — login zaroori hai, listing tumhare real phone number (uid) se link hoti hai:
```js
async function submitListing(e) {
  e.preventDefault();
  setFormError("");
  if (!authUser) {
    setLoginOpen(true);   // pehle login karwao
    return;
  }
  ...
  await addItem("listings", {
    ...rest,
    status: "pending",
    ownerId: authUser.uid,
    ownerPhone: authUser.phoneNumber || "",
    ...
  });
}
```

### 2. "Manage My Listing" (contact+PIN dhoondo) → "Mera Dashboard" (real login)

**Pehle:**
```js
function findMyListings() {
  const matches = listings.filter(
    (l) => l.contact.endsWith(manageContact.slice(-10)) && l.pin === managePin.trim()
  );
  setManageResults(matches);
}
```
Koi bhi tumhara contact number + guess kiya hua PIN daal ke tumhari listing
dhoondh/delete kar sakta tha agar PIN leak ho jaye.

**Ab:**
```js
useEffect(() => {
  if (!authUser) return;
  const u1 = subscribeMyItems("listings", authUser.uid, setMyListings);
  const u2 = subscribeMyItems("services", authUser.uid, setMyServices);
  const u3 = subscribeSavedIds(authUser.uid, setSavedIds);
  return () => { u1(); u2(); u3(); };
}, [authUser]);
```
Sirf tumhara authenticated phone number hi tumhari listings dekh/delete/renew
kar sakta hai — Firestore rules level pe enforce hota hai, sirf app ki UI pe nahi.

### 3. Naya — Save/Bookmark ❤️ button

Har listing card pe ab ek heart-button hai:
```jsx
<button onClick={() => onToggleSave?.(listing.id)}>
  <Heart fill={saved ? "#B8873A" : "none"} />
</button>
```
Login zaroori hai save karne ke liye; saved listings "Mera Dashboard → Saved"
tab me dikhti hain.

### 4. Firestore Security Rules — collection name bug fix + real ownership

**Pehle** (bug: rules `room_listings` collection check karti thi, lekin app
`listings` collection use karta tha — matlab ye rules kabhi lagu hi nahi ho rahi thi):
```
match /room_listings/{id} {
  allow update, delete: if request.auth != null
                && (resource.data.ownerId == request.auth.uid || isAdmin());
}
```

**Ab** (naam fix + granular permissions — anonymous log bhi view/call count
badha sakte hain, par review/report/edit ke liye login zaroori hai):
```
match /listings/{id} {
  allow read: if true;
  allow create: if request.auth != null && ownerId == request.auth.uid && status == "pending";
  allow update: if request.auth != null && (resource.data.ownerId == request.auth.uid || isAdmin());
  allow update: if onlyChanged(['views']);       // anonymous bhi
  allow update: if onlyChanged(['callClicks']);  // anonymous bhi
  allow update: if request.auth != null && onlyChanged(['reviews']);
  allow update: if request.auth != null && onlyChanged(['status', 'reported']);
  allow delete: if request.auth != null && (resource.data.ownerId == request.auth.uid || isAdmin());
}
```

### 5. Header me naya profile icon

Header me admin-shield icon ke bagal ek naya 👤 icon add hua — logged-in ho to
Dashboard kholta hai, nahi to Login modal kholta hai.

---

## 📁 Files jo badle

| File | Kya hua |
|---|---|
| `src/App.jsx` | Sab UI changes — cascading dropdowns, login/OTP flow, dashboard, save button |
| `src/authService.js` | **Naya file** — Firebase Phone-Auth wrapper (sendOtp/verifyOtp/signOut) |
| `src/dataService.js` | `subscribeMyItems`, `subscribeSavedIds`, `toggleSavedListing` functions add hue |
| `firestore.rules` | Collection-name bug fix + granular field-level permissions |
| `storage.rules` | Koi change nahi (pehle se hi auth-checked tha) |
| `README.md` | Naye setup steps — Blaze plan, Phone-Auth enable karna, admin UID set karna |

---

## 🔮 Ab se aage

Is project me ab **git** initialize kar diya hai (`roomwala-app/.git`), matlab
agla koi bhi change maangoge to main real `git diff` dikha sakta hoon — exact
line-by-line before/after, bina hath se likhe. Ye document is turn tak ke
changes ka manual summary hai kyunki usse pehle koi version-tracking nahi thi.
