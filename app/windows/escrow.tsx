"use client";

import React, { useMemo, useState } from "react";
import {

    MaterialReactTable,

    useMaterialReactTable,

    type MRT_ColumnDef,

} from 'material-react-table';
import { useEscrows } from "../context/escrow";
import type { Escrow } from "../types";

export default function EscrowPanel() {
    const { escrows } = useEscrows();

    // local state for switch selection
    const [selectedView, setSelectedView] = useState<"imports" | "exports">("imports");

    // statuses shown for imports (others go to exports)
    const importStatusSet = useMemo(() => new Set([
        "pending signature",
        // treat "pending delivery" synonymously with our data's "pending shipment"
        "pending shipment",
        "pending delivery",
    ]), []);

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
                        // textTransform: 'capitalize',
                    }

                    switch (status) {
                        case "pending signature":
                        case "pending shipment":
                        case "pending payment": return (
                            <span
                                style={{ ...style, backgroundColor: '#222' }}
                            >
                                {status}
                            </span>
                        );
                        case "funds available": return (
                            <span
                                style={{ ...style, backgroundColor: 'green' }}
                            >
                                {status}
                            </span>
                        );
                        case "expired": return (
                            <span
                                style={{ ...style, backgroundColor: 'red' }}
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
                size: 160,
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

    const filteredEscrows = useMemo(() => {
        return escrows.filter((e) => {
            const status = (e.status ?? "").toLowerCase();
            const isImportStatus = importStatusSet.has(status);
            return selectedView === "imports" ? isImportStatus : !isImportStatus;
        });
    }, [escrows, importStatusSet, selectedView]);

    const table = useMaterialReactTable<Escrow>({
        columns,
        data: filteredEscrows,
        enableStickyHeader: true,
        enableDensityToggle: false,
        muiTableHeadCellProps: {
            sx: {
                fontWeight: 'bold',
                fontSize: '1rem',
            },

        },
        muiTopToolbarProps: {
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
        muiTableContainerProps: { sx: { height: '100%', flex: '1 1 auto' } },
    });

    return (
        <div className="h-full rounded-2xl p-8 overflow-hidden w-auto flex flex-col">
            <div className="flex justify-between items-center mb-6">

                <h1 className="text-4xl font-black ">Available Escrows</h1>
                <div
                    role="tablist"
                    aria-label="Switch View"
                    className="relative [&>*]:cursor-pointer cursor-pointer  bg-[#BBB] grid grid-cols-[1fr_1fr] rounded-2xl p-1 text-md gap-2 text-black"
                    onClick={() => setSelectedView(selectedView === "imports" ? "exports" : "imports")}
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={selectedView === "imports"}
                        className={
                            (selectedView === "imports"
                                ? "bg-white text-black shadow"
                                : "bg-transparent text-black/80 hover:bg-white/30") +
                            " px-4 py-2 rounded-xl transition-colors"
                        }
                    >
                        Imports
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={selectedView === "exports"}
                        className={
                            (selectedView === "exports"
                                ? "bg-white text-black shadow"
                                : "bg-transparent text-black/80 hover:bg-white/30") +
                            " px-4 py-2 rounded-xl transition-colors"
                        }
                    >
                        Exports
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-md flex-grow flex flex-col min-h-0">

                <MaterialReactTable table={table} />
            </div>
        </div>
    );
}