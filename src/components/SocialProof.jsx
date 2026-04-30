'use client';

import { motion } from 'framer-motion';
import styles from './SocialProof.module.css';

const galleryItems = [
  { img: '/gallery/sapphire_crystal_1774892174424.png', label: 'Macro Dial', class: styles['item-1'] },
  { img: '/gallery/water_resistance_1774892359401.png', label: 'Diving Profile', class: styles['item-2'] },
  { img: '/gallery/hand_assembly_1774892421162.png', label: 'Kinetic Movement', class: styles['item-3'] },
];

const testimonials = [
  {
    quote: "The weight and precision of this luxury mechanical watch are unparalleled. Flawless next-day shipping in a beautiful lacquered box.",
    author: "Jonathan K. - Horology Collector"
  },
  {
    quote: "It commands presence without screaming for attention. The bezel action on this automatic diver feels like clicking a vault shut.",
    author: "Watchfinder & Co."
  },
  {
    quote: "A true masterclass in 316L surgical steel. It easily stands toe-to-toe with Swiss holy trinity divers at a fraction of the cost.",
    author: "The Urban Gentry"
  }
];

export default function SocialProof() {
  return (
    <section className={styles.socialProof}>
      <div className={styles.container}>
        
        {/* Gallery */}
        <div className={styles.gallery}>
          {galleryItems.map((item, idx) => (
            <motion.div 
              key={idx} 
              className={`${styles.galleryItem} ${item.class}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <img src={item.img} alt={item.label} />
              <div className={styles.label}>{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className={styles.testimonials}>
          <h2 className={`${styles.sectionTitle} gold-text`}>A Legacy of Excellence</h2>
          <div className={styles.testimonialGrid}>
            {testimonials.map((t, i) => (
              <motion.div 
                className={styles.card} 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <div className={styles.quote}>"{t.quote}"</div>
                <div className={styles.author}>— {t.author}</div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
