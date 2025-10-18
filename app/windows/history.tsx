"use client";

import React, { useMemo, useState } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import { useEscrows } from "../context/escrow";
import type { Escrow } from "../types";

export default function HistoryPanel() {
  const { archivedEscrows } = useEscrows();
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const formatDateTime = (d: Date) => {
    if (!(d instanceof Date) || isNaN(d.getTime())) return "-";
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours24 = d.getHours();
    const minutes = pad(d.getMinutes());
    const ampm = hours24 >= 12 ? "PM" : "AM";
    const hours12 = pad(hours24 % 12 === 0 ? 12 : hours24 % 12);
    return `${day}/${month}/${year} ${hours12}:${minutes} ${ampm}`;
  };

  const columns = useMemo<MRT_ColumnDef<Escrow>[]>(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "Invoice ID",
        size: 70,
      },
      {
        accessorKey: "name",
        header: "Escrow Name",
        size: 220,
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 180,
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();

          let style = {
            padding: '4px 8px',
            borderRadius: '9999px',
            color: 'white',
            fontWeight: 'bold',
          }

          switch (status) {
            case "pending signature":
            case "pending shipment":
            case "pending payment": return (
              <span
                style={{ ...style, backgroundColor: '#aaa' }}
              >
                {"cancelled"}
              </span>
            );
            case "funds available": return (
              <span
                style={{ ...style, backgroundColor: '#888' }}
              >
                {"completed"}
              </span>
            );
            case "expired": return (
              <span
                style={{ ...style, backgroundColor: '#aaa' }}
              >
                {status}
              </span>
            );
            case "cancelled": return (
              <span
                style={{ ...style, backgroundColor: '#aaa' }}
              >
                {status}
              </span>
            );
            default: return (
              <span
                style={{ ...style, backgroundColor: '#999' }}
              >
                {status}
              </span>
            );
          }
        }
      },
      {
        accessorKey: "counterparty",
        header: "Counterparty",
        size: 200,
      },
      {
        id: "amount",
        header: "Amount",
        accessorFn: (row) => ({ amount: row.currencyAmount, currency: row.currency }),
        sortingFn: (a, b, columnId) => {
          const va = (a.getValue(columnId) as { amount: number }).amount;
          const vb = (b.getValue(columnId) as { amount: number }).amount;
          return va === vb ? 0 : va > vb ? 1 : -1;
        },
        Cell: ({ cell }) => {
          const v = cell.getValue() as { amount: number; currency: string };
          try {
            return new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: v.currency,
              maximumFractionDigits: 2,
            }).format(v.amount);
          } catch {
            return `${v.amount} ${v.currency}`;
          }
        },
        size: 140,
      },
      {
        id: "expiry",
        header: "Expiry",
        accessorFn: (row) => new Date(row.dateOfExpiry),
        sortingFn: "datetime",
        Cell: ({ cell }) => {
          const d = cell.getValue<Date>();
          return formatDateTime(d);
        },
        size: 180,
      },
      {
        id: "updated",
        header: "Updated",
        accessorFn: (row) => new Date(row.dateUpdated ?? row.dateCreated),
        sortingFn: "datetime",
        Cell: ({ cell }) => {
          const d = cell.getValue<Date>();
          return formatDateTime(d);
        },
        size: 180,
      },
    ],
    []
  );

  const table = useMaterialReactTable<Escrow>({
    columns,
    data: archivedEscrows,
    enableStickyHeader: true,
    enableDensityToggle: false,
    muiTableBodyRowProps: ({ row }) => {
      const rowId = (row.original.invoiceNumber ?? row.id) as string;
      const isSelected = selectedRowId === rowId;
      return {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setSelectedRowId((prev) => (prev === rowId ? null : rowId));
        },
        role: 'button',
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setSelectedRowId((prev) => (prev === rowId ? null : rowId));
          }
        },
        sx: {
          cursor: 'pointer',
          transition: 'background-color 200ms ease',
          backgroundColor: isSelected ? 'rgba(0,0,0,0.06)' : undefined,
          '&:hover': {
            backgroundColor: isSelected ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.03)',
          },
        },
      };
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 'bold',
        fontSize: '1rem',
      },
    },
    muiTablePaperProps: {
      sx: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        py: 1.5,
        px: 2,
      },
    },
    initialState: {
      showGlobalFilter: false,
      density: "comfortable",
      pagination: { pageIndex: 0, pageSize: 10 },
      sorting: [{ id: "updated", desc: true }],
    },
    muiTableContainerProps: {
      sx: { height: '100%', flex: '1 1 auto' },
      className: "no-scrollbar",
      onClick: () => {
        if (selectedRowId) setSelectedRowId(null);
      },
    },
  });

  const selectedEscrow = useMemo<Escrow | null>(() => {
    if (!selectedRowId) return null;
    return archivedEscrows.find(
      (e, idx) => (e.invoiceNumber ?? String(idx)) === selectedRowId
    ) || null;
  }, [selectedRowId, archivedEscrows]);

  return (
    <div className="relative h-full p-8 w-auto flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-6 h-8">
        <h1 className="text-4xl font-black">Archived Escrows</h1>
        <div className="text-sm text-gray-600">
          {archivedEscrows.length} {archivedEscrows.length === 1 ? 'escrow' : 'escrows'} archived
        </div>
      </div>
      
      <div className="relative flex-grow min-h-0">
        {/* Main Table Panel */}
        <div
          className="absolute bg-white rounded-2xl overflow-hidden shadow-md flex flex-col"
          style={{
            top: 0,
            left: 0,
            bottom: 0,
            width: selectedRowId ? 'calc(50% - 0.5rem)' : '100%',
            transition: 'width 300ms ease',
          }}
        >
          <MaterialReactTable table={table} />
        </div>

        {/* Details Panel */}
        <div
          className="absolute bg-white rounded-2xl shadow-md p-6 overflow-auto no-scrollbar flex flex-col"
          style={{
            top: 0,
            right: 0,
            bottom: 0,
            width: 'calc(50% - 0.5rem)',
            transform: selectedRowId ? 'translateX(0)' : 'translateX(calc(100% + 1rem))',
            transition: 'transform 300ms ease',
            opacity: selectedRowId ? 1 : 0,
            pointerEvents: selectedRowId ? 'auto' : 'none',
          }}
        >
          {selectedEscrow && (
            <>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Archived Escrow Details</h2>
                <button
                  onClick={() => setSelectedRowId(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none cursor-pointer"
                  aria-label="Close details"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 mb-4">
                <div className="[&>*:nth-child(even)]:bg-gray-100">
                  <DetailField label="Invoice Number" value={selectedEscrow.invoiceNumber || '-'} />
                  <DetailField label="Escrow Name" value={selectedEscrow.name} />
                  <DetailField label="Status" value={selectedEscrow.status} />
                  <DetailField label="Counterparty" value={selectedEscrow.counterparty} />
                  <DetailField
                    label="Amount"
                    value={(() => {
                      try {
                        return new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: selectedEscrow.currency,
                          maximumFractionDigits: 2,
                        }).format(selectedEscrow.currencyAmount);
                      } catch {
                        return `${selectedEscrow.currencyAmount} ${selectedEscrow.currency}`;
                      }
                    })()}
                  />
                </div>

                <div className="border-t pt-4 [&>*:nth-child(even)]:bg-gray-100">
                  <h3 className="font-semibold text-lg mb-3">Shipping Information</h3>
                  <DetailField label="Port of Loading" value={selectedEscrow.portOfLoading} />
                  <DetailField label="Port of Discharge" value={selectedEscrow.portOfDischarge} />
                  <DetailField label="Final Destination" value={selectedEscrow.finalDestination} />
                  <DetailField label="Proof of Shipment" value={selectedEscrow.proofOfShipment || '-'} />
                </div>

                <div className="border-t pt-4 [&>*:nth-child(even)]:bg-gray-100">
                  <h3 className="font-semibold text-lg mb-3">Dates</h3>
                  <DetailField label="Date Created" value={formatDateTime(new Date(selectedEscrow.dateCreated))} />
                  <DetailField
                    label="Date Updated"
                    value={selectedEscrow.dateUpdated ? formatDateTime(new Date(selectedEscrow.dateUpdated)) : '-'}
                  />
                  <DetailField label="Date of Expiry" value={formatDateTime(new Date(selectedEscrow.dateOfExpiry))} />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-3">Additional Information</h3>
                  <DetailField label="Vault Address" value={selectedEscrow.vaultAddress || '-'} />
                </div>
              </div>

              <div className="border-t pt-4 mt-auto">
                <p className="text-sm text-gray-500 italic">
                  This escrow has been archived and is no longer active.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for displaying detail fields
function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[200px_auto]">
      <dt className="text-sm font-medium text-gray-600 mb-1">{label}</dt>
      <dd className="text-base text-gray-900 break-words">{value}</dd>
    </div>
  );
}
