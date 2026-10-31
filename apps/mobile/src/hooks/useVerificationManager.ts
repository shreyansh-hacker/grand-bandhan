import { useState, useEffect, useCallback } from 'react';
import { onServiceVerificationTrigger } from '../api/socket';
import { ServiceVerificationItem } from '../api/services/verification.service';

export function useVerificationManager() {
  const [activeVerification, setActiveVerification] = useState<ServiceVerificationItem | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onServiceVerificationTrigger((verificationData: any) => {
      console.log('[VerificationManager] Received verification trigger:', verificationData);
      setActiveVerification(verificationData);
      setIsOpen(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const openVerification = useCallback((item: ServiceVerificationItem) => {
    setActiveVerification(item);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    activeVerification,
    isOpen,
    openVerification,
    closeModal,
  };
}
