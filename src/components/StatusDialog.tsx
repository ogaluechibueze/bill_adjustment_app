"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

type StatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: "success" | "error" | "warning" | null;
  title: string;
  message: string;
};

export function StatusDialog({ open, onOpenChange, status, title, message }: StatusDialogProps) {
  const icon =
    status === "success" ? (
      <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
    ) : status === "warning" ? (
      <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
    ) : status === "error" ? (
      <XCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center rounded-2xl shadow-lg">
        <DialogHeader>
          {icon}
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-base text-gray-600">{message}</DialogDescription>
        </DialogHeader>
        <Button onClick={() => onOpenChange(false)} className="w-full mt-4">
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
}
