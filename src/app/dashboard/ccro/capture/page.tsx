import React from "react";
import { Card } from "@/components/ui/card";

const Page = () => {
  return (
    <Card className="p-6 shadow-md bg-white text-gray-950">
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-extrabold">Computation Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the CCRO Computation Dashboard
        </p>
      </div>
    </Card>
  );
};

export default Page;
