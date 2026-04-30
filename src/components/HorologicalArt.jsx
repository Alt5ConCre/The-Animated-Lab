'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ArtPanel.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function HorologicalArt() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        }
      });

      tl.fromTo(imgRef.current, 
        { x: -100, opacity: 0, scale: 0.9 }, 
        { x: 0, opacity: 1, scale: 1, duration: 1.5 }
      );

      tl.fromTo(textRef.current, 
        { x: 100, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1.5 }, 
        0.5
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.artSection}>
      <div className={styles.container}>
        <div ref={imgRef} className={styles.imgWrapper}>
          <img 
            src="/gallery/hand_assembly_1774892421162.png" 
            alt="Macro Hand Finishing" 
            className={styles.macroShot} 
          />
          <div className={styles.shadowOverlay} />
        </div>
        
        <div ref={textRef} className={styles.textContent}>
          <span className={styles.label}>CONCEPT 01</span>
          <h2 className={`${styles.title} gold-gradient`}>HIGH-END HOROLOGY</h2>
          <p className={styles.description}>
            A hyper-realistic study of luxury mechanical craftsmanship. 
            We embrace the Chiaroscuro technique, where deep obsidian shadows set the stage for the sharp, hand-polished edges of our signature surgical-grade 316L steel components. Every micro-gear tells a story of pure Swiss dedication.
          </p>
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <strong>CRAFTSMANSHIP</strong>
              <span>85mm Macro Precision</span>
            </div>
            <div className={styles.featureItem}>
              <strong>HERITAGE</strong>
              <span>Swiss Mechanical Continuity</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
