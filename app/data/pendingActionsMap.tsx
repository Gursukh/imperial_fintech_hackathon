import React from "react";
import type { EscrowStatus } from "../types";

type ActionHandlers = {
    onArchiveEscrow?: () => void;
    onCancelEscrow?: () => void;
    onSignEscrow?: () => void;
    onWithdrawFunds?: () => void;
    onDepositFunds?: () => void;
    onUploadProofOfShipment?: () => void;
};

// Lookup map for pending actions content based on escrow status
export const pendingActionsMap: Record<
    EscrowStatus, 
    { 
        description: string; 
        actions: (handlers: ActionHandlers) => React.ReactNode;
    }
> = {
    "draft": {
        description: "This escrow is still in draft mode. Complete the details and submit for signature.",
        actions: () => (
            <>
                <button className="cursor-pointer w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Edit Draft
                </button>
                <button className="cursor-pointer w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    Delete Draft
                </button>
            </>
        ),
    },
    "pending signature": {
        description: "Awaiting your signature to activate this escrow agreement.",
        actions: (handlers) => (
            <>
                <button 
                    onClick={handlers.onSignEscrow}
                    className="cursor-pointer w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Sign Escrow
                </button>
                <button 
                    onClick={handlers.onCancelEscrow}
                    className="cursor-pointer w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Cancel Escrow
                </button>
            </>
        ),
    },
    "pending payment": {
        description: "The escrow agreement is signed. Waiting for payment to be deposited into the vault.",
        actions: (handlers) => (
            <>
                <button 
                    onClick={handlers.onDepositFunds}
                    className="cursor-pointer w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Deposit Funds
                </button>
            </>
        ),
    },
    "pending shipment": {
        description: "Payment received. Awaiting proof of shipment to release funds.",
        actions: (handlers) => (
            <>
                <button 
                    onClick={handlers.onUploadProofOfShipment}
                    className="cursor-pointer w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Upload Proof of Shipment
                </button>
            </>
        ),
    },
    "funds available": {
        description: "All conditions met. Funds are available for withdrawal.",
        actions: (handlers) => (
            <>
                <button 
                    onClick={handlers.onWithdrawFunds}
                    className="cursor-pointer w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Withdraw Funds
                </button>
            </>
        ),
    },
    "expired": {
        description: "This escrow has expired. Funds will be returned to the payer if not already withdrawn.",
        actions: (handlers) => (
            <>
                <button 
                    onClick={handlers.onArchiveEscrow}
                    className="cursor-pointer w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Archive Escrow
                </button>
            </>
        ),
    },
    "cancelled": {
        description: "This escrow has been cancelled and is no longer active.",
        actions: () => (
            <>
                <p className="text-gray-500 italic">No actions available for cancelled escrows.</p>
            </>
        ),
    },
};
