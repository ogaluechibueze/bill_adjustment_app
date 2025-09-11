"use client"

import { FC, useEffect, useState, useTransition } from "react";
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
import AdjustmentHistory from "./AdjustmentHistory";

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
  globalAcctNo: z.string().nullable().describe("Account Number"),
  customerName: z.string().nullable().describe("Customer Name"),
  region: z.string().nullable().describe("Region"),
  businessUnit: z.string().nullable().describe("Business Unit"),
  band: z.string().nullable().describe("Band"),
  feederName: z.string().nullable().describe("Feeder Name"),
  source: z.string().nullable().describe("Source"),
  ticketNo: z.string().nullable().describe("Ticket Number"),
  initialDebt: z.number().nullable().describe("Initial Debt"),
  adjustmentAmount: z.number().nullable().describe("Adjustment Amount"),
  balanceAfterAdjustment: z.number().nullable().describe("Balance After Adjustment"),
  adjustmentStartDate: z.string().nullable().describe("Adjustment Start Date"),
  adjustmentEndDate: z.string().nullable().describe("Adjustment End Date"),
  ccroremarks: z.string().nullable().describe("CCRO Remarks"),
  hccremarks: z.string().nullable().describe("HCC Remarks"),
  bmremarks: z.string().nullable().describe("BM Remarks"),
  rhremarks: z.string().nullable().describe("RH Remarks"),
  raremarks: z.string().nullable().describe("RA Remarks"),
  iaremarks: z.string().nullable().describe("IA Rmarks"),
  ciaremarks: z.string().nullable().describe("CIA Remarks"),
  mdremarks: z.string().nullable().describe("MD Remarks"),
  status: z.string().nullable().describe("Status"),
  approvalStage: z.string().nullable().describe("Approval Stage"),
});

type ViewForm = z.infer<typeof viewSchema>;

const CustomerTable: FC<{ data: SafeCustomer[]; role: string }> = ({ data, role }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<SafeCustomer | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false)

 const form = useForm<ViewForm>({
  resolver: zodResolver(viewSchema),
  defaultValues: selectedCustomer ?? undefined, // ✅ keep defaults safe
  values: selectedCustomer ?? undefined,        // ✅ ensure correct typing
 });

 // ✅ Watch form values for recalculation
const startDate = form.watch("adjustmentStartDate");
const endDate = form.watch("adjustmentEndDate");
const initialDebt = form.watch("initialDebt") || 0;

// ✅ Automatically recompute adjustment amount when dates change
useEffect(() => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start <= end) {
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth()) +
        1;

      const monthlyAmount = months > 0 ? initialDebt / months : 0;

      form.setValue("adjustmentAmount", monthlyAmount);
      form.setValue("balanceAfterAdjustment", initialDebt - monthlyAmount);
    }
  }
}, [startDate, endDate, initialDebt, form]);

 // ✅ helper for comma formatting
  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Date formatter
const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "-";

  // Format as DD/MM/YYYY
  return date.toLocaleDateString("en-GB");
};

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
        data.approvalStage = "HCC";
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
        <Table className="w-full border-collapse text-sm">
  <TableHeader className="">
    <TableRow className="bg-green-50 ">
      <TableHead className="text-gray-700 font-bold text-center">Acct No</TableHead>
      <TableHead className="text-gray-700 font-bold text-center">Customer Name</TableHead>
      <TableHead className="text-gray-700 font-bold text-center">Region</TableHead>
      <TableHead className="text-gray-700 font-bold text-center">Business Unit</TableHead>
      <TableHead className="text-gray-700 font-bold text-center">Ticket No</TableHead>
      <TableHead className="text-gray-700 font-bold text-center">Status</TableHead>
      <TableHead className="text-gray-700 font-bold text-center">Approval Stage</TableHead>
    </TableRow>
  </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={24} className="text-center text-gray-500 py-6 items-center">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50 transition text-center">
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
                          className="hover:bg-gray-50 hover:text-black"
                          onClick={() => setSelectedCustomer(item)}
                        >
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl w-full max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Customer Details</DialogTitle>
                        </DialogHeader>
                        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          {Object.entries(form.getValues())
                            .filter(([key]) => !["id", "updatedAt", "createdById", "createdAt"].includes(key))
                            .map(([key, value]) => {
                              let displayValue = value ?? "-";

                              if (key === "createdBy" && value && typeof value === "object") {
                                displayValue = (value as any).username ?? "-";
                              }

                              const schemaShape = (viewSchema.shape as any)[key];
                              const label = schemaShape?.description ?? key;

                              const remarksFields = [
                                "ccroremarks",
                                "hccremarks",
                                "bmremarks",
                                "rhremarks",
                                "raremarks",
                                "iaremarks",
                                "ciaremarks",
                                "mdremarks",
                              ];

                              const dateFields = ["adjustmentStartDate", "adjustmentEndDate"];

                              const amountFields = [
                                "adjustmentAmount",
                                "initialDebt",
                                "balanceAfterAdjustment",
                              ];

                              if (dateFields.includes(key)) {
                                displayValue = formatDate(value as string | Date | null | undefined);
                              } else if (amountFields.includes(key)) {
                                displayValue = formatNumber(value as number | null | undefined);
                              }

                              return (
                                <div key={key} className="space-y-1">
                                  <Label className="text-green-500">{label}</Label>
                                  {remarksFields.includes(key.toLowerCase()) ? (
                                    <Textarea
                                      value={String(displayValue)}
                                      readOnly
                                      className="resize-none bg-gray-50"
                                    />
                                  ) : (
                                    <Input value={String(displayValue)} readOnly className="bg-gray-50" />
                                  )}
                                </div>
                              );
                            })}
                        </form>

                        {/* ✅ Toggle button */}
                        {selectedCustomer && (
                          <div className="mt-6">
                            <Button
                              size="sm"
                              onClick={() => setShowHistory((prev) => !prev)}
                            >
                              {showHistory ? "Hide Adjustment History" : "Show Adjustment History"}
                            </Button>

                            {showHistory && (
                              <div className="mt-4">
                                <AdjustmentHistory customerId={selectedCustomer.id} />
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Approve/Reject */}
                    {role !== "CCRO" && (
                      <>
                        <Button
                          size="sm"
                          className="text-gray-100 hover:bg-gray-50 bg-green-600 hover:text-black"
                          onClick={() => {
                            setSelectedCustomer(item);
                            setAction("approve");
                          }}
                        >
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          className=" hover:bg-red-50 hover:text-black"
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
                          // Set default for HCC
                          form.reset({ ...item, approvalStage: "HCC", status: "Pending" });
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
  <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold text-green-600">
        Edit Customer
      </DialogTitle>
    </DialogHeader>

    {selectedCustomer && (
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6"
        onSubmit={form.handleSubmit(handleEditSubmit)}
      >
        {Object.entries(form.getValues())
          .filter(([key]) => !["id", "updatedAt", "createdById", "createdAt", "createdBy", "approvalStage"].includes(key))
          .map(([key, value]) => (
            <div key={key} className="space-y-1">
              <Label className="capitalize text-sm font-medium text-gray-700">
                {key}
              </Label>

              {/* 🔑 Special handling */}
              {key === "adjustmentStartDate" || key === "adjustmentEndDate" ? (
                <Input
                  type="date"
                  {...form.register(key as keyof ViewForm)}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
              ) : key === "balanceAfterAdjustment" ? (
                <Input
                  value={
                    Number(form.getValues("initialDebt") || 0) -
                    Number(form.getValues("adjustmentAmount") || 0)
                  }
                  disabled
                  className="bg-gray-100 rounded-lg"
                />
              ) : key === "adjustmentAmount" ? (
                <Input
                  value={formatNumber(form.getValues("adjustmentAmount"))}
                  disabled
                  className="bg-gray-100 rounded-lg"
                />
              ) : ["hccremarks", "bmremarks","rhremarks","raremarks","iaremarks","ciaremarks", "mdremarks"].includes(key) && role === "CCRO" ? (
                <Textarea {...form.register(key as keyof ViewForm)} readOnly />
              ) : key.includes("remarks") ? (
                <Textarea
                  {...form.register(key as keyof ViewForm)}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
              ) : (
                <Input
                  {...form.register(key as keyof ViewForm)}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
              )}
            </div>
          ))}

        <div className="flex justify-end gap-3 col-span-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditDialogOpen(false)}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
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