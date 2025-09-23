'use client'

import { useState, useEffect } from 'react'
import styles from './CustomModal.module.css'
//fixed

interface CustomModalProps {
  isVisible: boolean
  title: string
  message: string
  type?: 'info' | 'success' | 'error' | 'confirm'
  onConfirm?: () => void
  onCancel?: () => void
  onClose?: () => void
  confirmText?: string
  cancelText?: string
}

export default function CustomModal({ 
  isVisible, 
  title, 
  message, 
  type = 'info',
  onConfirm,
  onCancel,
  onClose,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: CustomModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
    }
  }, [isVisible])

  if (!isVisible) return null

  const handleConfirm = () => {
    onConfirm?.()
    onClose?.()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose?.()
  }

  const handleClose = () => {
    onClose?.()
  }

  const getIcon = () => {
    switch (type) {
      case 'success': return '🎉'
      case 'error': return '❌'
      case 'confirm': return '❓'
      default: return 'ℹ️'
    }
  }

  const isConfirmType = type === 'confirm'

  return (
    <div className={styles.overlay} onClick={!isConfirmType ? handleClose : undefined}>
      <div 
        className={`${styles.modal} ${isAnimating ? styles.animate : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.icon}>{getIcon()}</div>
          <h3 className={styles.title}>{title}</h3>
          {!isConfirmType && (
            <button className={styles.closeBtn} onClick={handleClose}>×</button>
          )}
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.buttons}>
          {isConfirmType ? (
            <>
              <button className={styles.cancelBtn} onClick={handleCancel}>
                {cancelText}
              </button>
              <button className={styles.confirmBtn} onClick={handleConfirm}>
                {confirmText}
              </button>
            </>
          ) : (
            <button className={styles.okBtn} onClick={handleClose}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
