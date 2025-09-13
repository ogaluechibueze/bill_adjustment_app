"use client";

import dynamic from "next/dynamic";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { useState } from "react";
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
import { useEffect } from "react";
import { StatusDialog } from "./StatusDialog";


const AsyncCreatableSelect = dynamic(
  () => import("react-select/async-creatable"),
  { ssr: false }
);

const Select = dynamic(() => import("react-select"), { ssr: false });


// ✅ Validation schema
export const formSchema = z.object({
  globalAcctNo: z.string().min(1, "Global Account No is required"),
  customerName: z.string().min(1, "Customer Name is required"),
  region: z.string().optional(),
  businessUnit: z.string().optional(),
  band: z.string().optional(),
  feederName: z.string().optional(),
  feederId: z.string().optional(),
  source: z.string().optional(),
  customerType: z.string().optional(),
  tariffClass: z.string().optional(),
  tariffClassId: z.string().optional(),
  ticketNo: z.string().optional(),
  adjustmentStartDate: z.string().optional(),
  adjustmentEndDate: z.string().optional(),
  useDefaultCapUnit: z.boolean().optional(),
  ccroremarks: z.string().optional(),
  initialDebt: z.coerce.number().nullable().optional(),
adjustmentAmount: z.coerce.number().nullable().optional(),
defaultCapUnit: z.coerce.number().nullable().optional(),
});


// ✅ Dropdown options
const regions = ["AKURE", "ASABA", "AUCHI", "BENIN NORTH", "BENIN SOUTH", "EKITI", "ONDO", "SAPELE", "WARRI"];

const types = ["NON MD UNMETERED", "NON MD METERED", "MD METERED", "MD UNMETERED"];

const businessUnits = [   "GRA", "ETETE", "SOKPONBA", "EVBUOTUBU", "EVBUORIARIA", "UGBOWO", "UROMI", "AUCHI",
                            "IKPOBA HILL", "OBIARUKU", "WARRI", "SAPELE", "ONDO", "AGBOR", "ADO-EKITI", "IDO-EKITI",
                            "OKADA", "KOKA", "ASABA", "AKURE", "UGHELLI", "UDU", "OWO", "PTI", "IGBARA-OKE",
                            "AKOKO", "OGHARA", "EFFURUN", "OKITIPUPA"
                        ];

const bands = ["A", "B", "C", "D","E"];
  
const feeders = [
                    "33 Direct","ABAVO","ABBI TOWN","ABIGBORODO","ABRAKA COMMERCIAL","ABRAKA LB","ABRAKA MD LB","ABRAKA TOWN","ABUDU-OGHADA","ADEBAYO",
                    "ADEJE","ADEJE LB","ADEYEMI","ADUWAWA","AFAO (IKERE 2)","AFIESERE","AFOKPELLA","AFOR TOWN","AFRICA-HOUSE","AFUZE TOWNSHIP",
                    "AGAGA LAYOUT","AGBARHA","AGBARHO TOWN","AGBARHO/EKU LB","AGBEDE","AGBOR TOWN","AGBOR-OBI","AGENEBODE TOWN","AGESIN-IKERE LB","AGRIC/OLOPE",
                    "AIRPORT (COMMERCIAL)","AIRPORT COMM","AIRPORT ROAD","AJAMIMOGHA","AJEGUNLE","AJILOSUN","AKENBOR","AKPAKPAVA COMMERCIAL","AKUGBA","AKURE-COMMERCIAL",
                    "AKWUKWU-IGBO","ALADJA","ALAGBAKA","ALIFIKEDE","AMAI TOWN","AMAI TOWN - UROMI","AMAUDO TOWN","AMUFI-COMMERCIAL","AMUKPE COMMERCIAL","AMUKPE LOCAL",
                    "AMUKPE TOWN","ANDREW-WILSON","ANWAI","ARMY BARRACK","ARMY BARRACK (OWENA)","ARMY BARRACK AGENEBODE","ARMY BARRACK -AUCHI","ARMY BARRACKS OKITIPUPA","ARMY/IKPESHI LB","ARUE TOWNSHIP",
                    "ARUOGBA","ASABA AIRPORT","ASABA ALLUMINIUM","ASABA -COMMERCIAL","ASABA ROAD","ASIN","ASORO","AT&P","ATANI","AUCHI TOWN",
                    "AUCHI TOWN COMMERCIAL","AVENUE COMMERCIAL","AVIELE","AWOYEMI","AYEDUN","AYEE","AYEE/IRESE","AYOGWIRI","BASIRI","BDPA",
                    "BENDEL ESTATE","BENIN OWENA","BIU","CABINET","CAMPUS 1","CAMPUS 2","CAMPUS 3","CBN","COLLEGE ROAD","COMMUNITY ROAD",
                    "COSTAIN","COUNTRY HOME","Dam","DSC","DUMEZ","DUMEZ ROAD","dummy","EASTERN METAL","EBOH-COMMERCIAL","ECN",
                    "EDJEBA","EDJOPHE","EDO-TEX","EGBA","EGOR","EGORO","EGUADAIKEN","EKAE","EKEHUAN CAMPUS","EKENWAN","EKENWAN BARRACK","EKETE","EKIADOLOR","EKPAN TOWN","EKPOMA TOWN","EKU TOWN","EKUKU-AGBOR",
                    "ELIZADE UNIVERSITY","EL-SHADDAI","EME-ORA","EMIYE","ENERHEN LB","ENWAN","ERAA","ERINJE","ERIO LB","ESTATE","ESTATE-COMMERCIAL","ETERNIT","EVBUOABUOGUN","EVBUOTUBU","EVBUOTUBU LB","EXPRESS (AGBOR)",
                    "EXPRESS (AKURE)","EXPRESS (UGHELLI)","EXPRESS UROMI","EXPRESS-ASABA","EZENEI","FACTORY 1","FACTORY 2","FACTORY 3","FACTORY ROAD","FARM SETTLEMENT","FED. POLY","FEDERAL SECRETARIATE COMMERCIAL","FEEDER 1",
                    "FEEDER 2","FEEDER 3","FEEDER 4","FGGC","FLOUR MILL","FUGAR TOWN","FUPRE","GANA","GARAGE (IKERE 1)","GOVERNANCE VILLA","GOVERNOR","GOVT. HOUSE","GOVT. HOUSE ADO","GRA","GRA (WARRI)","GRA-AUCHI",
                    "GRA-COMMERCIAL","GSM","GUINNESS FACTORY","HOUSING COMPLEX","IBILLO","IBUSA BY-PASS","IBUZOR","IDANRE ROAD","IDANRE TOWN","IDSL COMMERCIAL","IDUMUJE-UGBOKO","IFON","IGARA TOWN","IGBANKE","IGBATORO","IGBE ROAD",
                    "IGBEDE","IGBIDI","IGBOKODA","IGEDE","IGIEDUMA COMMUNITY","IGODAN","IGUOBAZUWA","IGUOSA","IHAMA","IHOVBOR","IJAPO","IJARE/IGBARA OKE LB","IJERO TOWN","IJIGBO COMMERCIAL","IJOKA","IJU LB","IJU/ITAOGBOLU TOWNSHIP",
                    "IKARE","IKHUENIRO","IKOGOSI LB","IKOTA","IKPOBA-HILL-COMMERCIAL","ILE-OLUJI","ILESHA ROAD","ILLAH","ILUTITUN","IMMONIAME","INDUSTRIAL COMMERCIAL","INDUSTRIALTIED TO GANA","IRESE","IRRI","IRRUA","IRUEKPEN","ISE/EMURE",
                    "ISELE ASAGBA","ISELE-MKPITIME","Iselle Azagba","ISINKAN","ISOKO ROAD","ISOKO/KWALE LB","ISSELE MPIKTIME (NOT YET COMMISSIONED)","ISSELE-UKU","ISTH","ISUADA","IVIOGHE","IYANOMO RUBBER RESEACH","IYOWA","JAGBE","JAKPA ROAD",
                    "JAMES HOPE COMMERCIAL","JATTU","JEDO","JEHOVAH'S WITNESS COMPLEX","KOKA COMMERCIAL","KOKO","KOKO TOWN","KOKO-LB","KOROBE","KWALE EXPRESS","KWALE TOWN","LAMPESE","LEVENTIS","LEVENTIS FARM","Limit Road Commercial","LUJOMU LB",
                    "MARBLE HILL","MARIA GORRETI","MARKET (IGBOKODA)","MARKET ROAD (ONDO)","MARKET ROAD (WARRI)","MBH COMMERCIAL","Mc DERMOTT","MD COMMERCIAL","MEDICAL VILLAGE","MICHELLIN","MIX&BAKE -VIO -COMMERCIAL","MOSOGAR","MOSOGAR LB",
                    "NAVAL BASE","NDC","NDC TIED TO EXPRESS UGHELLI","NDDC","NDDC IGBOKODA","NEW BENIN","NEW-AUCHI","NGC","NICOHO BARRACK","NIFOR","OBA-ILE","OBA-KEKERE","OBA-NLA","OBA-PALACE","OBAYANTOR","OBIARUKU TOWN","OBINOBA (TIED TO OBIARUKU)",
                    "OBULUKU","ODA","ODE-AYE LB","ODO-ADO","ODOJOMU","OGBA","OGBEKNU-UMUOLO","OGBONA","Oghara Commercial","OGHARA TOWN LB","OGORODE TOWN","OGUNU ROAD","OGWA-EBELE","OGWASHI-UKU","OGWASHI-UKU COMMERCIAL","OHA","OJIRAMI DAM","OKA",
                    "OKADA","OKE-EDA","OKE-IGBO/IFETEDO LB","OKESHA","OKHORO","Okhoro/Iyayi","OKO","OKOMU","Okotomi","OKPANAM COMMERCIAL","OKPARA INLAND","OKPE","OKPORIE","OKUREKPO","OKWE","OLAM","OLD ROAD","OLEH","OLIHA","OLOGBO","OLOMORO",
                    "OLUKU LB","OLUKU-COMMERCIAL","OMUO LB","ONDO ROAD","ONICHA-UKU","OPOJI","OREROKPE TOWN","ORHUWHORUN ROAD","ORIE","OSADENNIS","OSUTECH","OTEFE","OTE-OKPU","OTERI","OTOVWODO/PATANI LB","OTUO","OUR LADY'S","OVA","OVA TIED TO EGOR",
                    "OVWODOKPOKPO","OWA","OWA-ALERO","OWA-IYIBO","OWENA LB","OWENA/ILE-OLUJI LB","OWHELOGBO","OWO COMMERCIAL","OWO TOWN","OYE TOWN","OYEARUGBULEN","OYEMEKUN","PALACE","PIEDMONT","POLY","PPMC","PRODESCO","PS -COMMERCIAL","PTI ROAD",
                    "PTI SCHOOL","RADIO BENDEL","REFINERY 1 LB","RESERVATION","RIVER SIDE","ROYAL - COMMERCIAL","SAPELE (EFFURUN) LB","SAPELE 33KV LB","SAPELE ROAD","SAPELE/WARRI ROAD","SCHOOL OF EME","SCHOOL-COMMERCIAL","SHELL ROAD","SHOPRITE (ASABA)",
                    "SILUKO","SIO","SOUTH-IBIE","SPC","Specialist","ST. SAVIOUR","STANMARK","SUPER BRU","TEACHER TRAINING COMMERCIAL","TISCO","TOWN","TOWNSHIP","TOWNSHIP (ASABA)","TOWNSHIP-OKITIPUPA","UBEJI","UBIAJA ROAD","UBIAJA TOWN (2.5)","UBTH",
                    "UBULU-OKITI","UDU ROAD","UGBE","UGBOR","UGBORIKOKO","UGBOROKE","UGBOWO","UJAVUN TOWN","UJEMEN -COMMERCIAL","UMUNEDE","UMUTU","UNAD","UNIBEN","UNIBEN COMMERCIAL","UNIBEN EKENWAN","UNIBEN II","UNITY FH","UNIVERSITY","UPPER LAWANI",
                    "UPPER MISSION","UPPER OWINA","UPPER SAPELE","UPPER SILUKO","UPPER SOKPONBA","URHUOKOSA","UROMI TOWN","USELU","USEN","Uteh 1","Uteh 2","UWANHUMI","UWELU","UZERE","WARRAKE","YABA-COMMERCIAL"
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
      tariffClass: "",
      ticketNo: "",
      initialDebt: Number(""),        // ✅ matches z.coerce.number().nullable().optional()
      adjustmentAmount: Number(""),   // ✅ same
      adjustmentStartDate: "",
      adjustmentEndDate: "",
      defaultCapUnit: Number(""),     // ✅ same
      ccroremarks: "",
    },
  });

  const initialDebt = Number(watch("initialDebt") || 0);
  const adjustmentAmount = Number(watch("adjustmentAmount") || 0);
  const balance = initialDebt - adjustmentAmount;

  const startDate = watch("adjustmentStartDate");
  const endDate = watch("adjustmentEndDate");
  const feederId = watch("feederName");
  const type = watch("customerType"); // assuming type maps to tariffClass

   // 🔥 Auto-calc adjustment amount when inputs change
 useEffect(() => {
  async function fetchAdjustment() {
    if (!startDate || !endDate) return;
    if (!watch("feederId") || !watch("tariffClassId")) return;

    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feederId: watch("feederId"),
          tariffClassId: watch("tariffClassId"),
          startDate,
          endDate,
          // ✅ Pass defaultCapUnit only if user selected it
          defaultCapUnit: watch("useDefaultCapUnit") ? watch("defaultCapUnit") : undefined,
        }),
      });

     if (res.ok) {
  const data = await res.json();
  reset({
    ...getValues(),  // keep all the current field values
    adjustmentAmount: data.adjustmentAmount.toFixed(2),
  });
}
    } catch (err) {
      console.error("Error calculating adjustment:", err);
    }
  }

  fetchAdjustment();
}, [
  startDate,
  endDate,
  watch("feederId"),
  watch("tariffClassId"),
  watch("useDefaultCapUnit"),
  watch("defaultCapUnit"),
  reset,
]);

  //Submit handler
  const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
    const payload = {
      ...data,
      balanceAfterAdjustment: balance,
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
      initialDebt: c.totalOutstanding?.toString() ?? "",
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
  <Card className="max-w-4xl sm:max-w-2xl md:max-w-4xl  mx-auto mr-4 px-6 py-4 shadow-xl rounded-2xl bg-white/95 backdrop-blur">
    {/* Header */}
    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl -mx-6 -mt-6 mb-6 px-6 py-3 shadow-md">
      <CardTitle className="text-lg md:text-xl font-bold text-center text-white tracking-wide">
        Unmetered Customer Bill Adjustment Form
      </CardTitle>
    </CardHeader>

    <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* ✅ Global Account No (top-right) */}
        <div className="flex justify-end">
          <div className="w-full md:w-72 space-y-1">
            <Label className="font-medium text-gray-700">Enter Global Account Number</Label>
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
                    field.value
                      ? { label: field.value, value: field.value }
                      : null
                  }
                  isClearable
                  placeholder="🔍 Search / Enter Account Number..."
                  className="rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  formatCreateLabel={(inputValue) =>
                    `Use "${inputValue}" as new account`
                  }
                />
              )}
            />
            {errors.globalAcctNo && (
              <p className="text-sm text-red-500">
                {errors.globalAcctNo.message}
              </p>
            )}
          </div>
        </div>

        {/* ✅ Customer Details Grid */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">📋 Customer Informations</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Text inputs */}
          {[
            ["customerName", "Customer Name"],
            ["source", "Source"],
            ["tariffClass", "Tariff Class"],
            ["ticketNo", "Ticket No"],
          ].map(([k, label]) => (
            <div key={k} className="space-y-2">
              <Label className="font-medium text-gray-700">{label}</Label>
              <Input
                {...register(k as keyof CustomerFormData)}
                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              {errors[k as keyof CustomerFormData] && (
                <p className="text-sm text-red-500">
                  {errors[k as keyof CustomerFormData]?.message as string}
                </p>
              )}
            </div>
          ))}

          {/* Dropdowns */}
          {[
            ["region", "Region", regions],
            ["type", "Customer Type", types],
            ["businessUnit", "Business Unit", businessUnits],
            ["band", "Band", bands],
            ["feederName", "Feeder", feeders],
          ].map(([name, label, options]) => (
            <Controller
              key={name as string}
              name={name as keyof CustomerFormData}
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700">{label}</Label>
                  <Select
                    options={toOptions(options as string[])}
                    value={toOptions(options as string[]).find(
                      (o) => o.value === field.value
                    )}
                    onChange={(val) => field.onChange(val?.value)}
                    isSearchable
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
                
              )}
            />
          ))}

          {/* Initial Debt */}
          <div className="space-y-2">
            <Label>Initial Debt</Label>
            <Input
              type="number"
              {...register("initialDebt")}
              className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>
        </div>
        </div>
        {/* ✅ Adjustment Details Grid */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">⚡Consumption Units & Calculations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="font-medium text-gray-700 flex items-center justify-between">
              Use Default CAP Unit
              <Controller
                name="useDefaultCapUnit"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="bg-blue-400"
                  />
                )}
              />
            </Label>
          </div>

          {watch("useDefaultCapUnit") && (
            <div className="space-y-2">
              <Label>Default CAP Unit</Label>
              <Input
                type="number"
                {...register("defaultCapUnit", { valueAsNumber: true })}
                className="rounded-lg bg-green-300 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Adjustment Amount</Label>
            <Input
              type="number"
              {...register("adjustmentAmount")}
              className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label>Balance After Adjustment</Label>
            <Input
              value={balance}
              disabled
              className="bg-gray-100 text-gray-600 rounded-lg"
            />
          </div>
        </div>
        </div>

        {/* ✅ Dates Grid */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">📅 Adjustment Period</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Adjustment Start Date</Label>
            <Input
              type="date"
              {...register("adjustmentStartDate")}
              className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              max={endDate || undefined}
            />
          </div>

          <div className="space-y-2">
            <Label>Adjustment End Date</Label>
            <Input
              type="date"
              {...register("adjustmentEndDate")}
              className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              min={startDate || undefined}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
        </div>

        {/* ✅ Remarks */}
        <div className="">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📝 CCRO Remarks</h3>
          <Textarea
            rows={3}
            {...register("ccroremarks")}
            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full flex items-center justify-center rounded-xl py-3 font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600"
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
