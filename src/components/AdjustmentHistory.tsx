"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

interface AdjustmentItem {
  id: number;
  month: number;
  year: number;
  consumption: number;
  tariff: number;
  amount: number;
}

interface Adjustment {
  id: number;
  adjustmentStartDate: string;
  adjustmentEndDate: string;
  adjustmentAmount: number | null;
  totalAmount: number | null;
  items: AdjustmentItem[];
}

export default function AdjustmentHistory({ customerId }: { customerId: number }) {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleOpen = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const fetchAdjustments = async () => {
      try {
        const res = await fetch(`/api/adjustments/${customerId}`);
        if (!res.ok) throw new Error("Failed to fetch adjustments");
        const data = await res.json();
        setAdjustments(data.Adjustment || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdjustments();
  }, [customerId]);

  if (loading) return <p className="p-4">Loading adjustment history...</p>;
  if (adjustments.length === 0)
    return <p className="p-4 text-gray-500">No adjustments found.</p>;

  // ✅ helper for comma formatting
  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-3">Adjustment History</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Adjustment Amount</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adjustments.map((adj) => (
            <React.Fragment key={adj.id}>
              {/* Main adjustment row */}
              <TableRow>
                <TableCell>
                  {new Date(adj.adjustmentStartDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(adj.adjustmentEndDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{formatNumber(adj.adjustmentAmount)}</TableCell>
                <TableCell>{formatNumber(adj.totalAmount)}</TableCell>
                
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => toggleOpen(adj.id)}
                  >
                    {openId === adj.id ? "Hide Items" : "View Items"}
                  </Button>
                </TableCell>
              </TableRow>

              {/* Expanded nested table row */}
              {openId === adj.id && (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <div className="ml-6 mt-2 p-4 bg-gray-50 border rounded-lg">
                      <h4 className="font-semibold mb-2 text-gray-700">
                        Adjustment Items
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Consumption</TableHead>
                            <TableHead>Tariff</TableHead>
                            <TableHead>Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adj.items.map((item) => (
                            <TableRow key={item.id} className="bg-white">
                              <TableCell>{item.month}</TableCell>
                              <TableCell>{item.year}</TableCell>
                              <TableCell>
                                {formatNumber(item.consumption)}
                              </TableCell>
                              <TableCell>{formatNumber(item.tariff)}</TableCell>
                              <TableCell>{formatNumber(item.amount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
