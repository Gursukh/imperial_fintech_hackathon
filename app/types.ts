// Shared types for the application

// Common currency representation
export type Currency = string // e.g. 'USD', 'EUR', 'GBP'

// Allowed escrow status values
export type EscrowStatus =
	| 'pending'
	| 'active'
	| 'completed'
	| 'expired'
	| 'cancelled'

export type Escrow = {
	// Human-readable name for the escrow
	name: string

	// Counterparty involved in the escrow (company/person)
	counterparty: string

	// Currency code for the amounts (ISO 4217 string)
	currency: Currency

	// Numeric amount in smallest currency unit or as a decimal number string
	currencyAmount: number

	// Ports and destinations
	portOfLoading: string
	portOfDischarge: string
	finalDestination: string

	// Proof of shipment: electronic bill of lading (EBL) - could be a URL or an id
	proofOfShipment?: string | null

	// Expiry date of the escrow
	dateOfExpiry: string // ISO 8601 date string

	// Current status
	status: EscrowStatus

	// Invoice reference
	invoiceNumber?: string | null

	// Optional on-chain vault address associated with this escrow (e.g., wallet or contract)
	vaultAddress?: string | null

	// Audit timestamps
	dateCreated: string // ISO 8601
	dateUpdated?: string // ISO 8601

	// The last user or system actor who updated the escrow
	lastUpdatedBy?: string | null
}

export default Escrow
