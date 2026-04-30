'use client';

import { useState, useEffect } from 'react';
import { Search, User, ShoppingBag } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.logo}>
        <span className="gold-text">XENITH</span>
      </div>

      <nav className={styles.nav}>
        <a className={styles.navLink}>Shop</a>
        <a className={styles.navLink}>Heritage</a>
        <a className={styles.navLink}>Vision</a>
      </nav>

      <div className={styles.icons}>
        <button className={styles.iconBtn} suppressHydrationWarning>
          <Search size={18} strokeWidth={1} />
        </button>
        <button className={styles.iconBtn} suppressHydrationWarning>
          <User size={18} strokeWidth={1} />
        </button>
        <button className={styles.iconBtn} suppressHydrationWarning>
          <ShoppingBag size={18} strokeWidth={1} />
        </button>
      </div>
    </header>
  );
}
