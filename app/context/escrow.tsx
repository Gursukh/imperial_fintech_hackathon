"use client"

import React, { createContext, useContext, useState } from "react";
import type EscrowType from "../types";

type EscrowContextType = {
  escrows: EscrowType[];
  setEscrows: React.Dispatch<React.SetStateAction<EscrowType[]>>;
  addEscrow: (e: EscrowType) => void;
  updateEscrow: (invoiceNumber: string, patch: Partial<EscrowType>) => void;
  removeEscrow: (invoiceNumber: string) => void;
};

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

export function EscrowProvider({ children }: { children: React.ReactNode }) {
  const [escrows, setEscrows] = useState<EscrowType[]>([]);

  const addEscrow = (e: EscrowType) => setEscrows((s) => [e, ...s]);

  const updateEscrow = (invoiceNumber: string, patch: Partial<EscrowType>) => {
    setEscrows((s) => s.map((x) => (x.invoiceNumber === invoiceNumber ? { ...x, ...patch } : x)));
  };

  const removeEscrow = (invoiceNumber: string) => {
    setEscrows((s) => s.filter((x) => x.invoiceNumber !== invoiceNumber));
  };

  return (
    <EscrowContext.Provider value={{ escrows, setEscrows, addEscrow, updateEscrow, removeEscrow }}>
      {children}
    </EscrowContext.Provider>
  );
}

export function useEscrows() {
  const ctx = useContext(EscrowContext);
  if (!ctx) throw new Error("useEscrows must be used within EscrowProvider");
  return ctx;
}

export default EscrowContext;
