"use client";

import React, { useState } from "react";
import { useEscrows } from "../context/escrow";
import type EscrowType from "../types";
import {
    fieldLabel,
    fieldWrapper,
    inputClass,
    selectClass,
    formGrid,
    boxWrapper,
    primaryButton,
    mutedButton,
} from "../styles/formClasses";

export default function CreatePanel() {
    const { addEscrow } = useEscrows();

    const [form, setForm] = useState<Partial<EscrowType>>({
        name: "",
        counterparty: "",
        currency: "",
        currencyAmount: 0,
        portOfLoading: "",
        portOfDischarge: "",
        finalDestination: "",
        proofOfShipment: "",
        vaultAddress: "",
        dateOfExpiry: "",
        invoiceNumber: "",
        dateCreated: new Date().toISOString(),
        dateUpdated: new Date().toISOString(),
        lastUpdatedBy: "",
    });

    const update = <K extends keyof EscrowType>(k: K, v: EscrowType[K]) =>
        setForm((s) => ({ ...s, [k]: v }));

    // whether user wants to use/enable a vault address for this escrow
    const [useVault, setUseVault] = useState<boolean>(false);

    const handleSubmit: React.FormEventHandler = (e) => {
        e.preventDefault();
        // Validate required fields: ensure none are empty/undefined
        const requiredKeys: (keyof EscrowType)[] = [
            "name",
            "counterparty",
            "currency",
            "currencyAmount",
            "portOfLoading",
            "portOfDischarge",
            "finalDestination",
            "dateOfExpiry",
        ];

        for (const k of requiredKeys) {
            const val = (form as any)[k];
            if (val === undefined || val === null || val === "" || (k === "currencyAmount" && Number(val) === 0)) {
                alert(`Please fill the required field: ${k}`);
                return;
            }
        }

        const invoice = form.invoiceNumber && form.invoiceNumber.trim() !== "" ? form.invoiceNumber : `INV-${Date.now()}`;

        const escrow: EscrowType = {
            name: (form.name as string) || "",
            counterparty: (form.counterparty as string) || "",
            currency: (form.currency as string) || "",
            currencyAmount: Number(form.currencyAmount) || 0,
            portOfLoading: (form.portOfLoading as string) || "",
            portOfDischarge: (form.portOfDischarge as string) || "",
            finalDestination: (form.finalDestination as string) || "",
            proofOfShipment: form.proofOfShipment ?? null,
            // if vault usage is disabled, ensure the escrow has no vault address
            vaultAddress: useVault ? (form.vaultAddress ?? null) : null,
            dateOfExpiry: (form.dateOfExpiry as string) || new Date().toISOString(),
            status: (form.status as any) || "pending signature",
            invoiceNumber: invoice,
            dateCreated: form.dateCreated || new Date().toISOString(),
            dateUpdated: new Date().toISOString(),
            lastUpdatedBy: form.lastUpdatedBy ?? null,
        };

        addEscrow(escrow);
        alert("Escrow created: " + invoice);

        // reset
        setForm({
            name: "",
            counterparty: "",
            currency: "",
            currencyAmount: 0,
            portOfLoading: "",
            portOfDischarge: "",
            finalDestination: "",
            proofOfShipment: "",
            vaultAddress: "",
            dateOfExpiry: "",
            invoiceNumber: "",
            dateCreated: new Date().toISOString(),
            dateUpdated: new Date().toISOString(),
            lastUpdatedBy: "",
        });
        // reset vault usage checkbox
        setUseVault(false);
    };

    return (
        <div className="h-full rounded-2xl p-8 overflow-auto">
            <h1 className="text-4xl font-black mb-6">Create An Escrow</h1>

            <form onSubmit={handleSubmit} className={formGrid}>
                <div className={boxWrapper}>
                    <h2 className="text-2xl font-semibold mb-4 col-span-2">Escrow Details</h2>
                    <label className={fieldWrapper}>
                        <span className={fieldLabel}>Escrow Name</span>
                        <input placeholder="Order #123" value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} className={inputClass} />
                    </label>

                    <label className={fieldWrapper}>
                        <span className={fieldLabel}>Counterparty</span>
                        <input placeholder="ACME Trading Co." value={form.counterparty ?? ""} onChange={(e) => update("counterparty", e.target.value)} className={inputClass} />
                    </label>

                    <label className={fieldWrapper + " col-span-2"}>
                        <span className={fieldLabel}>Proof of Shipment (EBL) URL/ID</span>
                        <input placeholder="EBL-ID-0001" value={form.proofOfShipment ?? ""} onChange={(e) => update("proofOfShipment", e.target.value)} className={inputClass} />
                    </label>
                </div>
                <div className={boxWrapper}>
                    <h2 className="text-2xl font-semibold mb-4 col-span-2">Payment Information</h2>
                    <label className={fieldWrapper}>
                        <span className={fieldLabel}>Invoice Number (optional)</span>
                        <input placeholder="INV-2025-001" value={form.invoiceNumber ?? ""} onChange={(e) => update("invoiceNumber", e.target.value)} className={inputClass} />
                    </label>
                    <label className={fieldWrapper}>
                        <span className={fieldLabel}>Date of Expiry</span>
                        <input placeholder="YYYY-MM-DD" type="date" value={form.dateOfExpiry ? form.dateOfExpiry.split("T")[0] : ""} onChange={(e) => update("dateOfExpiry", new Date(e.target.value).toISOString())} className={inputClass} />
                    </label>
                    <label className={fieldWrapper}>
                        <span className={fieldLabel}>Currency (ISO)</span>
                        <input placeholder="USDC" value={form.currency ?? ""} onChange={(e) => update("currency", e.target.value)} className={inputClass} />
                    </label>
                    <label className={fieldWrapper}>
                        <span className={fieldLabel}>Amount</span>
                        <input placeholder="e.g. 10000.00" type="number" value={form.currencyAmount ?? 0} onChange={(e) => update("currencyAmount", Number(e.target.value))} className={inputClass} />
                    </label>


                </div>

                <div className={boxWrapper}>
                    <h2 className="text-2xl font-semibold mb-4 col-span-2">Delivery Logistics</h2>
                    <label className={fieldWrapper}>
                        <span className={fieldLabel}>Port of Loading</span>
                        <input placeholder="Shanghai" value={form.portOfLoading ?? ""} onChange={(e) => update("portOfLoading", e.target.value)} className={inputClass} />
                    </label>

                    <label className={fieldWrapper}>
                        <span className={fieldLabel}>Port of Discharge</span>
                        <input placeholder="Rotterdam" value={form.portOfDischarge ?? ""} onChange={(e) => update("portOfDischarge", e.target.value)} className={inputClass} />
                    </label>

                    <label className={fieldWrapper + " col-span-2"}>
                        <span className={fieldLabel}>Final Destination</span>
                        <input placeholder="London, UK" value={form.finalDestination ?? ""} onChange={(e) => update("finalDestination", e.target.value)} className={inputClass} />
                    </label>
                </div>



                <div className={boxWrapper}>
                    <h2 className="text-2xl font-semibold mb-4 col-span-2">Yeild Management</h2>
                    <div className="flex items-center justify-between w-full col-span-2">
                        <label className={fieldWrapper}>
                            <span className={fieldLabel}>Enable Vault Address</span>
                            <div className="flex items-center gap-4">

                            <input type="checkbox" checked={useVault} onChange={(e) => setUseVault(e.target.checked)} className="w-8 h-8" />
                            <span className="text-base ">Use an on-chain pool to accrue interest while in escrow</span>
                            </div>

                        </label>
                    </div>

                    <label className={`${fieldWrapper} ${!useVault ? "opacity-50" : ""} col-span-2`}
                    
                    >
                        <span className={fieldLabel}>Vault Address</span>
                        <input
                            placeholder="0x... or wallet address"
                            value={form.vaultAddress ?? ""}
                            onChange={(e) => update("vaultAddress", e.target.value)}
                            className={`${inputClass}`}
                            disabled={!useVault}
                        />
                    </label>
                </div>





                <div className="col-span-2 mr-auto grid grid-cols-[1fr_1fr] gap-2 mt-4">
                    <button type="submit" className={primaryButton}>Create Escrow</button>
                    <button type="button" onClick={() => {
                        setForm({
                            name: "",
                            counterparty: "",
                            currency: "",
                            currencyAmount: 0,
                            portOfLoading: "",
                            portOfDischarge: "",
                            finalDestination: "",
                            proofOfShipment: "",
                            dateOfExpiry: "",
                            invoiceNumber: "",
                            dateCreated: new Date().toISOString(),
                            dateUpdated: new Date().toISOString(),
                            lastUpdatedBy: "",
                        })
                    }} className={mutedButton}>Reset</button>
                </div>
            </form>
        </div>
    );
}
