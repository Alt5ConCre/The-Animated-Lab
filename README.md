# The Animated Lab - Luxury Watch Landing Page

A high-end, interactive, and visually immersive website for a luxury watch brand. This project demonstrates cutting-edge web development techniques, featuring advanced scroll-based animations, 3D elements, and a modern aesthetic inspired by premium product showcases.

## 🌟 Key Features

- **Immersive Hero Section**: A 240-frame scroll-scrubbing image sequence animation that smoothly rotates and inspects the watch as the user scrolls.
- **Scroll-Triggered Animations**: Smooth, high-performance reveal and parallax animations powered by GSAP and Framer Motion.
- **3D Renderings**: Interactive 3D elements and dynamic lighting using Three.js and React Three Fiber.
- **Sticky Layouts**: Robust CSS-based sticky stacking for seamless transitions between sections (Horological Art, Movement, Specs).
- **Responsive Design**: Carefully crafted to look flawless across all device sizes.
- **Modern Minimalist UI**: Clean typography, glassmorphism, and a sophisticated dark/light balance.

## 🛠️ Languages & Technologies

This project is built with the modern React ecosystem, utilizing the latest tools for maximum performance and visual fidelity:

- **[Next.js](https://nextjs.org/) (v16)**: The core React framework for routing, optimization, and server-side rendering.
- **[React](https://react.dev/) (v19)**: The foundational UI library.
- **[GSAP](https://gsap.com/) (v3)**: Used for precise, timeline-based scroll animations (via `@gsap/react`).
- **[Framer Motion](https://www.framer.com/motion/)**: Handles declarative micro-interactions, page transitions, and UI state animations.
- **[Three.js](https://threejs.org/)**: The underlying 3D graphics engine.
- **[React Three Fiber & Drei](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)**: For seamlessly integrating Three.js within React components, providing advanced 3D shaders and tools.
- **Vanilla CSS**: Clean, scalable, modular styling without relying on external UI frameworks.
- **[Lucide React](https://lucide.dev/)**: Beautiful, consistent iconography.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Code-By-Nithin/The-Animated-Lab.git
   ```
2. Navigate to the project directory:
   ```bash
   cd The-Animated-Lab
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the website in action.

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router (Pages, Layouts, Globals)
└── components/           # Reusable UI React Components
    ├── Hero.jsx          # Scroll-scrubbing 240-frame sequence
    ├── ProductShowcase.jsx
    ├── TechnicalSpecs.jsx
    ├── FeaturesGallery.jsx
    ├── Movement.jsx
    ├── SocialProof.jsx
    ├── Craftsmanship.jsx
    └── ...
public/                   # Static assets (3D models, textures, gallery images)
```

## ✨ Design Philosophy

The focus of this architecture is to blur the line between a traditional website and a cinematic experience. By combining high-framerate scroll-linked sequences with true 3D contexts and meticulously optimized React components, the user is given a seamless, "weightless" journey through the hallmarks of high horology.

## Preview Gallery

<img width="1408" height="768" alt="Website Preview" src="https://github.com/user-attachments/assets/42338ddc-7224-4c78-8d45-2211b7429a2e" />
