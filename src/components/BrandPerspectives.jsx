'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './BrandPerspectives.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function BrandPerspectives() {
  const wrapperRef = useRef(null); // The outer scroll volume
  const pinRef = useRef(null);     // The element to be pinned
  const scrollRef = useRef(null);  // The horizontal moving part
  const trailRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      
      const horizontalLength = 200; // Moving -200vw total for 3 panels

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: pinRef.current, // Pin the inner element, not the root
          anticipatePin: 1,
        }
      });

      // Horizontal Translation
      tl.to(scrollRef.current, {
        x: `-${horizontalLength}vw`,
        ease: "none"
      });

      // Light Trail Animation in the Movement Panel
      if (trailRef.current) {
        gsap.to(trailRef.current, {
          strokeDashoffset: 0,
          repeat: -1,
          duration: 3,
          ease: "linear",
          scrollTrigger: {
            trigger: trailRef.current,
            start: "left center",
            containerAnimation: tl, // Synchronize with horizontal scroll
          }
        });
      }

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrapperRef} className={styles.perspectivesWrapper}>
      <div ref={pinRef} className={styles.stickyContainer}>
        <div ref={scrollRef} className={styles.horizontalScroll}>
        
        {/* Concept 1: Horological Art */}
        <div className={`${styles.panel} ${styles.artPanel}`}>
          <div className={styles.artContent}>
            <div className={styles.artText}>
              <span className={styles.conceptLabel}>Concept 01</span>
              <h2 className={`${styles.conceptTitle} gold-gradient`}>Horological <br/>Art</h2>
              <p className={styles.conceptDesc}>
                A hyper-realistic, cinematic close-up of luxury mechanical horology. 
                Focusing on the Chiaroscuro technique, where deep shadows meet 
                the sharp highlights of hand-polished 316L steel.
              </p>
            </div>
            <img 
              src="/gallery/hand_assembly_1774892421162.png" 
              alt="Horological Craftsmanship" 
              className={styles.macroShot} 
            />
          </div>
        </div>

        {/* Concept 2: Modern Executive */}
        <div className={`${styles.panel} ${styles.executivePanel}`}>
          <div className={styles.skylineBg} />
          <div className={styles.executiveContent}>
            <span className={styles.conceptLabel}>Concept 02</span>
            <h2 className={`${styles.conceptTitle} gold-gradient`}>Modern <br/>Executive</h2>
            <img 
              src="/gallery/watch_blue_1774971730098.png" 
              alt="Executive Blue Dial" 
              className={styles.lifestyleWatch} 
            />
            <p className={styles.conceptDesc} style={{ maxWidth: '600px', margin: '0 auto' }}>
              Designed for the boardroom and the global horizon. 
              A sleek, modern silver aesthetic with a deep sunray blue dial—built 
              for the professional who moves across time zones with effortless precision.
            </p>
          </div>
        </div>

        {/* Concept 3: Abstract Movement */}
        <div className={`${styles.panel} ${styles.movementPanel}`}>
          <div className={styles.trailLayer}>
             <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none">
               <path 
                 ref={trailRef}
                 d="M-100,500 C200,300 400,700 600,500 C800,300 1100,600 1300,500" 
                 stroke="rgba(212, 175, 55, 0.3)" 
                 strokeWidth="2" 
                 strokeDasharray="1000" 
                 strokeDashoffset="1000"
               />
             </svg>
          </div>
          <div className={styles.movementContent}>
            <span className={styles.conceptLabel}>Concept 03</span>
            <h2 className={`${styles.conceptTitle} gold-gradient`}>Abstract <br/>Movement</h2>
            <img 
              src="/gallery/watch_black_1774971796223.png" 
              alt="Futuristic Movement" 
              className={styles.floatingWatch} 
            />
            <p className={styles.conceptDesc} style={{ marginTop: '2rem', maxWidth: '500px', textAlign: 'center' }}>
              The watch floating in the void of time. 
              Surrounded by abstract light trails representing the relentless 
              speed and futuristic energy of our flagship mechanical calibers.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
}
