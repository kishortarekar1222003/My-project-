# Room Wala — Deployment Guide

Ye ek real, deployable website hai (Nagpur & Bhandara room/shop/ghar rental
platform) jo Firebase ko backend ki tarah use karta hai — real Phone-OTP
login, database, aur cloud photo storage sab included. Neeche step-by-step
guide hai — koi coding knowledge nahi chahiye, bas ye steps follow karo.

## Step 1 — Firebase Project Banao (5 minute)

1. [console.firebase.google.com](https://console.firebase.google.com) kholo, Google account se login karo
2. **"Add project"** → naam do (e.g. `room-wala`) → Continue → Google Analytics **skip/off** kar sakte ho → **Create project**
3. Left sidebar me **Build → Firestore Database** → **Create database** → **"Start in production mode"** chuno (test mode nahi — rules hum khud lagayenge) → apne se paas ka region chuno (e.g. asia-south1 Mumbai) → Enable
4. Left sidebar me **Build → Storage** → **Get started** → **"Start in production mode"** → same region → Done
5. Gear icon (⚙️) → **Project settings** → neeche scroll karo **"Your apps"** tak → `</>` (Web) icon pe click karo → app ka naam do (e.g. `room-wala-web`) → **Register app**
6. Ab tumhe ek code block dikhega jisme `firebaseConfig = {...}` hai — **ye poora object copy karo**

## Step 2 — Config Paste Karo

`src/firebase.js` file kholo is project me, aur `firebaseConfig` object ko apne copy kiye hue se replace karo.

## Step 3 — Phone Login (OTP) Enable Karo — ZAROORI

App me ab **real phone-number login** hai (Register → OTP → listing post karo → apna
dashboard dekho). Isko chalane ke liye:

1. Left sidebar me **Build → Authentication** → **Get started**
2. **Sign-in method** tab → **Phone** provider chuno → **Enable** karo → Save
3. **⚠️ Billing account lagana padega:** Phone/SMS OTP Firebase ka koi bhi free
   plan cover nahi karta — chahe kitna bhi kam use ho. Project Settings → Usage
   and billing → **"Blaze (Pay as you go)"** plan pe upgrade karo (isme card
   details lagti hain, lekin sirf jitna use utna hi charge hota hai).
   Firestore aur Storage ka free quota Blaze pe bhi wahi rehta hai — sirf SMS
   OTP alag se charge hota hai, roughly ₹0.5–1 per OTP (India ke liye). Shuru
   me kam users honge, toh bill $0–2/month ke aas-paas hi rahega.
4. (Testing ke liye) Authentication → Sign-in method → neeche **Phone numbers
   for testing** me apna number + ek fixed OTP (e.g. `123456`) add kar sakte ho
   — isse real SMS bina bheje bhi login test kar sakte ho, bina koi charge ke.

## Step 4 — Security Rules Lagao (ZAROORI — isse skip mat karna)

Is project ke andar `firestore.rules` aur `storage.rules` files already ban chuki hain —
inhe copy-paste karna hai:

1. Firebase Console → **Firestore Database → Rules** tab → is project ke
   `firestore.rules` file ka poora content paste karo → **Publish**
2. Firebase Console → **Storage → Rules** tab → is project ke `storage.rules`
   file ka poora content paste karo → **Publish**

**Apna Admin account set karo** (bina isske approve/reject/feature jaisa
moderation kaam nahi karega):
1. Pehle apni website chalao (Step 6 dekho) aur khud apne phone number se
   ek baar login karo (OTP se)
2. Firebase Console → **Authentication → Users** tab → apna number dhoondo →
   uske aage wala **User UID** copy karo
3. `firestore.rules` file me `PASTE_YOUR_ADMIN_UID_HERE` ko is UID se replace
   karo → dubara Firestore Rules tab me paste → **Publish**

Ab sirf tumhara account hi listings approve/reject/feature/delete kar sakta
hai — admin passcode (Settings me) sirf ek UI-level gate hai, real security
ye rules hi dete hain.

## Step 5 — Local Test Karo

```
npm install
npm run dev
```
Browser me `http://localhost:5173` khulega — yahan test karo:
Register → OTP → listing post karo → photos upload karo → "Mera Dashboard"
me apni listing dikhti hai → dusre browser/incognito se search karke save +
call + review kar ke dekho.

## Step 6 — Real Website Pe Deploy Karo (Firebase Hosting — free)

```
npm install -g firebase-tools
firebase login
firebase init hosting
```
Jab poocha jaye:
- "Use an existing project" → apna project chuno
- Public directory → `dist` likho
- Single-page app → **Yes**
- Overwrite index.html → **No**

Phir:
```
npm run build
firebase deploy
```

Terminal me ek **real URL** milega jaise `https://room-wala.web.app` — ye link
kisi ko bhi bhejo, koi bhi apne phone/computer pe khol sakta hai. Koi Claude
account nahi chahiye.

> **Phone-OTP sirf real domain pe reliably kaam karta hai** (reCAPTCHA ki wajah
> se) — isliye login ko poori tarah test karna ho toh Step 6 ke baad deployed
> URL pe test karna best hai, sirf `localhost` pe nahi.

## Step 7 — App Jaisa Install Karo (PWA)

Website already PWA-ready hai. Jab koi bhi ye site apne phone pe khole
(Chrome/Safari), unhe **"Add to Home Screen"** ka option milega — tap karte hi
icon phone pe aa jaata hai aur app ki tarah khulta hai (full screen, no browser bar).

**Note:** `public/` folder me abhi sirf ek basic SVG icon hai. Real
`icon-192.png` aur `icon-512.png` (aur `apple-touch-icon.png`) banwa ke
`public/` folder me daal do — koi bhi free online "PNG icon generator" se apna
logo se banwa sakte ho.

## Naya User Flow

```
Register (phone number) → OTP verify → Login ho gaya
   ↓
Listing post karo / Local Service add karo (login zaroori)
   ↓
Photos upload → Admin moderation (pending → approved)
   ↓
Listing live ho jaati hai, kisi ko bhi dikhti hai
   ↓
Koi doosra phone browse/search kare (login zaroori nahi)
   ↓
Listing save (❤️) kare (login zaroori) / Owner ko call kare / WhatsApp share kare
   ↓
Review de (login zaroori)
   ↓
Poster apna "Mera Dashboard" khole — apni listings, services, aur saved
listings sab ek jagah, views/calls ka data bhi dikhta hai
```

## Kya Same Raha, Kya Badla

- ✅ **Same**: poora UI, design, photos, admin panel, cascading state/district/taluka dropdowns, language toggle — sab wahi hai
- 🔄 **Badla**: purana 4-digit PIN system hata diya gaya — ab **real phone-OTP
  login** hai. Listing edit/delete/renew ab apne login se "Mera Dashboard" me
  hota hai, PIN yaad rakhne ki zaroorat nahi
- 🆕 **Naya**: **Save/Bookmark** feature — koi bhi listing ❤️ button se save
  kar sakta hai, apne Dashboard ke "Saved" tab me dekh sakta hai
- 🆕 **Naya**: **Firestore security rules** ab real auth se linked hain — sirf
  owner apni listing edit kar sakta hai, sirf real admin account moderate kar
  sakta hai (Step 4 dekho)
- 🔄 **Same as before**: data Firebase me store hota hai (practically
  unlimited), real-time sync hota hai, photos real Storage URLs hain
