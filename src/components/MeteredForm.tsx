"use client";

import dynamic from "next/dynamic";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StatusDialog } from "./StatusDialog";


const AsyncCreatableSelect = dynamic(
  () => import("react-select/async-creatable"),
  { ssr: false }
);

const Select = dynamic(() => import("react-select"), { ssr: false });

// ✅ helper for comma formatting
  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };


// ✅ Validation schema
const formSchema = z.object({
  globalAcctNo: z.string().min(3, "Global Account No is required"),
  customerName: z.string().min(3, "Customer name is required"),
  region: z.string().optional(),
  businessUnit: z.string().optional(),
  band: z.string().optional(),
  customerType: z.string().optional(),
  source: z.string().optional(),
  marketerName: z.string().optional(),            
  feedbackMarketer: z.string().optional(),        
  pictorialEvidence: z.string().optional(),
  premiseVisit: z.string().optional(),            
  premiseType: z.string().optional(),
  tariffClass: z.string().optional(),
  tariffClassId: z.string().optional(),
  feederName: z.string().optional(),
  feederId: z.string().optional(),
  previousReading: z.coerce.number().optional(),         
  lastReadDate: z.coerce.number().optional(),
  presentReading: z.coerce.number().optional(),
  totalConsumption: z.coerce.number().optional(),
  readingConsistent: z.string().optional(),
  pictureReading: z.coerce.number().optional(),          
  pictureReadingDate: z.string().optional(), 
  ticketNo: z.string().optional(),
  initialDebt: z.coerce.number().optional(),  //total amount billed from start date to end date
  adjustmentAmount: z.coerce.number().optional(),  //computed expected billing amount
  adjustmentStartDate: z.string().optional(),
  previousAdjustment: z.coerce.number().nullable().optional(),  //previous adjustment
  adjustmentEndDate: z.string().optional(),
  adjustmentPeriod: z.coerce.number().nullable().optional(),
  proposedAdjustment: z.coerce.number().nullable().optional(), //adjustment amount//proposed adjustment
  avgBilledAmount: z.coerce.number().nullable().optional(),   //monthly average billed amount
  finalAdjustment: z.coerce.number().nullable().optional(),     //final recommended adjustment
  adjustmentType: z.string().optional(), //type of adjustment(debit or credit)
  currentTotalAmount: z.coerce.number().nullable().optional(),  //total outstanding balance
  resultantBillingAmount: z.coerce.number().nullable().optional(),  //resultant billing amount
  ccroremarks: z.string().optional(),
  avgConsumption: z.coerce.number().optional(),
 

});


// ✅ Dropdown options
const regions = ["AKURE", "ASABA", "AUCHI", "BENIN NORTH", "BENIN SOUTH", "EKITI", "ONDO", "SAPELE", "WARRI"];

const types = ["MD","NON MD"];

const businessUnits = [    "ASABA","AGBOR","AUCHI","EFFURUN","ETETE","EVBUORIARIA","EVBUOTUBU","GRA","KOKA","IKPOBA HILL",
                            "OBIARUKU","OGHARA","OKADA","PTI","SOKPONBA","SAPELE","UGBOWO","UGHELLI","UDU",
                            "UROMI","WARRI","ADO-EKITI","IGBARA-OKE","AKURE","OWO","IDO-EKITI","ONDO","Head Office"
                                                  ];

const bands = ["B","A","E","D","C"];

const adjustment = ["CREDIT","DEBIT"]

const visit = ["YES","NO"]

const premise = ["RESIDENTIAL","HOTEL","EATERY","SCHOOL","FACTORY","HOSTEL","RELIGIOUS"]
  
const feeders = [
  "ISELE-UKU","PS -COMMERCIAL","AGBOR TOWN","UMUNEDE","MARBLE HILL","AGBOR-OBI","GOVT. HOUSE","CABINET","Specialist","ISELE ASAGBA","ASABA -COMMERCIAL","JAMES HOPE","TOWNSHIP","OWA-ALERO","NULL","ANWAI","EXPRESS -ASABA","AGBEDE","OKPELLA TOWN","AGBOR IRRUA","EKPAN TOWN","REFINERY 1","SAPELE (EFFURUN)","AUCHI IKPESHI","UPPER SAPELE","ETETE","GRA-COMMERCIAL","UGBOR","EVBUOABUOGUN","KOKO","EGOR","EVBUOTUBU","EVBUORIARIA","OGHARA TOWN","EKAE","GRA","OBA-PALACE","RESERVATION","IHAMA","OKO",
  "DUMEZ","AIRPORT (COMMERCIAL)","KOKA COMMERCIAL","ASABA ROAD","HEAD BRIDGE","IKPOBA-HILL-COMMERCIAL","UPPER MISSION","EGBA","OGWASHI-UKU","AMUFI-COMMERCIAL","GOVERNANCE VILLA","OKWE","CAMPUS 3","KWALE EXPRESS","COMMUNITY ROAD","ABRAKA","IYOWA","OLUKU","UDU ROAD","FEEDER 3","OUR LADY'S","INDUSTRIAL","BENDEL ESTATE","OGORODE TOWN","ENERHEN","FACTORY ROAD","FEEDER 4","FEEDER 2","UPPER LAWANI","SAPELE (SAPELE)","AMUKPE TOWN","GANA","ISOKO ROAD","ALADJA","EKPOMA TOWN","AGBARHA","UGBOROKE","IRUEKPEN","UGBOWO","MARKET ROAD (WARRI)",
  "ISTH","BASIRI","EBOH-COMMERCIAL","OTOVWODO/PATANI","EDJEBA","SAPELE ROAD","COSTAIN","OGUNU ROAD","EGUADAIKEN","UBIAJA","AJILOSUN","IKERE","EXPRESS UROMI","IGEDE","AGRIC/OLOPE","OKESHA","OKE-EDA","ILESHA ROAD","ELIZADE","OWENA","OWO","IJAPO","IDANRE TOWN","IJERO TOWN","ALAGBAKA","AKURE-COMMERCIAL","ONDO","OTUN","COLLEGE ROAD","PALACE","ILAWE/ARAMOKO","FUTA","ONDO ROAD","YABA-COMMERCIAL","MARKET ROAD (ONDO)","AKURE","IGBE ROAD","MIX&BAKE -VIO -COMMERCIAL","REFINERY 2","MBH  COMMERCIAL",
  "BDPA","Mc DERMOTT","JATTU","GARAGE (IKERE 1)","ODO-ADO","IBUZOR","ABBI TOWN","OWO TOWN","ISE/EMURE","IWOROKO/IKOLE ","ADEBAYO","AYEDUN","OYE TOWN","ASIN","ODOJOMU","OSOSO","IKARE","UGBE","OKITIPUPA","ISUADA","IFON","OKA","ILE-OLUJI","OLIHA","OKUREKPO","OBA-ILE","IJU/ITAOGBOLU TOWNSHIP","EXPRESS (AKURE)","ODA","IJOKA","IGBATORO","IJU","ISINKAN","OBAILE/REC","SOUTH-IBIE","AGENEBODE TOWN","GRA-AUCHI","WARRAKE","AVIELE","AUCHI TOWN",
  "OWA","EXPRESS (AGBOR)","ABUDU-OGHADA","IDANRE ROAD","IGBARA OKE","ASABA ALLUMINIUM","IGARA TOWN","ENWAN","FUGAR TOWN","SPC","AFOKPELLA","IBILLO","AGBOR 6","OSADENNIS","OYEMEKUN","IGBANKE","ATANI","UBIAJA ROAD","IRRUA","UWANHUMI","UROMI TOWN","EHOR","UZEBBA","Okotomi","EGORO","EME-ORA","AGBARHO TOWN","KWALE TOWN","ISOKO/KWALE","ABRAKA TOWN","OBIARUKU TOWN","OHA","UMUTU","EKU TOWN","AGBARHO/EKU","OKPARA INLAND","NDDC","EXPRESS (UGHELLI)","ARUOGBA","UGBORIKOKO",
  "MOSOGAR","SILUKO","IGUOBAZUWA","EKIADOLOR","SAPELE/WARRI ROAD","COUNTRY HOME","ANDREW-WILSON","IKHUENIRO","NEW-AUCHI","AMUKPE LOCAL","OGBA","IGUOSA","ADEJE","GOVERNOR","OTEFE","EXPRESS","ADUWAWA","KOKO TOWN","NEW BENIN","FEDERAL HOUSING ESTATE","EKEHUAN CAMPUS","SHELL ROAD","USEN","OKADA","OLD ROAD","FEEDER 1","PTI ROAD","ESTATE","MARIA GORRETI","UPPER SOKPONBA","ST. SAVIOUR","UPPER SILUKO","RADIO BENDEL","OLEH","UPPER OWINA","IRRI","IGBIDI","EKENWAN","EDO-TEX","OWHELOGBO",
  "EVBUOTUBU/ASORO","DUMEZ ROAD","GRA (WARRI)","AJAMIMOGHA","AFIESERE","OTERI","ASORO","HOUSING COMPLEX","LEVENTIS","ECN","UWELU","OLOGBO","OKPORIE","AKPAKPAVA COMMERCIAL","AGAGA LAYOUT","ABAVO","OKHORO","Uteh 2","EZENEI","USELU","SIO","FGGC","ORHUWHORUN ROAD","DSC","EKETE","UBEJI","JAKPA ROAD","JEDO","AIRPORT ROAD","LAMPESE","AGHOR","IDSL","Uteh 1","WARRI","UJEMEN -COMMERCIAL","ROYAL - COMMERCIAL","MD COMMERCIAL","ESTATE-COMMERCIAL","AJEGUNLE","OKPE",
  "ALIFIKEDE","AYOGWIRI","AWOYEMI","OTUO TOWNSHIP","UJAVUN TOWN","OREROKPE TOWN","KOROBE","0","UZERE","OLOMORO","OVA","EASTERN METAL","MICHELLIN","AFE-BABALOLA","OVWODOKPOKPO","ADO","OBULUKU","ISSELE-UKU","SCHOOL-COMMERCIAL","AMAI TOWN","IHOVBOR","ABIGBORODO","OBAYANTOR","ARMY BARRACK","UNIVERSITY","AGENEBODE","JAGBE","OGBONA","IVIOGHE","OGBEKNU-UMUOLO","GSM","OGWASHI-UKU COMMERCIAL","OLUKU-COMMERCIAL","UniBen","ARMY BARRACK (IKOYA)","STEEL COMPANY 1","STEEL COMPANY 2","NEKPENEKPEN","ERINJE/IRELE","OGWA-EBELE",
  "CEMENT FACTORY","BETA GLASS","ONICHA-UKU","IBUSA BY-PASS","GUINNESS","PTI","ILLAH","OGHARA TEACHING HOSPITAL","OKOMU","MEDICAL VILLAGE","JEHOVAH'S WITNESS COMPLEX","STANMARK","EFFURUN","TOWNSHIP-OKITIPUPA","IGIEDUMA COMMUNITY"
];


type CustomerFormData = z.infer<typeof formSchema>;



export default function CustomerForm() {
   const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<{
    status: "success" | "error" | "warning" | null;
    title: string;
    message: string;
    }>({ status: null, title: "", message: "" });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      globalAcctNo: "",
      customerName: "",
      region: "",
      businessUnit: "",
      band: "",
      feederName: "",
      source: "",
      customerType: "",
      previousReading: undefined,
      presentReading: undefined,
      tariffClass: "",
      ticketNo: "",
      totalConsumption: Number(""),   // ✅ same
      avgBilledAmount: Number(""),
      avgConsumption: Number(""),
      adjustmentStartDate: "",
      currentTotalAmount: Number(""),
      initialDebt: Number(""),
      adjustmentAmount: Number(""),
      adjustmentEndDate: "",
      ccroremarks: "",
    },
  });


  // 📌 Watch values
  const prevReading = Number(watch("previousReading") || 0);
  const presReading = Number(watch("presentReading") || 0);
  const startDate = watch("adjustmentStartDate");
  const previousAdjustment  = Number(watch("previousAdjustment") || 0);
  const endDate = watch("adjustmentEndDate");
  const initialDebt = Number(watch("initialDebt") || 0);
  const adjustmentAmount = Number(watch("adjustmentAmount") || 0);
  // const balance = initialDebt - adjustmentAmount;
  const proposedAdjustment = initialDebt - adjustmentAmount;
  const currentTotalAmount = Number(watch("currentTotalAmount") || 0);
  const finalAdjustment = (Math.abs(proposedAdjustment) - previousAdjustment) || 0
  const balance = Math.abs(currentTotalAmount - finalAdjustment) || 0
  const totalConsumption = Number(watch("totalConsumption")) || 0

  let monthDiff = 0;

if (startDate && endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  monthDiff =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1; 
}
  // ✅ Compute consumption
  const consumption = useMemo(() => {
    return presReading > prevReading ? presReading - prevReading : 0;
  }, [presReading, prevReading]);

  // ✅ Compute average consumption per day
  const avgConsumption = useMemo(() => {
    if (!startDate || !endDate || !consumption) return 0;
     const months =
      (new Date(endDate).getFullYear() - new Date(startDate).getFullYear()) * 12 + 1 +
      (new Date(endDate).getMonth() - new Date(startDate).getMonth());
    return months > 0 ? consumption / months : 0;
  }, [startDate, endDate, consumption]);

   const avgBilledAmount = (initialDebt / monthDiff) || 0
  const feederId = watch("feederName");
  const type = watch("customerType"); // assuming type maps to tariffClass
  const avgComputedBilledAmount = (adjustmentAmount / monthDiff) || 0

// Keep avgConsumption updated in form state
useEffect(() => {
  if (!isNaN(avgConsumption)) {
    setValue("avgConsumption", avgConsumption);
  }
}, [avgConsumption, setValue]);

  // ✅ Auto-update adjustmentAmount based on avgConsumption
useEffect(() => {
  async function fetchAdjustment() {
    if (!startDate || !endDate) return;

    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feederId: watch("feederId"),
          tariffClassId: watch("tariffClassId"),
          startDate,
          endDate,
          avgConsumption: watch("avgConsumption"), // 👈 frontend always passes this now
        }),
      });

      if (res.ok) {
        const data = await res.json();
              reset({
          ...getValues(),  // keep all the current field values
          adjustmentAmount: data.adjustmentAmount.toFixed(2),
          totalConsumption: data.totalConsumption.toFixed(2),
  });
      }
    } catch (err) {
      console.error("Error calculating adjustment:", err);
    }
  }

  if (watch("tariffClassId") && watch("avgConsumption") !== undefined) {
    fetchAdjustment();
  }
}, [startDate, endDate, watch("feederId"), watch("tariffClassId"), watch("avgConsumption"), setValue]);

 //Submit handler
  const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
    const payload = {
      ...data,
      proposedAdjustment: proposedAdjustment,
      adjustmentPeriod: monthDiff,
      balanceAfterAdjustment: balance,
      avgBilledAmount: avgBilledAmount,
      avgConsumption: avgConsumption,
      totalConsumption: totalConsumption,
      presentReading: presReading,
      previousReading: prevReading,
      previousAdjustment: previousAdjustment,
      
    };
  try {
    const res = await fetch("/api/adjustments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setDialogConfig({
        status: "success",
        title: "Success ✅",
        message: "The form has been submitted successfully.",
      });
      setDialogOpen(true);
      reset();
    } else if (res.status === 400) {
      setDialogConfig({
        status: "warning",
        title: "Validation Error",
        message: "Some fields are missing or invalid. Please check and try again.",
      });
      setDialogOpen(true);
    } else if (res.status === 409) {
      setDialogConfig({
        status: "error",
        title: "Duplicate Account",
        message: "An account with this Global Account Number already exists. Please use a different number.",
      });
      setDialogOpen(true);
    } else if (res.status === 500) {
      setDialogConfig({
        status: "error",
        title: "Server Error",
        message: "Something went wrong on our end. Please try again later.",
      });
      setDialogOpen(true);
    } else {
      setDialogConfig({
        status: "error",
        title: "Unexpected Error",
        message: `Unexpected error (code ${res.status}).`,
      });
      setDialogOpen(true);
    }
  } catch (err) {
    console.error("Network error:", err);
    setDialogConfig({
      status: "error",
      title: "Network Error",
      message: "Please check your internet connection and try again.",
    });
    setDialogOpen(true);
  }
};

  // ✅ Helper to convert to react-select options
  const toOptions = (arr: string[]) => arr.map((v) => ({ label: v, value: v }));

  // ✅ Load accounts from backend
  const loadAccounts = async (inputValue: string) => {
  if (!inputValue) return [];
  try {
    const res = await fetch(`/api/customers/search?query=${inputValue}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((c: any) => ({
      label: `${c.globalAcctNo} - ${c.customerName}`,
      value: c.globalAcctNo,
      customer: c,
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
};

 // ✅ When user selects an account → auto fill
const handleAccountSelect = (selected: any) => {
  if (!selected) return;

  const acctNo = selected.value;

  if (selected.customer) {
    const c = selected.customer;

    reset({
      globalAcctNo: acctNo,
      customerName: c.customerName ?? "",
      region: c.region ?? "",
      businessUnit: c.businessUnit ?? "",
      band: c.band ?? "",
      customerType: c.customerType ?? "",
      source: c.source ?? "",

      // ✅ feeder + tariff (flattened from API)
      feederName: c.feederName ?? "",
      feederId: c.feederId?.toString() ?? "",
      tariffClass: c.tariffClassName ?? "",
      tariffClassId: c.tariffClassId?.toString() ?? "",

      ticketNo: c.ticketNo ?? "",
      initialDebt: c.amountBilled?.toString() ?? "",
      previousAdjustment: c.previousAdjustment?.toString() ?? "",
      currentTotalAmount: c.totalOutstanding?.toString() ?? "",
    });
  } else {
    reset((prev) => ({
      ...prev,
      globalAcctNo: acctNo,
    }));
  }
};


  return (
   <div className="">
  <Card className="max-w-4xl mx-auto mr-4 px-6 py-4 shadow-xl rounded-2xl bg-white/95 backdrop-blur">
    {/* Header */}
    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl -mx-6 -mt-6 mb-6 px-6 py-3 shadow-md">
      <CardTitle className="text-lg md:text-xl font-bold text-center text-white tracking-wide">
        Metered Customer Bill Adjustment Form
      </CardTitle>
    </CardHeader>

    <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Global Account No (Top Right) */}
        <div className="flex justify-end">
          <div className="w-full md:w-72 space-y-1">
            <Label className="text-sm font-medium text-gray-700">Enter Global Account Number</Label>
            <Controller
              name="globalAcctNo"
              control={control}
              render={({ field }) => (
                <AsyncCreatableSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadAccounts}
                  onChange={(val) => {
                    field.onChange(val?.value);
                    handleAccountSelect(val);
                  }}
                  value={
                    field.value ? { label: field.value, value: field.value } : null
                  }
                  isClearable
                  placeholder="🔍 Search / Enter Account Number"
                  className="text-sm rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  formatCreateLabel={(inputValue) =>
                    `Use "${inputValue}" as new account`
                  }
                />
              )}
            />
            {errors.globalAcctNo && (
              <p className="text-xs text-red-500">{errors.globalAcctNo.message}</p>
            )}
          </div>
        </div>

        {/* Customer Info Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">📋 Customer Informations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              ["customerName", "Customer Name"],
              ["source", "Source"],
              ["tariffClass", "Tariff Class"],
              ["ticketNo", "Ticket Number"],
            ].map(([k, label]) => (
              <div key={k} className="space-y-1">
                <Label className="text-sm font-medium">{label}</Label>
                <Input
                  {...register(k as keyof CustomerFormData)}
                  className="text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
            ))}

            {[
              ["region", "Region", regions],
              ["type", "Customer Type", types],
              ["businessUnit", "Business Unit", businessUnits],
              ["band", "Band", bands],
              ["feederName", "Feeder Name", feeders],
            ].map(([name, label, options]) => (
              <Controller
                key={name as string}
                name={name as keyof CustomerFormData}
                control={control}
                render={({ field }) => (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">{label}</Label>
                    <Select
                      options={toOptions(options as string[])}
                      value={toOptions(options as string[]).find(
                        (o) => o.value === field.value
                      )}
                      onChange={(val) => field.onChange(val?.value)}
                      isSearchable
                      className="text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                )}
              />
            ))}

                    <Controller
                          name ="premiseType"
                          control={control}
                          render={({ field }) => (
                            <div className="space-y-2">
                              <Label className="font-medium text-gray-700">Type of Premise</Label>
                              <Select
                                options={premise.map((p) => ({ value: p, label: p }))}
                                value={premise.map((p) => ({ value: p, label: p })).find((o) => o.value === field.value) || null}
                                onChange={(val) => field.onChange(val?.value)}
                              />
                            </div>
                          )}
                        />
                           <Controller
                          name ="adjustmentType"
                          control={control}
                          render={({ field }) => (
                            <div className="space-y-2">
                              <Label className="font-medium text-gray-700">Type of Adjustment</Label>
                              <Select
                                options={adjustment.map((p) => ({ value: p, label: p }))}
                                value={adjustment.map((p) => ({ value: p, label: p })).find((o) => o.value === field.value) || null}
                                onChange={(val) => field.onChange(val?.value)}
                              />
                            </div>
                          )}
                        />
                         <Controller
                          name ="premiseVisit"
                          control={control}
                          render={({ field }) => (
                            <div className="space-y-2">
                              <Label className="font-medium text-gray-700">Was Premise Visited</Label>
                              <Select
                                options={visit.map((p) => ({ value: p, label: p }))}
                                value={visit.map((p) => ({ value: p, label: p })).find((o) => o.value === field.value) || null}
                                onChange={(val) => field.onChange(val?.value)}
                              />
                            </div>
                          )}
                        />

            {/* Initial Debt */}
             <div className="space-y-2">
                        <Label>Actual Billed Amount</Label>
                        <Input
                           type="text"
                          value={initialDebt ? formatNumber(Number(initialDebt)) : ""}
                          onChange={(e) => {
                            // remove commas for raw numeric value
                            const rawValue = e.target.value.replace(/,/g, "");
                            const num = rawValue ? Number(rawValue) : undefined;
            
                            setValue("initialDebt", num, { shouldValidate: true });
                          }}
                          className="text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                      </div>
            <div className="space-y-2">
                        <Label>Total Outstanding Balance</Label>
                        <Input
                           type="text"
                          value={currentTotalAmount ? formatNumber(Number(currentTotalAmount)) : ""}
                          onChange={(e) => {
                            // remove commas for raw numeric value
                            const rawValue = e.target.value.replace(/,/g, "");
                            const num = rawValue ? Number(rawValue) : undefined;
            
                            setValue("currentTotalAmount", num, { shouldValidate: true });
                          }}
                          className="text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                      </div>
                      <div className="space-y-2">
                                  <Label>Previous Adjustment</Label>
                                  <Input
                                     type="text"
                                    value={previousAdjustment ? formatNumber(Number(previousAdjustment )) : ""}
                                    onChange={(e) => {
                                      // remove commas for raw numeric value
                                      const rawValue = e.target.value.replace(/,/g, "");
                                      const num = rawValue ? Number(rawValue) : undefined;
                      
                                      setValue("previousAdjustment", num, { shouldValidate: true });
                                    }}
                                    className="text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                                  />
                        </div>
          </div>
        </div>

        {/* Readings & Calculations */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">⚡Meter Reading & Calculations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <Label>Previous Reading</Label>
              <Input
                type="number"
                
                {...register("previousReading")}
                className="text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
            <div className="space-y-1">
              <Label>Present Reading</Label>
              <Input
                type="number"
                {...register("presentReading")}
                className="text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
            <div className="space-y-1">
              <Label>Total Consumption</Label>
              <Input
                type="number"
                value={consumption}
                disabled
                className="text-sm bg-gray-100 text-gray-600 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label>Avg Consumption per Month</Label>
              <Input
                value={avgConsumption.toFixed(2)}
                disabled
                className="text-sm bg-gray-100 text-gray-600 rounded-lg"
              />
            </div>
            <div className="space-y-2">
                        <Label> Computed Expected Bill Amount</Label>
                        <Input
                          type="text"
                          value={adjustmentAmount ? formatNumber(Number(adjustmentAmount)) : ""}
                          onChange={(e) => {
                            // remove commas for raw numeric value
                            const rawValue = e.target.value.replace(/,/g, "");
                            const num = rawValue ? Number(rawValue) : undefined;
            
                            setValue("adjustmentAmount", num, { shouldValidate: true });
                          }}
                          className="text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 font-bold"
                          disabled
                        />
                      </div>
            <div className="space-y-2">
                        <Label>Average for Actual Billed Amount</Label>
                        <Input
                          value={formatNumber(avgBilledAmount)}
                          disabled
                          className="bg-gray-100 text-gray-600 rounded-lg font-bold"
                        />
              </div>
              <div className="space-y-2">
                          <Label>Average for Computed Billed Amount</Label>
                          <Input
                            value={formatNumber(avgComputedBilledAmount)}
                            disabled
                            className="bg-gray-100 text-gray-600 rounded-lg font-bold"
                          />
                </div>
                <div className="space-y-2">
                            <Label>Average for Computed Billed Amount</Label>
                            <Input
                              value={formatNumber(avgComputedBilledAmount)}
                              disabled
                              className="bg-gray-100 text-gray-600 rounded-lg font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                                      <Label>Average Consumption</Label>
                                      <Input
                                        value={formatNumber(avgConsumption)}
                                        disabled
                                        className="bg-gray-100 text-gray-600 rounded-lg font-bold"
                                      />
                                    </div>
             <div className="space-y-2">
                         <Label>Proposed Adjustment Amount</Label>
                         <Input
                           value={formatNumber(proposedAdjustment)}
                           disabled
                           className="bg-gray-100 text-gray-600 rounded-lg font-bold"
                         />
                       </div>                       
            
            </div>
            <div className="space-y-1">
              <Label>Balance After Adjustment</Label>
              <Input
                value={balance}
                disabled
                className="text-sm bg-gray-100 text-gray-600 rounded-lg"
              />
            </div>
          </div>
        {/* Date Range */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">📅 Adjustment Period</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label>Adjustment Start Date</Label>
              <Input
                type="date"
                {...register("adjustmentStartDate")}
                className="text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                max={endDate || undefined}
              />
            </div>
            <div className="space-y-1">
              <Label>Adjustment End Date</Label>
              <Input
                type="date"
                {...register("adjustmentEndDate")}
                className="text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                min={startDate || undefined}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">📝 CCRO Remarks</h3>
          <Textarea
            rows={3}
            {...register("ccroremarks")}
            className="w-full text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full flex items-center justify-center rounded-xl py-3 font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Submit
            </>
          )}
        </Button>
      </form>
       {/* ✅ Dialog for feedback */}
             <StatusDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              status={dialogConfig.status}
              title={dialogConfig.title}
              message={dialogConfig.message}
            />
    </CardContent>
  </Card>
</div>
  );
}
