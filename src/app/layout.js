import { Inter, Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "Xenith Timepieces | Timeless Precision",
  description: "Ultra-luxury timepieces, handcrafted for precision and prestige.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
