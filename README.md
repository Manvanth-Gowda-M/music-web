# ಸ್ವರ ಲೋಕ (Swara Loka) • Kannada Ambient Music Worlds

> *"Choose a world. Put on your music. Stay there."*

A digital listening environment centered around **Kannada music**, immersive environmental themes, cinematic looping 4K background video cinemagraphs, and a theme-adaptive Web Audio API visualizer engine.

---

## 🌟 Ambient Worlds

| # | World | Kannada Title | Atmosphere & Mood | Visualizer Style |
|---|---|---|---|---|
| **01** | **Rainy Konkan Journey** | **ಮಳೆ ರೈಲು** | Western Ghats rain train window, mist, green canopy (`primary.mp4`) | **Rain Rivulets**: Falling frequency raindrops with blue water tips & amber window glow |
| **02** | **Temple Morning** | **ದೇವಾಲಯದ ಬೆಳಗು** | Sacred dawn stone temple, morning oil lamps, jasmine, camphor (`temple_scene.mp4`) | **Temple Mandala Aura**: Harmonic resonance waves with floating golden diya embers |
| **03** | **Coastal Morning** | **ಕರಾವಳಿ ಮುಂಜಾನೆ** | Arabian Sea coastline sunrise, ocean tides, solitude (`beach.mp4`) | **Coastal Tides**: 3-layered sinusoidal azure & slate ocean surf with crest foam |
| **04** | **Vintage KSRTC Express** | **ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ರಾತ್ರಿ ಬಸ್** | Classic vintage red bus night highway cruising (`bus.mp4`) | **Night Wiper Sweep**: Dynamic sweeping wiper arc with warm sunset orange pulses |
| **05** | **Rainy Highway Bus Ride** | **ಮಳೆ ಹೆದ್ದಾರಿ ಬಸ್** | Red KSRTC 1080p rain highway cruising (`Bus_driving_in_rain.mp4`) | **Night Wiper Sweep**: Dynamic sweeping wiper arc with amber headlight pulses |

---

## 🎵 Features & Architecture

- **45+ Evergreen & Trending Kannada Library**: Curated masterpieces across all 5 worlds (Sonu Nigam, Shreya Ghoshal, SPB, S. Janaki, Pt. Bhimsen Joshi, Vijay Prakash, C. Ashwath, Ajaneesh Loknath).
- **Direct 160kbps AAC Streaming**: Direct streaming endpoints with high-resolution 500x500 album artworks and Kannada typography metadata.
- **Live Search Endpoint**: Search and stream tens of thousands of Kannada tracks, artists, and movie OSTs on-demand.
- **3-Second Cinematic Auto-Fade**: Smoothly reveals evocative Kannada typography and tagline upon world entry before fading out after 3.0 seconds to leave 100% unobstructed full-screen video.
- **Independent Ambient Environmental Audio**: Real-time synthesized rain on window, train tracks, ocean surf, and temple drones.
- **Mobile & Auto Desktop Mode**: Touch-first mobile bottom sheets with dynamic viewport height (`100dvh`), safe-area insets, and automatic Desktop Site Viewport scaler (`width=1100`).
- **Interactive Full Player & Queue Management**: Full-screen player with lyrics view, queue reordering, and favorites bookmarking stored in `localStorage`.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server-side API Routes)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Audio Engine**: Native Web Audio API + HTML5 Audio Element
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Google Fonts (*Noto Sans Kannada*, *Anek Kannada*, *Plus Jakarta Sans*, *Playfair Display*)

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/Manvanth-Gowda-M/music-web.git
cd music-web
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 📄 License
MIT License • Created with ❤️ for Kannada Music.
