# Room Wala — Deployment Guide

Ye ek real, deployable website hai (Nagpur & Bhandara room/shop/ghar rental
platform) jo Firebase ko backend ki tarah use karta hai. Neeche step-by-step
guide hai — koi coding knowledge nahi chahiye, bas ye steps follow karo.

## Step 1 — Firebase Project Banao (5 minute)

1. [console.firebase.google.com](https://console.firebase.google.com) kholo, Google account se login karo
2. **"Add project"** → naam do (e.g. `room-wala`) → Continue → Google Analytics **skip/off** kar sakte ho → **Create project**
3. Left sidebar me **Build → Firestore Database** → **Create database** → **"Start in test mode"** chuno → apne se paas ka region चुनो (e.g. asia-south1 Mumbai) → Enable
4. Left sidebar me **Build → Storage** → **Get started** → **"Start in test mode"** → same region → Done
5. Gear icon (⚙️) → **Project settings** → neeche scroll karo **"Your apps"** tak → `</>` (Web) icon pe click karo → app ka naam do (e.g. `room-wala-web`) → **Register app**
6. Ab tumhe ek code block dikhega jisme `firebaseConfig = {...}` hai — **ye poora object copy karo**

## Step 2 — Config Paste Karo

`src/firebase.js` file kholo is project me, aur `firebaseConfig` object ko apne copy kiye hue se replace karo.

## Step 3 — Security Rules Lagao (ZAROORI — isse skip mat karna)

"Test mode" 30 din baad khud expire ho jaata hai aur database band ho jaata hai — permanent rules lagana zaroori hai.

**Firestore rules** (Firestore Database → Rules tab me paste karo):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /listings/{id} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['title','area','city','contact','rent']);
      allow update, delete: if true;
    }
    match /services/{id} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['name','area','city','contact']);
      allow update, delete: if true;
    }
    match /settings/{id} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

**Storage rules** (Storage → Rules tab me paste karo):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /listings/{listingId}/{fileName} {
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

> ⚠️ Ye rules abhi **kisi ko bhi** likhne dete hain (koi login system nahi hai,
> jaisa artifact version me tha). Isse spam ka risk hai. Real launch se pehle
> Firebase Authentication (phone OTP) add karke rules ko tighten karna best hai
> — agar ye chahiye toh bata dena, main add kar dunga.

## Step 4 — Local Test Karo

```
npm install
npm run dev
```
Browser me `http://localhost:5173` khulega — yahan test karo sab kaam kar raha hai ya nahi.

## Step 5 — Real Website Pe Deploy Karo (Firebase Hosting — free)

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

## Step 6 — App Jaisa Install Karo (PWA)

Website already PWA-ready hai. Jab koi bhi ye site apne phone pe khole
(Chrome/Safari), unhe **"Add to Home Screen"** ka option milega — tap karte hi
icon phone pe aa jaata hai aur app ki tarah khulta hai (full screen, no browser bar).

**Note:** `public/` folder me abhi sirf ek basic SVG icon hai. Real
`icon-192.png` aur `icon-512.png` (aur `apple-touch-icon.png`) banwa ke
`public/` folder me daal do — koi bhi free online "PNG icon generator" se apna
logo se banwa sakte ho.

## Kya Same Raha, Kya Badla

- ✅ **Same**: poora UI, design, photos, PIN system, admin panel, language toggle — sab wahi hai
- 🔄 **Badla**: data ab Firebase me store hota hai (practically unlimited, koi 5MB limit nahi), aur **real-time hai** — matlab agar 2 log ek saath app khole hain, dono ko turant naye listings dikhengi bina refresh kiye
- 🔄 **Badla**: photos ab base64 ki jagah **real Storage URLs** hain — faster load, kam data use
