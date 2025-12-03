# Pocket Paralegal
**Protecting users from predatory contracts using privacy-first, on-device AI.**

> Built for the Arm AI Developer Challenge 2025

## Project Overview
**Pocket Paralegal** is a mobile application that allows everyday users to understand legal documents instantly. Users can upload any contract, rental agreement, or Terms of Service, and the app identifies "red flags" (predatory clauses, hidden fees, data privacy risks) in simple, plain English. No legal expertise required.

### What makes this project unique?:
* **Everything runs locally on your phone.** Your sensitive documents never touch the internet, all data stays on your local device. No data ever leaves your phone.
* **Optimised for Arm:** This project utilises the efficiency of Arm architecture to run a Large Language Model (LLM) on a mobile processor without excessively draining the battery or requiring an internet connection.

## Functionality & Key Features

1. **Instant OCR:** Uses on-device Optical Character Recognition to convert physical paper documents into digital text in milliseconds.
2. **Local Intelligence:** Powered by **Llama 3.2 (1B/3B)** running through **ExecuTorch**.
3. **Context Injection:** Leverages the massive context window of modern SLMs (Small Language Models) to analyse up to 10 pages of text instantly without the need for complex fine-tuning.
4. **Document Analysis:** Get a report of the document, including a summary, warnings for undesirable clauses, and suggestions for clarifications.

### How it works

1. **Capture image or upload file** any contract or agreement.
2. **Wait a few seconds** while the AI processes document locally.
3. **Get a simple breakdown** get a summary of the document, along with warnings for anything wrong with the contract, and any clarifications that is required.

No accounts, uploads, or cloud required.

## Why I built it this way

Legal documents are personal. I didn't want to build something that ships your rental agreement or employment contract to some server. So everything including the text recognition, the AI analysis, all of it happens on your device.

This only works because modern phones are very powerful. The app runs a real language model (Llama 3.2) directly on the phone's processor using Meta's ExecuTorch framework.

## Setup Instructions

**Prerequisites:**
* Node.js & npm
* Expo CLI (`npm install -g expo-cli`)
* Android Studio (for Android Emulator/Device) or Xcode (for iOS)
* A physical Arm-based mobile device is recommended for performance testing.

**Installation:**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/OmerZKol/Pocket-Paralegal
    cd PocketParalegal
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Prepare the Prebuild (Required for ExecuTorch):**
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

5. **First Launch:**
* On first launch, the app will prompt you to download an AI model (~50-500MB depending on the model)
* Ensure you have a stable internet connection for the initial model download
* Models are cached on device after the first download, so subsequent launches will not require internet access.

**Extra**
1. If you want, you can compile the project into an apk/ipa for distribution or use. Use the following commands for a *locally built production version*:
    ```bash
    eas build --platform android --profile production --local
    # OR
    eas build --platform ios --profile production --local
    ```

---

### Demo Video
https://www.youtube.com/watch?v=oGZQVHRlc38

### License
MIT License - Free for the community to use and build upon.