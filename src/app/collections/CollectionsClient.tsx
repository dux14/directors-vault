/* ============================================
 * Collections Client — Create/view collections
 * ============================================ */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createCollection, deleteCollection } from "@/lib/actions";
import { respondToInvitation } from "@/lib/collection-actions";
import type { CollectionInvitation } from "@/lib/collection-actions";
import { useTranslation } from "@/lib/i18n/context";
import type { Collection, CollectionType } from "@/lib/types";
import styles from "./collections.module.css";

/* ---- SVG Icons ---- */
const IconCheck = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconX = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ---- SVG Icons ---- */
const IconFolder = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const IconFilm = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" />
    <line x1="17" y1="17" x2="22" y2="17" />
  </svg>
);

const IconCamera = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconUser = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconTag = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const COLLECTION_TYPE_ICONS: { value: CollectionType; icon: React.ReactNode }[] = [
  { value: "custom", icon: <IconFolder size={16} /> },
  { value: "saga", icon: <IconFilm size={16} /> },
  { value: "director", icon: <IconCamera size={16} /> },
  { value: "actor", icon: <IconUser size={16} /> },
  { value: "genre", icon: <IconTag size={16} /> },
];

interface Props {
  initialCollections: Collection[];
  initialInvitations?: CollectionInvitation[];
}

export default function CollectionsClient({ initialCollections, initialInvitations = [] }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [collections, setCollections] = useState(initialCollections);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<CollectionType>("custom");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const collection = await createCollection(
        newName.trim(),
        newType,
        newDescription.trim() || undefined
      );
      setCollections((prev) => [collection, ...prev]);
      setShowCreate(false);
      setNewName("");
      setNewDescription("");
      setNewType("custom");
    } catch (error) {
      console.error("Error creating collection:", error);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("collections.deleteConfirm"))) return;
    try {
      await deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const handleRespond = async (invitationId: string, action: "accepted" | "declined") => {
    try {
      const res = await respondToInvitation(invitationId, action);
      if (res.success) {
        setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
        if (action === "accepted") {
          router.refresh();
        }
      } else {
        console.error("Failed to respond to invitation:", res.error);
      }
    } catch (error) {
      console.error("Error responding to invitation:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    return (
      COLLECTION_TYPE_ICONS.find((t) => t.value === type)?.icon || <IconFolder size={24} />
    );
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><IconFolder size={28} /> {t("collections.title")}</h1>
          <p>{t("collections.subtitle")}</p>
        </div>

        {/* Create button */}
        <button
          onClick={() => setShowCreate(true)}
          className={`btn btn-primary ${styles.createBtn}`}
          id="create-collection-btn"
        >
          <IconPlus /> {t("collections.new")}
        </button>

        {/* Invitations Section */}
        {invitations.length > 0 && (
          <section className={styles.invitationsSection}>
            <h2 className="section-title"><IconUser /> {t("social.collectionInvites")}</h2>
            <div className={styles.invitesList}>
              {invitations.map((inv) => (
                <div key={inv.id} className={styles.inviteCard}>
                  <div className={styles.inviteInfo}>
                    <strong>{inv.collection?.name || "Colección"}</strong>
                    <span>
                      {t("social.invitedBy").replace(
                        "{name}",
                        inv.inviter?.display_name || inv.inviter?.email || "Usuario"
                      )}
                    </span>
                  </div>
                  <div className={styles.inviteActions}>
                    <button
                      onClick={() => handleRespond(inv.id, "declined")}
                      className="btn btn-ghost btn-icon"
                      title={t("social.decline")}
                    >
                      <IconX />
                    </button>
                    <button
                      onClick={() => handleRespond(inv.id, "accepted")}
                      className="btn btn-primary btn-icon"
                      title={t("social.accept")}
                    >
                      <IconCheck />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
            >
              <motion.div
                className="modal-content"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-handle" />
                <h3 style={{ marginBottom: "var(--space-lg)" }}>
                  {t("collections.new")}
                </h3>
                <form onSubmit={handleCreate} className={styles.createForm}>
                  <input
                    type="text"
                    placeholder={t("collections.namePlaceholder")}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input"
                    required
                    autoFocus
                    id="collection-name-input"
                  />
                  <textarea
                    placeholder={t("collections.descPlaceholder")}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className={`input ${styles.textarea}`}
                    rows={2}
                    id="collection-description-input"
                  />
                  <div className={styles.typeSelector}>
                    {COLLECTION_TYPE_ICONS.map((ctype) => (
                      <button
                        key={ctype.value}
                        type="button"
                        onClick={() => setNewType(ctype.value)}
                        className={`tag ${
                          newType === ctype.value ? "active" : ""
                        }`}
                      >
                        {ctype.icon} {t(`collections.type.${ctype.value}`)}
                      </button>
                    ))}
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="btn btn-ghost"
                    >
                      {t("general.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !newName.trim()}
                      className="btn btn-primary"
                      id="save-collection-btn"
                    >
                      {saving ? t("collections.creating") : t("collections.create")}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <div className={`collection-grid ${styles.grid}`}>
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/collections/${collection.id}`}
                  className={styles.collectionCard}
                  id={`collection-${collection.id}`}
                >
                  <div className={styles.collectionIcon}>
                    {getTypeIcon(collection.type)}
                  </div>
                  <h3 className={styles.collectionName}>{collection.name}</h3>
                  {collection.description && (
                    <p className={styles.collectionDesc}>
                      {collection.description}
                    </p>
                  )}
                  <span className={`tag ${styles.collectionType}`}>
                    {t(`collections.type.${collection.type}`)}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon"><IconFolder size={48} /></div>
            <h3>{t("collections.emptyTitle")}</h3>
            <p>{t("collections.emptyDesc")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
