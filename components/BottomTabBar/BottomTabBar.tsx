"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomTabBar.module.css";

const tabs = [
  { href: "/", label: "カメラ" },
  { href: "/album", label: "アルバム" },
] as const;

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.bar}>
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${isActive ? styles.active : ""}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
