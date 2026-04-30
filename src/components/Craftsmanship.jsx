'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Craftsmanship.module.css';

const tabs = [
  {
    id: "vision",
    title: "01. Engineering Vision",
    text: "Every Xenith luxury mechanical watch begins as an uncompromising blueprint. We source only aerospace-grade materials, combining surgical 316L steel with proprietary sapphire compounds to pioneer the future of high-end horology.",
    image: "/gallery/sapphire_crystal_1774892174424.png"
  },
  {
    id: "precision",
    title: "02. Micro-Precision",
    text: "Our Swiss automatic movements undergo 400 hours of master assembly. A singular aesthetic flows through each caliber, ensuring that every gear, spring, and rotor contributes to sub-second chronometer perfection.",
    image: "/gallery/hand_assembly_1774892421162.png"
  },
  {
    id: "eternity",
    title: "03. Infinite Durability",
    text: "Designed to be an heirloom, each casing is pressure-sealed in our Geneva laboratory. The resulting 100 ATM resilience guarantees that your mechanical diver is virtually invincible in the most extreme aquatic environments.",
    image: "/gallery/water_resistance_1774892359401.png"
  }
];

export default function Craftsmanship() {
  const [activeTab, setActiveTab] = useState(0);

  // Auto-run timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length);
    }, 5000); // 5 seconds per tab
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.craftsmanshipSection}>
      
      {/* Background Images */}
      <div className={styles.bgWrapper}>
        {tabs.map((tab, idx) => (
          <img 
            key={tab.id}
            src={tab.image} 
            alt={tab.title} 
            className={`${styles.bgImage} ${idx === activeTab ? styles.active : ''}`}
          />
        ))}
      </div>

      <div className={styles.container}>
        
        {/* Tab Navigation */}
        <div className={styles.tabBar}>
          {tabs.map((tab, idx) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(idx)}
              className={`${styles.tab} ${idx === activeTab ? styles.active : ''}`}
            >
              {tab.title.split(' ')[0]} {/* 01, 02, 03 */}
              {idx === activeTab && <span className={styles.progressBar}></span>}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className={styles.contentArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h2 className={`${styles.title} gold-gradient`}>
                {tabs[activeTab].title}
              </h2>
              <p className={styles.text}>
                {tabs[activeTab].text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
