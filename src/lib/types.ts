// types.ts
export interface CustomerDTO {
    label: string;
    value: string;
    customer?: {
    customerName?: string;
    region?: string;
    customerType?: string;
    businessUnit?: string;
    band?: string;
    feederName?: string;
    source?: string;
    ticketNo?: string;
    initialDebt?: number;
    adjustmentAmount?: number;
    adjustmentStartDate?: string;
    adjustmentEndDate?: string;
    ccroremarks?: string;
  };
}

export interface AccountSelect {
  customer: CustomerDTO;
}
