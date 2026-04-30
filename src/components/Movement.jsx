'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import styles from './Movement.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Movement() {
  const sectionRef = useRef(null);
  const gear1Ref = useRef(null);
  const gear2Ref = useRef(null);
  const gear3Ref = useRef(null);
  const caseRef = useRef(null);
  const textRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  // Motion values for the digital counter
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, 28800, { duration: 2, ease: "easeOut" });
      return controls.stop;
    } else {
      count.set(0); // Reset when out of view
    }
  }, [isInView, count]);

  useEffect(() => {
    // ScrollTrigger to fade out the case overlay
    gsap.to(caseRef.current, {
      opacity: 0,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "center center",
        scrub: true,
      }
    });

    // Reveal text
    gsap.fromTo(textRef.current, 
      { opacity: 0, x: -50 },
      { 
        opacity: 1, 
        x: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "10% center",
          end: "40% center",
          scrub: true,
          onEnter: () => setIsInView(true),
          onLeaveBack: () => setIsInView(false)
        }
      }
    );

    // Gear rotation tied to scroll
    gsap.to(gear1Ref.current, {
      rotate: 360,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      }
    });

    gsap.to(gear2Ref.current, {
      rotate: -720,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
      }
    });

    gsap.to(gear3Ref.current, {
      rotate: 540,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      }
    });

  }, []);

  return (
    <section ref={sectionRef} className={styles.movementSection}>
      <div className={styles.stickyContainer}>
        
        <div ref={textRef} className={styles.textOverlay}>
          <h2 className={`${styles.title} gold-gradient`}>Swiss Heartbeat</h2>
          <div className={styles.frequencyContainer}>
            <motion.span className={styles.counter}>{rounded}</motion.span>
            <span className={styles.unit}>VPH</span>
          </div>
          <p className={styles.description}>
            Witness the internal caliber of our luxury masterpiece. 
            Meticulously crafted gears beating at an ultra-high frequency, 
            driven purely by kinetic energy and supreme horological engineering.
            No batteries. No compromise. Just pure mechanical soul.
          </p>
        </div>

        <div className={styles.gearContainer}>
          <div ref={caseRef} className={styles.caseOverlay}></div>
          <div className={styles.gearGroup}>
            <div ref={gear1Ref} className={`${styles.gear} ${styles.gear1}`}></div>
            <div ref={gear2Ref} className={`${styles.gear} ${styles.gear2}`}></div>
            <div ref={gear3Ref} className={`${styles.gear} ${styles.gear3}`}></div>
          </div>
        </div>

      </div>
    </section>
  );
}
