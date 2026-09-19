# LOKIVA — Transactional Realism & Pass Engine Architecture

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-03-TXN-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Approved Transactional & Pass Engine Blueprint  

---

# 1. Purpose & Transactional Strategy

In a competitive hackathon finale, presentation realism dictates jury perception. Live payment gateways (Razorpay, Stripe) frequently fail during stage demonstrations due to banking 2FA SMS latency or merchant test account blocks.

LOKIVA solves this with **Deterministic Transactional Realism**:
1. An authentic **dynamic UPI QR code** generated on the fly adhering to NPCI (National Payments Corporation of India) URI specifications.
2. Simulated instant one-click payment webhooks for **Google Pay**, **PhonePe**, and **Paytm**.
3. A verifiable, printable **cryptographic digital ticket pass** equipped with `@media print` styling.

---

# 2. Dynamic UPI QR Specification

The QR code generator encodes a standard NPCI intent payload:
```text
upi://pay?pa=lokiva.artisan@icici&pn=Lokiva%20Cultural%20Experiences&am={AMOUNT}&tr={ORDER_ID}&tn=WorkshopPass-{VENUE_ID}&cu=INR
```

* `pa`: Payee VPA (Virtual Payment Address).
* `pn`: Payee Verified Merchant Name.
* `am`: Order Amount in Indian Rupees.
* `tr`: Unique Transaction Reference Hash.
* `tn`: Narrative Note detailing venue and workshop identifier.

---

# 3. Cryptographic Pass Engine & Print Protocol

### 3.1 Pass Layout Specifications
* **Dimensions:** Standard voucher format ($85\text{mm} \times 150\text{mm}$ or responsive card).
* **QR Code Density:** High-contrast SVG QR code (Error correction level `H` - 30% recovery).
* **Display Fields:**
  - Ticket ID (`LOK-2026-IND-XXXX`)
  - Traveler Name (`Piyush Kumar`)
  - Experience Title & City (`Raja Ghat, Varanasi`)
  - Admission Date & Validity Window
  - Mandatory Cultural Etiquette Reminders

### 3.2 Print Media Stylesheet (`@media print`)
```css
@media print {
  body * {
    visibility: hidden;
  }
  .printable-ticket-pass, .printable-ticket-pass * {
    visibility: visible;
  }
  .printable-ticket-pass {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px;
    box-shadow: none !important;
    border: 2px solid #000 !important;
    background: #FFF !important;
    color: #000 !important;
  }
  .no-print {
    display: none !important;
  }
}
```

---

<div align="center">
  <sub>DOC-03-TXN-001 · LOKIVA Transactional & Pass Architecture</sub>
</div>
