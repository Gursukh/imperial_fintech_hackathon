"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type EscrowType from "../types";
import sampleEscrows from "../data/sampleEscrows";

type EscrowContextType = {
  escrows: EscrowType[];
  setEscrows: React.Dispatch<React.SetStateAction<EscrowType[]>>;
  addEscrow: (e: EscrowType) => void;
  updateEscrow: (invoiceNumber: string, patch: Partial<EscrowType>) => void;
  removeEscrow: (invoiceNumber: string) => void;
};

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

export function EscrowProvider({ children }: { children: React.ReactNode }) {
  // key for local persistence
  const STORAGE_KEY = useMemo(() => "escrows:v1", []);

  const [escrows, setEscrows] = useState<EscrowType[]>([]);

  // On first mount, attempt to load from storage, else seed from samples
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as EscrowType[];
        if (Array.isArray(parsed)) {
          setEscrows(parsed);
          return;
        }
      }
      // fallback to sample data
      setEscrows(sampleEscrows);
    } catch {
      setEscrows(sampleEscrows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STORAGE_KEY]);

  // Persist to localStorage whenever escrows change
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(escrows));
      }
    } catch {
      // ignore persistence errors
    }
  }, [escrows, STORAGE_KEY]);

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
