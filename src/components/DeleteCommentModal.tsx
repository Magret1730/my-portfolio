"use client";

import { Button } from "@once-ui-system/core";
import { useEffect } from "react";

import styles from "@/components/DeleteCommentModal.module.scss";

type DeleteCommentModalProps = {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteCommentModal({
  open,
  loading,
  onCancel,
  onConfirm,
}: DeleteCommentModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, loading, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-comment-title"
        aria-describedby="delete-comment-desc"
      >
        <h2 id="delete-comment-title" className={styles.title}>
          Delete comment?
        </h2>
        <p id="delete-comment-desc" className={styles.body}>
          Are you sure you want to delete this comment? This action cannot be undone.
        </p>
        <div className={styles.actions}>
          <Button
            type="button"
            size="m"
            variant="secondary"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="m"
            variant="primary"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
