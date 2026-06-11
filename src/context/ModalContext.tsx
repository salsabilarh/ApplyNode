'use client';
import { createContext, useContext, useState } from 'react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const ModalContext = createContext<any>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalConfig, setModalConfig] = useState<any>(null);

  const openModal = (config: any) => setModalConfig(config);
  const closeModal = () => setModalConfig(null);

  return (
    <ModalContext.Provider value={{ openModal }}>
      {children}
      {modalConfig && (
        <ConfirmationModal 
          isOpen={!!modalConfig} 
          onClose={closeModal} 
          onConfirm={modalConfig.onConfirm} 
          title={modalConfig.title} 
          message={modalConfig.message} 
        />
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal harus digunakan di dalam ModalProvider');
  }
  return context;
};