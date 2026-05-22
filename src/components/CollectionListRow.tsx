/* ============================================
 * CollectionListRow — dense one-line collection row
 * Used by /collections in list mode
 * ============================================ */

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Collection } from "@/lib/types";
import styles from "./CollectionListRow.module.css";

interface Props {
  collection: Collection;
  icon: ReactNode;
  typeLabel: string;
}

export default function CollectionListRow({ collection, icon, typeLabel }: Props) {
  return (
    <Link href={`/collections/${collection.id}`} className={styles.item}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.info}>
        <span className={styles.name}>{collection.name}</span>
        {collection.description && (
          <span className={styles.desc}>{collection.description}</span>
        )}
      </div>
      <span className={`tag ${styles.typeTag}`}>{typeLabel}</span>
    </Link>
  );
}
