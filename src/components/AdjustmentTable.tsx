"use client";

import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdjustmentItem = {
  id: number;
  month: number;
  year: number;
  consumption: string;
  tariff: string;
  amount: string;
};

type Adjustment = {
  id: number;
  adjustmentStartDate: string | null;
  adjustmentEndDate: string | null;
  adjustmentAmount: string | null;
  items: AdjustmentItem[];
};

type CustomerResponse = {
  id: number;
  globalAcctNo: string;
  customerName: string;
  Adjustment: Adjustment[];
};

export default function AdjustmentTable({ customerId }: { customerId: number }) {
  const { data, error, isLoading } = useSWR<CustomerResponse>(
    `/api/adjustments/${customerId}`,
    (url: string | URL | Request) => fetch(url).then((res) => res.json())
  );

  if (error) return <div className="text-red-500">❌ Failed to load adjustments</div>;
  if (isLoading) return <div>Loading adjustments...</div>;
  if (!data || !data.Adjustment?.length)
    return <div className="text-muted-foreground">No adjustments found</div>;

  return (
    <div className="space-y-6">
      {data.Adjustment.map((adj) => (
        <div key={adj.id} className="rounded-lg border shadow-sm p-4">
          <div className="mb-3">
            <p className="font-semibold">Adjustment Period:</p>
            <p>
              {adj.adjustmentStartDate
                ? new Date(adj.adjustmentStartDate).toLocaleDateString()
                : "-"}{" "}
              →{" "}
              {adj.adjustmentEndDate
                ? new Date(adj.adjustmentEndDate).toLocaleDateString()
                : "-"}
            </p>
            <p>
              <b>Total Adjustment:</b>{" "}
              {adj.adjustmentAmount ? Number(adj.adjustmentAmount).toFixed(2) : "0.00"}
            </p>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Consumption (kWh)</TableHead>
                  <TableHead>Tariff Rate</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adj.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No items for this adjustment
                    </TableCell>
                  </TableRow>
                ) : (
                  adj.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.month}</TableCell>
                      <TableCell>{item.year}</TableCell>
                      <TableCell>{item.consumption}</TableCell>
                      <TableCell>{item.tariff}</TableCell>
                      <TableCell className="font-medium">{item.amount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
