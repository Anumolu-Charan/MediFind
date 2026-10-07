# 💊 MediFind — Medicine Availability Finder

> **Find medicines. Find nearby pharmacies. Check availability faster.**

MediFind is a full-stack healthcare web application designed to help patients find nearby pharmacies and hospital pharmacies that may have a required medicine in stock.

It combines **location-aware pharmacy discovery, medicine inventory data, real-time inventory updates, authentication, and AI-powered search assistance** into one platform.

> ⚠️ **Medical Disclaimer:** MediFind is an availability/discovery platform. It does not provide medical diagnosis, prescriptions, dosage recommendations, or emergency medical advice.

---

## 🚀 Why MediFind?

Finding a medicine can be frustrating when patients have to call or visit multiple pharmacies just to check availability.

MediFind simplifies the process:

**Search medicine → Detect location → Find nearby pharmacies → Check stock → Get directions/contact pharmacy**

Pharmacy staff can also manage their inventory so medicine availability can be updated for patients.

---

## ✨ Features

### 👤 Patient Features

- 🔍 Search medicines by name
- 🤖 AI-assisted medicine search
- 📍 Browser-based location detection
- 🗺️ Nearby pharmacy discovery
- 💊 Medicine availability checking
- 🟢 In Stock / 🟡 Low Stock / 🔴 Out of Stock indicators
- 📏 Distance-aware pharmacy results
- 🏪 Pharmacy directory
- 📞 Pharmacy contact information
- 🧭 Google Maps directions
- 🔐 User authentication
- ⚡ Real-time inventory updates
- 📱 Responsive mobile-friendly interface

### 🏪 Pharmacy Features

- 🔐 Pharmacy authentication
- 📦 Inventory management
- ➕ Add medicines
- ✏️ Update stock quantities
- 🗑️ Remove inventory
- 📊 View inventory status
- ⚡ Real-time inventory updates
- 🔒 Protected inventory operations

### 🛠️ Admin Features

- 📊 Application statistics
- 👥 User information
- 🏪 Pharmacy information
- 💊 Medicine information
- 📦 Inventory overview
- 🤖 AI search activity
- 📈 Stock breakdown

---

# 🤖 AI-Powered Search

MediFind uses Google's Gemini API to understand natural-language medicine searches.

For example:

> "I need Dolo 650 near me"

The AI can identify relevant medicine terms and convert the request into a structured search intent.

### AI Safety

The AI component is designed for search/discovery assistance only.

It should **not**:

- Diagnose diseases
- Recommend prescriptions
- Recommend medicine dosage
- Replace a doctor or pharmacist
- Provide emergency medical treatment

AI responses are validated before being used by the application.

---

# 📍 Location & Pharmacy Discovery

MediFind uses the user's browser location when permission is granted.

Google Maps/Places services are used for pharmacy/place discovery and location-related functionality.

### Important

**Google Maps does not provide medicine stock information.**

MediFind combines:

```text
Google Maps / Places
        ↓
Nearby pharmacy discovery

Supabase Inventory
        ↓
Medicine availability

Supabase Realtime
        ↓
Live inventory updates
