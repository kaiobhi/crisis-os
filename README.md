# Crisis OS

A community crisis-response platform designed to help people prepare, navigate, and recover when normal communication infrastructure is disrupted.

## 🚨 What It Does

Crisis OS provides a simple interface for people during emergencies:

* **I'm Safe** — quickly communicate your status
* **I Need Help** — report urgent needs and location
* **Find Safety** — get situation-specific emergency guidance
* **SOS** — quickly trigger an emergency request
* **Emergency Contacts** — access important contacts
* **Community Snapshot** — understand the overall situation
* **Recovery Mode** — manage post-crisis recovery tasks


Major Features:

## 📡 Offline-First Design

A major focus of Crisis OS is communication when internet or cellular networks are unavailable.

The prototype demonstrates a **store-and-forward** model where emergency reports can be stored locally and conceptually relayed between nearby devices until they reach a connected coordinator.

In a real implementation, this peer-to-peer layer could use technologies such as Bluetooth Low Energy or Wi-Fi Direct, and falling back to SMS based communication as a last resort.

> Note: Peer-to-peer communication is simulated in this prototype. The current web application does not establish real Bluetooth mesh communication.

## 🔋 Battery-Aware Communication

Emergency communication should not drain the user's phone when power is limited.

The system is designed around battery-aware behavior, reducing background communication as battery levels fall while prioritizing critical emergency information.

## 🛠️ Tech Stack

* React
* Vite
* JavaScript
* Lucide React
* CSS

## ▶️ Running Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

## 🎯 IMPORTANT

Crisis OS is a prototype demonstrating how communities could coordinate during disasters even when conventional communication infrastructure becomes unreliable.

The goal is to keep emergency interaction **fast, simple, and usable under stress**.

Project Demo Images: 
1) The main application to be used by the person in the disaster
<img width="1434" height="909" alt="image" src="https://github.com/user-attachments/assets/636c7bb3-d641-4238-93f8-fd8f6242b833" />
<img width="1411" height="904" alt="image" src="https://github.com/user-attachments/assets/9c99ad9c-0a2a-4df0-b5c6-4e06d4ca41f1" />
<img width="1416" height="911" alt="image" src="https://github.com/user-attachments/assets/a7eede67-9e42-46a1-95e4-9e3c63e693a4" />
<img width="1399" height="885" alt="image" src="https://github.com/user-attachments/assets/38c5cb7f-4af1-4ce3-b9b9-54983b0278bb" />


2) The interface for the people managing rescue operations
<img width="1424" height="903" alt="image" src="https://github.com/user-attachments/assets/04626e84-f9fe-4525-a6ca-6bb6e9f962d6" />
<img width="1382" height="896" alt="image" src="https://github.com/user-attachments/assets/85bbe374-d80c-4c8d-9585-5d142bce0c25" />

3) A simple Checklist for disaster victims on what to do next
<img width="1395" height="889" alt="image" src="https://github.com/user-attachments/assets/693b71a8-3e24-48ee-9ea1-6b751376afc9" />




