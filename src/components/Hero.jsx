'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Hero.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const feature1Ref = useRef(null);
  const feature2Ref = useRef(null);
  const feature3Ref = useRef(null);
  const titleRef = useRef(null);
  
  const imagesRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const frameCount = 240;

  // Preloading in batches to prevent browser lockup and slow loading
  useEffect(() => {
    let active = true;
    const batchSize = 20;

    const loadImages = async () => {
      for (let i = 0; i < frameCount; i += batchSize) {
        if (!active) break;
        
        const promises = [];
        for (let j = 0; j < batchSize && (i + j) < frameCount; j++) {
          promises.push(new Promise((resolve) => {
            const img = new Image();
            const frameNum = (i + j + 1).toString().padStart(3, '0');
            img.src = `/gallery/herosection/ezgif-frame-${frameNum}.png`;
            img.onload = () => {
              imagesRef.current[i + j] = img;
              resolve();
            };
            img.onerror = resolve; // Continue even if one fails
          }));
        }
        
        await Promise.all(promises);
        
        if (!active) break;

        // Unlock UI after first batch natively
        if (i === 0) {
          setIsLoaded(true);
        }
      }
    };

    loadImages();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || imagesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    // Canvas Resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(0); // Render first frame after resize
    };

    const renderFrame = (index) => {
      const img = imagesRef.current[index];
      if (img && img.complete && img.naturalWidth !== 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Center image in canvas (Contain fit)
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        
        context.drawImage(img, x, y, img.width * scale, img.height * scale);
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let ctx = gsap.context(() => {
      const frameObj = { frame: 0 };

      // Unified Timeline for perfect synchronization while pinned
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=3000", // Distance to scroll
          scrub: 0.1, // Slight delay for smooth 'Apple' feel
          pin: true,  // Pins the section, prevents gap below
          anticipatePin: 1
        }
      });

      // Scrubbing Watch frames against timeline duration (0 to 100)
      tl.to(frameObj, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        onUpdate: () => renderFrame(Math.round(frameObj.frame)),
        duration: 100
      }, 0);

      // Background Title Entrance/Fade (0-20%)
      tl.fromTo(titleRef.current, 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 0.1, duration: 20 },
        0
      );

      // Feature 1 Segment (15% - 45%)
      tl.to(feature1Ref.current, { opacity: 1, y: 0, duration: 10 }, 15);
      tl.to(feature1Ref.current, { opacity: 0, y: -20, duration: 10 }, 35);

      // Feature 2 Segment (40% - 70%)
      tl.to(feature2Ref.current, { opacity: 1, y: 0, duration: 10 }, 40);
      tl.to(feature2Ref.current, { opacity: 0, y: -20, duration: 10 }, 60);

      // Feature 3 Segment (75% - 100%)
      tl.to(feature3Ref.current, { opacity: 1, y: 0, duration: 15 }, 75);

    }, containerRef);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ctx.revert();
    };
  }, [isLoaded]); // Only run setup ONCE when initial load is done

  return (
    <section ref={containerRef} className={styles.heroWrapper} suppressHydrationWarning>
      <div className={styles.stickyContainer}>
        
        {/* Loading Overlay */}
        {!isLoaded && <div className="loading-bar gold-gradient" style={{ height: '2px', position: 'fixed', top: 0, width: '100vw' }} />}

        <h1 ref={titleRef} className={styles.heroTitle}>XENITH</h1>

        <canvas ref={canvasRef} className={styles.canvas} />

        <div className={styles.textOverlay}>
          
          <div ref={feature1Ref} className={`${styles.featureBox} ${styles.f1}`}>
            <span className={styles.featureLabel}>Refinement</span>
            <p className={styles.featureText}>Surgical Grade 316L Steel. <br/>Master-Polished Angles.</p>
          </div>

          <div ref={feature2Ref} className={`${styles.featureBox} ${styles.f2}`}>
            <span className={styles.featureLabel}>Engine</span>
            <p className={styles.featureText}>Swiss Automatic Caliber. <br/>Infinite Kinetic Energy.</p>
          </div>

          <div ref={feature3Ref} className={`${styles.featureBox} ${styles.f3}`}>
            <span className={styles.featureLabel}>Resilience</span>
            <p className={styles.featureText}>Scratch-Proof Sapphire. <br/>Unobstructed Clarity.</p>
          </div>

        </div>

        <div className={styles.scrollIndicator}>EXPLORE PERFECTION</div>

      </div>
    </section>
  );
}
