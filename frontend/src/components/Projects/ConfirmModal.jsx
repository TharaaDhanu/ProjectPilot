/**
 * components/Projects/ConfirmModal.jsx
 * ----------------------------------------
 * Reusable confirmation dialog for Delete and Archive/Restore actions.
 * variant="danger"  → red confirm (Delete)
 * variant="warning" → navy/lime confirm (Archive)
 */

import React from 'react';
import { MdDelete, MdArchive, MdRestorePage } from 'react-icons/md';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({
  title,
  message,
  confirmLabel,
  variant = 'danger',
  onConfirm,
  onClose,
  loading,
}) => {
  const Icon = variant === 'danger'
    ? MdDelete
    : confirmLabel?.toLowerCase().includes('restore') ? MdRestorePage : MdArchive;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={`${styles.iconWrapper} ${styles[variant]}`}>
          <Icon size={28} />
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message} dangerouslySetInnerHTML={{ __html: message }} />
        <div className={styles.footer}>
          <button
            id="confirm-modal-cancel"
            className={styles.cancelBtn}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            id="confirm-modal-confirm"
            className={`${styles.confirmBtn} ${styles[variant]}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
