/* ============================================
 * Collections Client — Create/view collections
 * ============================================ */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createCollection, deleteCollection } from "@/lib/actions";
import type { Collection, CollectionType } from "@/lib/types";
import styles from "./collections.module.css";

const COLLECTION_TYPES: { value: CollectionType; label: string; icon: string }[] = [
  { value: "custom", label: "Personalizada", icon: "📁" },
  { value: "saga", label: "Saga", icon: "🎬" },
  { value: "director", label: "Director", icon: "🎥" },
  { value: "actor", label: "Actor", icon: "🌟" },
  { value: "genre", label: "Género", icon: "🏷️" },
];

interface Props {
  initialCollections: Collection[];
}

export default function CollectionsClient({ initialCollections }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [collections, setCollections] = useState(initialCollections);
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
    if (!confirm("¿Eliminar esta colección?")) return;
    try {
      await deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    return (
      COLLECTION_TYPES.find((t) => t.value === type)?.icon || "📁"
    );
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>📁 Colecciones</h1>
          <p>Organiza tus películas por tema</p>
        </div>

        {/* Create button */}
        <button
          onClick={() => setShowCreate(true)}
          className={`btn btn-primary ${styles.createBtn}`}
          id="create-collection-btn"
        >
          + Nueva Colección
        </button>

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
                  Nueva Colección
                </h3>
                <form onSubmit={handleCreate} className={styles.createForm}>
                  <input
                    type="text"
                    placeholder="Nombre de la colección"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input"
                    required
                    autoFocus
                    id="collection-name-input"
                  />
                  <textarea
                    placeholder="Descripción (opcional)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className={`input ${styles.textarea}`}
                    rows={2}
                    id="collection-description-input"
                  />
                  <div className={styles.typeSelector}>
                    {COLLECTION_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setNewType(type.value)}
                        className={`tag ${
                          newType === type.value ? "active" : ""
                        }`}
                      >
                        {type.icon} {type.label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="btn btn-ghost"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !newName.trim()}
                      className="btn btn-primary"
                      id="save-collection-btn"
                    >
                      {saving ? "Creando..." : "Crear"}
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
                    {
                      COLLECTION_TYPES.find((t) => t.value === collection.type)
                        ?.label
                    }
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">📁</div>
            <h3>Sin colecciones</h3>
            <p>
              Crea colecciones para organizar películas por director, saga,
              género o lo que quieras.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
