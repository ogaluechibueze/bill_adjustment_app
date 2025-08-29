"use client";

import { FC, useState, useTransition } from "react";
import { Customer } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// 🔑 Safe version of Customer
export type SafeCustomer = Omit<
  Customer,
  | "initialDebt"
  | "adjustmentAmount"
  | "balanceAfterAdjustment"
  | "adjustmentStartDate"
  | "adjustmentEndDate"
  | "createdAt"
  | "updatedAt"
> & {
  initialDebt: number | null;
  adjustmentAmount: number | null;
  balanceAfterAdjustment: number | null;
  adjustmentStartDate: string | null;
  adjustmentEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { username: string } | null;
};

// ✅ Convert Prisma → SafeCustomer
export function toSafeCustomer(
  item: Customer & { createdBy?: { username: string } | null }
): SafeCustomer {
  return {
    ...item,
    initialDebt: item.initialDebt ? Number(item.initialDebt) : null,
    adjustmentAmount: item.adjustmentAmount ? Number(item.adjustmentAmount) : null,
    balanceAfterAdjustment: item.balanceAfterAdjustment
      ? Number(item.balanceAfterAdjustment)
      : null,
    adjustmentStartDate: item.adjustmentStartDate
      ? item.adjustmentStartDate.toISOString()
      : null,
    adjustmentEndDate: item.adjustmentEndDate
      ? item.adjustmentEndDate.toISOString()
      : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    createdBy: item.createdBy ?? null,
  };
}

export function toSafeCustomers(
  items: (Customer & { createdBy?: { username: string } | null })[]
): SafeCustomer[] {
  return items.map(toSafeCustomer);
}


// 🔎 Zod schema for readonly view/edit
const viewSchema = z.object({
  globalAcctNo: z.string().nullable(),
  customerName: z.string().nullable(),
  region: z.string().nullable(),
  businessUnit: z.string().nullable(),
  band: z.string().nullable(),
  feederName: z.string().nullable(),
  source: z.string().nullable(),
  ticketNo: z.string().nullable(),
  initialDebt: z.number().nullable(),
  adjustmentAmount: z.number().nullable(),
  balanceAfterAdjustment: z.number().nullable(),
  adjustmentStartDate: z.string().nullable(),
  adjustmentEndDate: z.string().nullable(),
  ccroremarks: z.string().nullable(),
  ccoremarks: z.string().nullable(),
  caoremarks: z.string().nullable(),
  mdremarks: z.string().nullable(),
  status: z.string().nullable(),
  approvalStage: z.string().nullable(),
});

type ViewForm = z.infer<typeof viewSchema>;

const CustomerTable: FC<{ data: SafeCustomer[]; role: string }> = ({ data, role }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<SafeCustomer | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

 const form = useForm<ViewForm>({
  resolver: zodResolver(viewSchema),
  defaultValues: selectedCustomer ?? undefined, // ✅ keep defaults safe
  values: selectedCustomer ?? undefined,        // ✅ ensure correct typing
 });

  // 🔥 Approve/Reject
  const handleConfirm = async () => {
    if (!selectedCustomer || !action) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment, role }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(`Customer ${action}d successfully`);
      window.location.reload();
    } catch (err) {
      toast.error(`Failed to ${action} customer`);
    } finally {
      setLoading(false);
      setAction(null);
      setComment("");
      setSelectedCustomer(null);
    }
  };

  // 🔥 Submit Edit Form
  const handleEditSubmit = async (data: ViewForm) => {
    if (!selectedCustomer) return;
    setLoading(true);

    try {
      // CCRO defaults
      if (role === "CCRO") {
        data.approvalStage = "CCO";
        data.status = "Pending";
      }

      const res = await fetch(`/api/customers/${selectedCustomer.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success("Customer updated successfully");
      setEditDialogOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error("Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden max-w-6xl mx-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Acct No</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Business Unit</TableHead>
            <TableHead>Ticket No</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Approval Stage</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={24} className="text-center text-gray-500 py-6">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50 transition">
                <TableCell>{item.globalAcctNo}</TableCell>
                <TableCell>{item.customerName}</TableCell>
                <TableCell>{item.region ?? "-"}</TableCell>
                <TableCell>{item.businessUnit ?? "-"}</TableCell>
                <TableCell>{item.ticketNo ?? "-"}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.approvalStage}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {/* View */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCustomer(item)}
                        >
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Customer Details</DialogTitle>
                        </DialogHeader>
                        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          {Object.entries(form.getValues())
                            .filter(
                              ([key]) =>
                                !["id", "updatedAt", "createdById", "createdAt","adjustmentEndDate"].includes(key)
                            )
                            .map(([key, value]) => (
                              <div key={key}>
                                <Label className="capitalize">{key}</Label>
                                <Input value={value ?? "-"} readOnly />
                              </div>
                            ))}
                        </form>
                      </DialogContent>
                    </Dialog>

                    {/* Approve/Reject */}
                    {role !== "CCRO" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => {
                            setSelectedCustomer(item);
                            setAction("approve");
                          }}
                        >
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedCustomer(item);
                            setAction("reject");
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {/* Edit only CCRO + Rejected */}
                    {role === "CCRO" && item.status === "Rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          setSelectedCustomer(item);
                          // Set default for CCRO
                          form.reset({ ...item, approvalStage: "CCO", status: "Pending" });
                          setEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Approve/Reject Dialog */}
      <Dialog open={!!action} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Customer" : "Reject Customer"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-500 mb-2">
            Add your {role} remarks before confirming.
          </p>
          <Textarea
            placeholder="Enter your remarks..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px]"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setAction(null);
                setComment("");
              }}
            >
              Cancel
            </Button>
            <Button
              className={action === "approve" ? "bg-green-600" : "bg-red-600"}
              disabled={loading}
              onClick={handleConfirm}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : action === "approve" ? (
                "Confirm Approve"
              ) : (
                "Confirm Reject"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={() => setEditDialogOpen(false)}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <form
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
              onSubmit={form.handleSubmit(handleEditSubmit)}
            >
              {Object.entries(form.getValues())
              .filter(
                ([key]) =>
                  !["id", "updatedAt", "createdById", "createdAt", "adjustmentEndDate"].includes(key)
              )
              .map(([key, value]) => {
                let displayValue = value ?? "-";

                if (key === "createdBy" && value && typeof value === "object") {
                  displayValue = (value as any).username ?? "-"; // 👈 safely extract username
                }

                return (
                  <div key={key}>
                    <Label className="capitalize">{key}</Label>
                    <Input value={displayValue} readOnly />
                  </div>
                );
              })}

              <div className="flex justify-end gap-2 col-span-2 mt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerTable;
