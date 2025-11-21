# Pocket Paralegal ⚖️
**Protecting users from predatory contracts using privacy-first, on-device AI.**

> **Submission for the Arm AI Developer Challenge 2025**
> * **Team:** Omer
> * **Device Target:** Android/iOS (Arm64)
> * **Model:** Llama 3.2 (Quantized via ExecuTorch)

---

## 1. Project Overview
**Pocket Paralegal** is an offline mobile application that empowers everyday users to understand complex legal documents instantly. Users can scan any contract, rental agreement, or Terms of Service using their phone camera, and the app identifies "red flags" (predatory clauses, hidden fees, data privacy risks) in simple, plain English.

### What makes this project unique?:
* **Privacy First:** Legal documents are sensitive. Unlike cloud-based AI, Pocket Paralegal processes everything **100% locally** on the device. No data ever leaves the user's phone[cite: 41].
* **Optimized for Arm:** We utilize the efficiency of Arm architecture to run a Large Language Model (LLM) on a mobile processor without draining the battery or requiring an internet connection.

---

## 2. Functionality & Key Features
This project demonstrates a complete "Vision-to-Insight" pipeline running entirely on the edge.

* **Instant OCR:** Uses on-device Optical Character Recognition to convert physical paper documents into digital text in milliseconds.
* **Local Intelligence:** Powered by **Llama 3.2 (1B/3B)** running via **ExecuTorch**.
* **Context Injection:** Leverages the massive context window of modern SLMs (Small Language Models) to analyze up to 10 pages of text instantly without the need for complex fine-tuning.
* **Risk Highlighting:** Parses legal jargon and outputs a structured "Risk Report" identifying the top 3 dangers in the document.

---

## 3. Technological Implementation
*Judging Criteria: Does the project thoroughly leverage Arm architecture?*

We built this project to showcase the power of the **Arm v9 architecture** and its NPU/CPU capabilities.

### The Stack:
* **Framework:** React Native (Expo Development Build)
* **Inference Engine:** Meta **ExecuTorch** (PyTorch Edge)
* **Backend:** **XNNPACK Delegate** (Highly optimized for Arm NEON/SVE instructions)
* **Model:** Llama 3.2 1B Instruct (Quantized to 4-bit for mobile efficiency)
* **Vision:** Google ML Kit (On-device Text Recognition v2)

### Optimization Strategy:
To ensure smooth performance on mobile:
1. **Quantization:** We compressed the model weights to 4-bit integer precision, reducing memory usage significantly while maintaining reasoning accuracy.
2. **Thread Management:** Inference runs on background threads to keep the UI (60fps) smooth during analysis.

---

## 4. Setup Instructions
*Judging Criteria: Step-by-step instructions on how to build and run the project.*

**Prerequisites:**
* Node.js & npm
* Android Studio (for Android Emulator/Device) or Xcode (for iOS)
* A physical Arm-based mobile device is recommended for performance testing.

**Installation:**

1.  **Clone the repository:**
    ```bash
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Prepare the Prebuild (Required for ExecuTorch C++ bindings):**
    ```bash
    npx expo prebuild
    ```

4.  **Run on Device:**
    Connect your device via USB and run:
    ```bash
    npx expo run:android
    # OR
    npx expo run:ios
    ```

*Note: The first launch may take a few minutes to compile the native ExecuTorch binaries.*

---

## 5. User Experience (UX)
*Judging Criteria: Is the design well thought out? Can a user understand what to do?*

We designed for **Simplicity and Speed**:
1.  **One-Tap Workflow:** The user opens the app and sees one big button: "Scan Contract."
2.  **Visual Feedback:** While the AI "thinks," we provide clear status updates so the user is never left wondering.
3.  **Actionable Results:** We don't just dump text; we provide a structured list of risks with clear "Why this matters" explanations.

---

## 6. Potential Impact
*Judging Criteria: Is the source code useful for other projects to build upon?*

This repository serves as a **template** for any developer wanting to build "Vision + LLM" apps on mobile. By open-sourcing this implementation, we provide:
* A working example of integrating **ExecuTorch with React Native**.
* A pattern for **Context Injection** on mobile devices.
* A blueprint for privacy-sensitive AI applications in healthcare, finance, or law.

---

## 7. The "WOW" Factor
*Judging Criteria: Does the application surprise the user with its capabilities?*

* **It works in Airplane Mode!** The biggest "magic trick" of Pocket Paralegal is turning off Wi-Fi and data, scanning a complex legal document, and watching the AI dissect it in seconds. It proves that **high-level intelligence no longer requires the cloud**.

---

### 🎥 Demo Video
NOTE FOR ME: PUT DEMO VIDEO LINK HERE

### 📄 License
MIT License - Free for the community to use and build upon.