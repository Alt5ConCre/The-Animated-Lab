'use client';

import { ArrowRight } from 'lucide-react';
import { Instagram, Youtube, Twitter, Facebook } from './SocialIcons';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* Brand & Newsletter */}
        <div className={styles.brandCol}>
          <div className={styles.logo}>
            <span className="gold-text">XENITH</span>
          </div>
          <div className={styles.newsletter}>
            <h4 className={styles.newsletterTitle}>Join the Inner Circle</h4>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem' }}>
              Subscribe to receive exclusive access to early releases and new watchmaker journals.
            </p>
            <div className={styles.inputGroup}>
              <input type="email" placeholder="Email Address" className={styles.input} suppressHydrationWarning />
              <button className={styles.submitBtn} suppressHydrationWarning>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className={styles.linkCol}>
          <h4 className={styles.linkTitle}>Collections</h4>
          <ul className={styles.linkList}>
            <li><a href="#" className={styles.link}>Automatic Series</a></li>
            <li><a href="#" className={styles.link}>Chronograph</a></li>
            <li><a href="#" className={styles.link}>Limited Edition</a></li>
            <li><a href="#" className={styles.link}>Shop All</a></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className={styles.linkCol}>
          <h4 className={styles.linkTitle}>The Brand</h4>
          <ul className={styles.linkList}>
            <li><a href="#" className={styles.link}>Our Story</a></li>
            <li><a href="#" className={styles.link}>Craftsmanship</a></li>
            <li><a href="#" className={styles.link}>Journal / Blog</a></li>
            <li><a href="#" className={styles.link}>Warranty</a></li>
          </ul>
        </div>

        {/* Links Column 3 */}
        <div className={styles.linkCol}>
          <h4 className={styles.linkTitle}>Support</h4>
          <ul className={styles.linkList}>
            <li><a href="#" className={styles.link}>Contact Us</a></li>
            <li><a href="#" className={styles.link}>Shipping Policy</a></li>
            <li><a href="#" className={styles.link}>Returns & Exchanges</a></li>
            <li><a href="#" className={styles.link}>FAQs</a></li>
          </ul>
        </div>

      </div>

      <div className={styles.bottomBar}>
        <p>&copy; 2026 <a href="https://nithindevasia.com"> NITHIN DEVASIA</a>. All rights reserved.</p>
        <div className={styles.socialIcons}>
          <a href="#" className={styles.socialIcon} aria-label="Instagram"><Instagram size={20} /></a>
          <a href="#" className={styles.socialIcon} aria-label="YouTube"><Youtube size={20} /></a>
          <a href="#" className={styles.socialIcon} aria-label="Twitter"><Twitter size={20} /></a>
          <a href="#" className={styles.socialIcon} aria-label="Facebook"><Facebook size={20} /></a>
        </div>
        <p style={{ opacity: 0.5 }}>Hand-crafted in Switzerland.</p>
      </div>
    </footer>
  );
}
