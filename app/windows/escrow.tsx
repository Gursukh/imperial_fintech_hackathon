"use client";

import React, { useEffect, useMemo, useState } from "react";
import {

    MaterialReactTable,

    useMaterialReactTable,

    type MRT_ColumnDef,

} from 'material-react-table';
import { useEscrows } from "../context/escrow";
import type { Escrow } from "../types";
import { pendingActionsMap } from "../data/pendingActionsMap";

export default function EscrowPanel() {
    const { escrows, archiveEscrow, updateEscrow } = useEscrows();

    // local state for switch selection
    const [selectedView, setSelectedView] = useState<"imports" | "exports">("imports");
    // local state for row selection (track by invoiceNumber if available, else MRT row.id)
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

    // statuses shown for imports (others go to exports)
    const importStatusSet = useMemo(() => new Set([
        "pending signature",
        "pending payment",
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
                                style={{ ...style, backgroundColor: '#0417B2' }}
                            >
                                {status}
                            </span>
                        );
                        case "funds available": return (
                            <span
                                style={{ ...style, backgroundColor: '#0C9461' }}
                            >
                                {status}
                            </span>
                        );
                        case "expired": return (
                            <span
                                style={{ ...style, backgroundColor: 'rgb(239, 68, 68)' }}
                            >
                                {status}
                            </span>
                        );
                        case "cancelled": return (
                            <span
                                style={{ ...style, backgroundColor: '#666' }}
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

    const filteredEscrows = useMemo(() => {
        return escrows.filter((e) => {
            const status = (e.status ?? "").toLowerCase();
            const isImportStatus = importStatusSet.has(status);
            return selectedView === "imports" ? isImportStatus : !isImportStatus;
        });
    }, [escrows, importStatusSet, selectedView]);

    // clear selection if switching views or the selected item no longer exists in filtered data
    useEffect(() => {
        if (!selectedRowId) return;
        const stillExists = filteredEscrows.some(
            (e, idx) => (e.invoiceNumber ?? String(idx)) === selectedRowId,
        );
        if (!stillExists) setSelectedRowId(null);
    }, [filteredEscrows, selectedRowId]);

    const table = useMaterialReactTable<Escrow>({
        columns,
        data: filteredEscrows,
        enableStickyHeader: true,
        enableDensityToggle: false,
        // make table rows clickable and highlight on selection
        muiTableBodyRowProps: ({ row }) => {
            const rowId = (row.original.invoiceNumber ?? row.id) as string;
            const isSelected = selectedRowId === rowId;
            return {
                onClick: (e: React.MouseEvent) => {
                    // prevent container click-away handler from firing
                    e.stopPropagation();
                    setSelectedRowId((prev) => (prev === rowId ? null : rowId));
                },
                role: 'button',
                tabIndex: 0,
                onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        // prevent container click-away handler from firing
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
        muiTableContainerProps: {
            sx: { height: '100%', flex: '1 1 auto' },
            className: "no-scrollbar",
            onClick: () => {
                // click-away inside table container but not on a row -> clear selection
                if (selectedRowId) setSelectedRowId(null);
            },
        },
    });

    // Find the selected escrow details
    const selectedEscrow = useMemo<Escrow>(() => {
        if (!selectedRowId) return {
            invoiceNumber: '',
            name: '',
            status: "draft",
            counterparty: '',
            currencyAmount: 0,
            currency: '',
            portOfLoading: '',
            portOfDischarge: '',
            finalDestination: '',
            proofOfShipment: '',
            dateCreated: '',
            dateUpdated: '',
            dateOfExpiry: '',
            vaultAddress: '',
        };
        return filteredEscrows.find(
            (e, idx) => (e.invoiceNumber ?? String(idx)) === selectedRowId
        ) || {
            invoiceNumber: '',
            name: '',
            status: "draft",
            counterparty: '',
            currencyAmount: 0,
            currency: '',
            portOfLoading: '',
            portOfDischarge: '',
            finalDestination: '',
            proofOfShipment: '',
            dateCreated: '',
            dateUpdated: '',
            dateOfExpiry: '',
            vaultAddress: '',
        };
    }, [selectedRowId, filteredEscrows]);

    return (
        <div className="relative h-full p-8 w-auto flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6 h-8">

                <h1 className="text-4xl font-black ">Active Escrows</h1>
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
            <div className="relative flex-grow min-h-0 ">
                {/* Main Table Panel */}
                <div
                    className="absolute bg-white rounded-2xl overflow-hidden shadow-md flex flex-col"
                    style={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: selectedRowId ? 'calc(50% - 0.5rem)' : '100%',
                        transform: selectedRowId ? 'translateX(0)' : 'translateX(0)',
                        transition: 'width 500ms ease, transform 500ms ease',
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
                        transition: 'transform 500ms ease',
                        opacity: selectedRowId ? 1 : 0,
                        pointerEvents: selectedRowId ? 'auto' : 'none',
                    }}
                >
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold">Escrow Details</h2>
                        <button
                            onClick={() => setSelectedRowId(null)}
                            className="text-gray-500 hover:text-gray-700 text-2xl leading-none cursor-pointer"
                            aria-label="Close details"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4 mb-4">
                        <div className=" [&>*:nth-child(even)]:bg-gray-100">

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

                        <div className="border-t pt-4 [&>*:nth-child(even)]:bg-gray-100" >
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
                    <h2 className="text-2xl font-bold mt-8 capitalize">{`Pending Actions - ${selectedEscrow.status}`}</h2>
                    {selectedEscrow.status && pendingActionsMap[selectedEscrow.status] && (
                        <div className="mt-4 flex-grow flex flex-col ">
                            <p className="text-gray-700 mb-4">{pendingActionsMap[selectedEscrow.status].description}</p>
                            <div className="grid grid-cols-[1fr_1fr] gap-4 text-xl mt-auto ">
                                {pendingActionsMap[selectedEscrow.status].actions({
                                    onArchiveEscrow: () => {
                                        if (selectedEscrow.invoiceNumber) {
                                            archiveEscrow(selectedEscrow.invoiceNumber);
                                            setSelectedRowId(null);
                                        }
                                    },
                                    onCancelEscrow: () => {
                                        if (selectedEscrow.invoiceNumber) {
                                            updateEscrow(selectedEscrow.invoiceNumber, { 
                                                status: "cancelled",
                                                dateUpdated: new Date().toISOString()
                                            });
                                            // Archive the cancelled escrow
                                            setTimeout(() => {
                                                archiveEscrow(selectedEscrow.invoiceNumber!);
                                                setSelectedRowId(null);
                                            }, 500);
                                        }
                                    },
                                    onSignEscrow: () => {
                                        if (selectedEscrow.invoiceNumber) {
                                            updateEscrow(selectedEscrow.invoiceNumber, { 
                                                status: "pending payment",
                                                dateUpdated: new Date().toISOString()
                                            });
                                        }
                                    },
                                    onDepositFunds: () => {
                                        if (selectedEscrow.invoiceNumber) {
                                            updateEscrow(selectedEscrow.invoiceNumber, { 
                                                status: "pending shipment",
                                                dateUpdated: new Date().toISOString()
                                            });
                                        }
                                    },
                                    onUploadProofOfShipment: () => {
                                        if (selectedEscrow.invoiceNumber) {
                                            updateEscrow(selectedEscrow.invoiceNumber, { 
                                                status: "funds available",
                                                dateUpdated: new Date().toISOString()
                                            });
                                        }
                                    },
                                    onWithdrawFunds: () => {
                                        if (selectedEscrow.invoiceNumber) {
                                            // Archive the escrow after funds are withdrawn
                                            archiveEscrow(selectedEscrow.invoiceNumber);
                                            setSelectedRowId(null);
                                        }
                                    }
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper component for displaying detail fields
function DetailField({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-[200px_auto] ">
            <dt className="text-sm font-medium text-gray-600 mb-1">{label}</dt>
            <dd className="text-base text-gray-900 break-words">{value}</dd>
        </div>
    );
}