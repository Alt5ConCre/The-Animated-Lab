'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './FeaturesGallery.module.css';

const features = [
  {
    id: 1,
    title: "Proprietary Sapphire Crystal",
    description: "Flawless optics. Nearly diamond-hard and impervious to scratches, offering unobstructed clarity to the chronometer dial.",
    image: "/gallery/sapphire_crystal_1774892174424.png",
    className: styles.item1
  },
  {
    id: 2,
    title: "100 ATM Water Resistance",
    description: "Engineered to withstand the intense pressure of deep oceanic descents with a sealed helium escape valve.",
    image: "/gallery/water_resistance_1774892359401.png",
    className: styles.item2
  },
  {
    id: 3,
    title: "Swiss Master Assembly",
    description: "Every mechanical micro-component is placed with absolute scrutiny by our heritage Swiss watchmakers.",
    image: "/gallery/hand_assembly_1774892421162.png",
    className: styles.item3
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.25, 1, 0.5, 1] 
    } 
  }
};

export default function FeaturesGallery() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className={styles.container}>
      <h2 className={`${styles.heading} gold-gradient`}>Uncompromising Features</h2>
      
      <motion.div 
        ref={ref}
        className={styles.bentoGrid}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {features.map((feature) => (
          <motion.div 
            key={feature.id} 
            className={`${styles.bentoItem} ${feature.className}`}
            variants={cardVariants}
          >
            <div className={styles.imageWrapper}>
              <img src={feature.image} alt={feature.title} className={styles.bgImage} />
            </div>
            <div className={styles.overlay}></div>
            <div className={styles.glowEffect}></div>
            <div className={styles.content}>
              <h3 className={`${styles.itemTitle} gold-text`}>{feature.title}</h3>
              <p className={styles.itemDesc}>{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
