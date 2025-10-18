"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useEscrows } from "../context/escrow";
import type EscrowType from "../types";

type SortKey = keyof EscrowType | null;

export default function InboundPanel() {
  const { escrows } = useEscrows();

  // Default column widths (pixels) - adjust these values to change defaults
  const DEFAULT_COL_WIDTHS: Record<string, number> = {
    invoiceNumber: 140,
    status: 100,
    name: 220,
    counterparty: 180,
    currencyAmount: 140,
    dateOfExpiry: 160,
    dateCreated: 160,
  };

  // widths in pixels per column key
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => ({ ...DEFAULT_COL_WIDTHS }));

  // drag state refs (kept in refs to avoid re-renders during move)
  const dragState = useRef<{
    col?: string;
    startX?: number;
    startWidth?: number;
    mouseMoveHandler?: (ev: MouseEvent) => void;
    mouseUpHandler?: (ev: MouseEvent) => void;
  }>({});

  useEffect(() => {
    return () => {
      // cleanup if unmounted while dragging
      if (dragState.current.mouseMoveHandler) document.removeEventListener("mousemove", dragState.current.mouseMoveHandler);
      if (dragState.current.mouseUpHandler) document.removeEventListener("mouseup", dragState.current.mouseUpHandler);
    };
  }, []);

  const startDrag = (col: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[col] ?? DEFAULT_COL_WIDTHS[col] ?? 120;
    dragState.current.col = col;
    dragState.current.startX = startX;
    dragState.current.startWidth = startWidth;

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragState.current.col) return;
      const dx = ev.clientX - (dragState.current.startX ?? 0);
      const newW = Math.max(48, (dragState.current.startWidth ?? 0) + dx);
      setColWidths((s) => ({ ...s, [dragState.current.col as string]: newW }));
    };

    const onMouseUp = () => {
      if (dragState.current.mouseMoveHandler) document.removeEventListener("mousemove", dragState.current.mouseMoveHandler);
      if (dragState.current.mouseUpHandler) document.removeEventListener("mouseup", dragState.current.mouseUpHandler);
      dragState.current = {};
    };

    dragState.current.mouseMoveHandler = onMouseMove;
    dragState.current.mouseUpHandler = onMouseUp;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const [sortKey, setSortKey] = useState<SortKey>("dateCreated");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return escrows;
    const copy = [...escrows];
    copy.sort((a, b) => {
      const va = (a as any)[sortKey];
      const vb = (b as any)[sortKey];

      // handle undefined/null
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === "asc" ? -1 : 1;
      if (vb == null) return sortDir === "asc" ? 1 : -1;

      // numbers
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;

      // dates (ISO strings)
      const dateLike = (v: any) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}T?/.test(v);
      if (dateLike(va) && dateLike(vb)) {
        return sortDir === "asc" ? new Date(va).getTime() - new Date(vb).getTime() : new Date(vb).getTime() - new Date(va).getTime();
      }

      // fallback to string compare
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa < sb) return sortDir === "asc" ? -1 : 1;
      if (sa > sb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [escrows, sortKey, sortDir]);

  const formatCurrency = (amt: number | undefined, curr?: string) => {
    if (amt == null) return "-";
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: curr || "USD", maximumFractionDigits: 2 }).format(amt);
    } catch (e) {
      return `${amt} ${curr ?? ""}`;
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso;
    }
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col p-8">
      <h1 className="text-4xl font-black mb-6">Active Escrows</h1>

      <div className="flex-1 overflow-auto bg-white rounded-2xl shadow-md">
        {escrows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No escrows yet. Create one using the Create panel.</div>
        ) : (
          <div className="min-w-full">
            <table className="w-full table-fixed border-collapse">
              <thead className="bg-gray-50 sticky top-0 border-b-2 border-[#DDD]">
                <tr>
                  <th
                    className="text-left p-3 cursor-pointer relative"
                    style={{ width: colWidths.invoiceNumber }}
                    onClick={() => toggleSort("invoiceNumber")}
                  >
                    <div className="select-none">Invoice</div>
                    <div
                      className="absolute right-0 top-0 h-full w-3 -mr-1 cursor-col-resize"
                      onMouseDown={(e) => startDrag("invoiceNumber", e)}
                    />
                  </th>

                  <th
                    className="text-left p-3 cursor-pointer relative"
                    style={{ width: colWidths.status }}
                    onClick={() => toggleSort("status")}
                  >
                    <div className="select-none">Status</div>
                    <div
                      className="absolute right-0 top-0 h-full w-3 -mr-1 cursor-col-resize"
                      onMouseDown={(e) => startDrag("status", e)}
                    />
                  </th>

                  <th
                    className="text-left p-3 cursor-pointer relative"
                    style={{ width: colWidths.name }}
                    onClick={() => toggleSort("name")}
                  >
                    <div className="select-none">Name</div>
                    <div
                      className="absolute right-0 top-0 h-full w-3 -mr-1 cursor-col-resize"
                      onMouseDown={(e) => startDrag("name", e)}
                    />
                  </th>

                  <th
                    className="text-left p-3 cursor-pointer relative"
                    style={{ width: colWidths.counterparty }}
                    onClick={() => toggleSort("counterparty")}
                  >
                    <div className="select-none">Counterparty</div>
                    <div
                      className="absolute right-0 top-0 h-full w-3 -mr-1 cursor-col-resize"
                      onMouseDown={(e) => startDrag("counterparty", e)}
                    />
                  </th>

                  <th
                    className="text-left p-3 cursor-pointer relative"
                    style={{ width: colWidths.currencyAmount }}
                    onClick={() => toggleSort("currencyAmount")}
                  >
                    <div className="select-none">Amount</div>
                    <div
                      className="absolute right-0 top-0 h-full w-3 -mr-1 cursor-col-resize"
                      onMouseDown={(e) => startDrag("currencyAmount", e)}
                    />
                  </th>

                  <th
                    className="text-left p-3 cursor-pointer relative"
                    style={{ width: colWidths.dateOfExpiry }}
                    onClick={() => toggleSort("dateOfExpiry")}
                  >
                    <div className="select-none">Expiry</div>
                    <div
                      className="absolute right-0 top-0 h-full w-3 -mr-1 cursor-col-resize"
                      onMouseDown={(e) => startDrag("dateOfExpiry", e)}
                    />
                  </th>

                  <th
                    className="text-left p-3 cursor-pointer relative"
                    style={{ width: colWidths.dateCreated }}
                    onClick={() => toggleSort("dateCreated")}
                  >
                    <div className="select-none">Created</div>
                    <div
                      className="absolute right-0 top-0 h-full w-3 -mr-1 cursor-col-resize"
                      onMouseDown={(e) => startDrag("dateCreated", e)}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e) => (
                  <tr key={e.invoiceNumber ?? Math.random()} className="even:bg-white odd:bg-gray-50 hover:bg-blue-50 text-sm">
                    <td className="p-3 align-top">{e.invoiceNumber ?? "-"}</td>
                    <td className="p-3 align-top capitalize">{e.status}</td>
                    <td className="p-3 align-top">{e.name}</td>
                    <td className="p-3 align-top">{e.counterparty}</td>
                    <td className="p-3 align-top">{formatCurrency(e.currencyAmount, e.currency)}</td>
                    <td className="p-3 align-top">{formatDate(e.dateOfExpiry)}</td>
                    <td className="p-3 align-top">{formatDate(e.dateCreated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
