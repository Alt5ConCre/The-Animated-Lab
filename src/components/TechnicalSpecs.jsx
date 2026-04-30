'use client';

import { Settings, Droplets, Maximize, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './TechnicalSpecs.module.css';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function TechnicalSpecs() {
  return (
    <section className={styles.specsSection}>
      <div className={styles.container}>
        
        {/* Left: The Story */}
        <motion.div 
          className={styles.storyCol}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={`${styles.sectionTitle} gold-gradient`}>A Century of Swiss Horology</h2>
          <p className={styles.storyText}>
            Inspired by vintage aviation and maritime navigation instruments, our luxury mechanical watch collection strips away the unnecessary to reveal pure, high-performance functionality. Engineered for the modern collector.
          </p>
          <p className={styles.storyText}>
            The moment you clasp it onto your wrist, you feel the unmistakable weight of Swiss surgical-grade 316L steel. It asserts a profound wrist presence—substantial, commanding, yet elegantly refined as the premier choice in luxury mechanical chronometers.
          </p>
        </motion.div>

        {/* Right: Technical Specs Grid */}
        <motion.div 
          className={styles.specsGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className={styles.specItem} variants={itemVariants}>
            <Settings className={styles.specIcon} size={32} strokeWidth={1.5} />
            <div>
              <div className={styles.specLabel}>Movement</div>
              <div className={styles.specValue}>Caliber X-400 <br/>(28,800 vph)</div>
            </div>
          </motion.div>

          <motion.div className={styles.specItem} variants={itemVariants}>
            <Maximize className={styles.specIcon} size={32} strokeWidth={1.5} />
            <div>
              <div className={styles.specLabel}>Glass</div>
              <div className={styles.specValue}>Domed Sapphire<br/>(9 Mohs)</div>
            </div>
          </motion.div>

          <motion.div className={styles.specItem} variants={itemVariants}>
            <Droplets className={styles.specIcon} size={32} strokeWidth={1.5} />
            <div>
              <div className={styles.specLabel}>Resistance</div>
              <div className={styles.specValue}>100 ATM<br/>(1000 Meters)</div>
            </div>
          </motion.div>

          <motion.div className={styles.specItem} variants={itemVariants}>
            <Box className={styles.specIcon} size={32} strokeWidth={1.5} />
            <div>
              <div className={styles.specLabel}>Case Material</div>
              <div className={styles.specValue}>316L Surgical<br/>Grade Alloy</div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
