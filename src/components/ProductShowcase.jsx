'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ProductShowcase.module.css';

const watchData = {
  blue: {
    id: 'blue',
    name: 'Sunray Blue',
    image: '/gallery/watch_blue_1774971730098.png',
    colorHex: '#1e3a5f'
  },
  black: {
    id: 'black',
    name: 'Matte Black',
    image: '/gallery/watch_black_1774971796223.png',
    colorHex: '#111111'
  },
  green: {
    id: 'green',
    name: 'Forest Green',
    image: '/gallery/watch_green_1774972201138.png',
    colorHex: '#2b442b'
  }
};

export default function ProductShowcase() {
  const [activeSeries, setActiveSeries] = useState('Automatic');
  const [activeColor, setActiveColor] = useState('blue');
  const [activeStrap, setActiveStrap] = useState('Bracelet');

  const currentWatch = watchData[activeColor];

  return (
    <section className={styles.showcaseSection}>
      <div className={styles.container}>
        
        {/* Left: Dynamic Watch Image using Framer Motion AnimatePresence for smooth swaps */}
        <div className={styles.imageCol}>
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentWatch.id}
              src={currentWatch.image}
              alt={`Xenith ${currentWatch.name}`}
              className={styles.watchImage}
              initial={{ opacity: 0, x: -30, filter: 'blur(5px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 30, filter: 'blur(5px)' }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </AnimatePresence>
        </div>

        {/* Right: Selectors & Cart */}
        <div className={styles.contentCol}>
          
          {/* Context Picker */}
          <div className={styles.contextPicker}>
            {['Automatic', 'Chronograph', 'Limited Edition'].map(series => (
              <button 
                key={series}
                className={`${styles.seriesTab} ${activeSeries === series ? styles.active : ''}`}
                onClick={() => setActiveSeries(series)}
                suppressHydrationWarning
              >
                {series}
              </button>
            ))}
          </div>

          <div>
            <h2 className={`${styles.title} gold-gradient`}>XENITH <i>{activeSeries}</i></h2>
            <p className={styles.description}>
              The absolute pinnacle of luxury Swiss watchmaking. Engineered with an exhibition case back and 100 ATM depth resistance. Secure your automatic chronometer today.
            </p>
          </div>

          {/* Color Selection */}
          <div className={styles.variationGroup}>
            <span className={styles.variationLabel}>Dial: {currentWatch.name}</span>
            <div className={styles.swatches}>
              {Object.keys(watchData).map(key => (
                <button 
                  key={key}
                  className={`${styles.swatchBtn} ${activeColor === key ? styles.active : ''}`}
                  style={{ backgroundColor: watchData[key].colorHex }}
                  onClick={() => setActiveColor(key)}
                  aria-label={watchData[key].name}
                  suppressHydrationWarning
                />
              ))}
            </div>
          </div>

          {/* Strap Selection */}
          <div className={styles.variationGroup}>
            <span className={styles.variationLabel}>Strap Option</span>
            <div className={styles.strapOptions}>
              {['Stainless Steel', 'Italian Leather', 'NATO'].map(strap => (
                <button
                  key={strap}
                  className={`${styles.strapBtn} ${activeStrap === strap ? styles.active : ''}`}
                  onClick={() => setActiveStrap(strap)}
                  suppressHydrationWarning
                >
                  {strap}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Cart */}
          <div className={styles.checkoutGroup}>
            <div className={styles.priceDisplay}>
              <span className={styles.price}>$28,800</span>
              <span className={styles.shippingText}>Free Expedited Shipping</span>
            </div>
            <p className={styles.installments}>
              Or 4 payments of $7,200 with <strong>Tabby / Tamara</strong>
            </p>
            <button className={styles.addBtn} suppressHydrationWarning>
              Add to Cart
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
