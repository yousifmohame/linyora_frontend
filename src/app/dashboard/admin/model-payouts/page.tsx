"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "@/lib/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AdminNav from "@/components/dashboards/AdminNav";
import {
  Download,
  Activity,
  Filter,
  AlertTriangle,
  Search,
  MoreHorizontal,
  Lock,
  Unlock,
  RefreshCcw,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  Briefcase,
  Megaphone,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Types & Interfaces ---

type TransactionType =
  | "product_sale"
  | "subscription_fee"
  | "promotion_fee"
  | "withdrawal"
  | "refund"
  | "penalty"
  | "other";

type TransactionStatus =
  | "completed"
  | "pending"
  | "on_hold"
  | "cancelled"
  | "processing";

interface Transaction {
  id: string; // Display ID (TXN-123)
  db_id: number; // Real DB ID for API calls
  reference_id: string;
  type: TransactionType;
  amount: number;
  net_amount: number;
  currency: string;
  status: TransactionStatus;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  description: string;
  date: string;
  notes?: string;
}

interface FinancialStats {
  total_revenue: number;
  total_gmv: number;
  subscriptions_income: number;
  promotions_income: number;
  sales_commission: number;
  held_funds: number;
}

// --- Helper Functions ---

const formatCurrency = (amount: number, currency = "SAR") => {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const getTypeLabel = (type: TransactionType) => {
  const map: Record<
    TransactionType,
    { label: string; icon: any; color: string }
  > = {
    product_sale: {
      label: "عمولات مبيعات",
      icon: Briefcase,
      color: "text-blue-600",
    },
    subscription_fee: {
      label: "اشتراك شهري",
      icon: RefreshCcw,
      color: "text-purple-600",
    },
    promotion_fee: {
      label: "ترويج إعلاني",
      icon: Megaphone,
      color: "text-orange-600",
    },
    withdrawal: {
      label: "سحب رصيد",
      icon: ArrowUpCircle,
      color: "text-red-600",
    },
    refund: {
      label: "استرداد أموال",
      icon: ArrowDownCircle,
      color: "text-gray-600",
    },
    penalty: {
      label: "غرامة / خصم",
      icon: AlertTriangle,
      color: "text-rose-600",
    },
    other: { label: "عملية أخرى", icon: Activity, color: "text-gray-500" },
  };
  return map[type] || map.other;
};

const getStatusBadge = (status: TransactionStatus) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
          مكتمل
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
          معلق
        </Badge>
      );
    case "on_hold":
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200 animate-pulse">
          محجوز (نزاع)
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
          قيد المعالجة
        </Badge>
      );
    default:
      return <Badge variant="outline">ملغى</Badge>;
  }
};

// --- Mappers (Updated to match Backend V2) ---
const mapBackendType = (type: string): TransactionType => {
  if (type === "subscription_payment") return "subscription_fee";
  if (type === "promotion_fee") return "promotion_fee";
  if (
    [
      "sale_earning",
      "shipping_earning",
      "cod_commission_deduction",
      "commission_deduction",
      "agreement_fee",
      "agreement_income",
    ].includes(type)
  )
    return "product_sale";
  if (type === "payout") return "withdrawal";
  if (type === "refund") return "refund";
  return "other";
};

const mapBackendStatus = (status: string): TransactionStatus => {
  if (status === "cleared" || status === "paid") return "completed";
  if (status === "pending_clearance" || status === "pending") return "pending";
  if (status === "on_hold") return "on_hold";
  if (status === "cancelled") return "cancelled";
  return "processing";
};

export default function AdvancedFinancialReports() {
  // --- States ---
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);

  // Filters
  const [dateRange, setDateRange] = useState("30_days");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Action Sheet
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Real Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rangeMap: Record<string, string> = {
          today: "today",
          "7_days": "week",
          "30_days": "month",
          year: "year",
        };
        const queryRange = rangeMap[dateRange] || "month";

        // ✅ استدعاء الـ API الحقيقي
        const response = await axios.get(
          `/admin/financial-reports?range=${queryRange}`,
        );
        const { stats: apiStats, transactions: apiTransactions } =
          response.data;

        // 1. تهيئة المعاملات
        const formattedTransactions: Transaction[] = apiTransactions.map(
          (tx: any) => ({
            id: `TXN-${tx.id}`,
            db_id: tx.id, // نحتفظ بالرقم الحقيقي لعمليات التعديل
            reference_id: tx.reference_id ? `REF-${tx.reference_id}` : "N/A",
            type: mapBackendType(tx.type),
            amount: Math.abs(Number(tx.amount)),
            net_amount: Math.abs(Number(tx.amount)),
            currency: "SAR",
            status: mapBackendStatus(tx.status),
            user: {
              id: tx.userId,
              name: tx.user || "مستخدم",
              email: tx.email || "غير متوفر",
              role: tx.userType || "user",
            },
            description: tx.description,
            date: tx.date,
          }),
        );

        setData(formattedTransactions);

        // 2. تعيين الإحصائيات مباشرة من الباك إند (لأنه أصبح يرسلها مفصلة)
        setStats({
          total_revenue: Number(apiStats.revenue) || 0,
          total_gmv: Number(apiStats.gmv) || 0,
          subscriptions_income: Number(apiStats.subscriptions_income) || 0,
          promotions_income: Number(apiStats.promotions_income) || 0,
          sales_commission: Number(apiStats.sales_commission) || 0,
          held_funds: Number(apiStats.held_funds) || 0,
        });
      } catch (error) {
        console.error("Error fetching financial reports:", error);
        toast.error("فشل تحميل البيانات المالية");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // --- Filter Logic ---
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reference_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === "all" || item.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [data, searchQuery, filterType]);

  // --- Handlers ---

  // 1. PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Linyora Financial Report", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 30, {
      align: "center",
    });

    const tableColumn = ["ID", "User", "Type", "Amount", "Status", "Date"];
    const tableRows: any[] = [];

    filteredData.forEach((tx) => {
      const txData = [
        tx.id,
        tx.user.name,
        tx.type,
        `${tx.amount} SAR`,
        tx.status,
        new Date(tx.date).toLocaleDateString(),
      ];
      tableRows.push(txData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      headStyles: { fillColor: [225, 29, 72] },
    });

    doc.save(`linyora_financial_report_${Date.now()}.pdf`);
    toast.success("تم تصدير التقرير بنجاح");
  };

  // 2. Intervention Handlers (Real API)
  const handleTransactionAction = async (
    action: "hold" | "release" | "refund",
  ) => {
    if (!selectedTx) return;
    setActionLoading(true);

    try {
      // ✅ استدعاء الـ API الحقيقي لتنفيذ الإجراء المالي
      // نستخدم db_id وليس string ID
      await axios.put(`/admin/transactions/${selectedTx.db_id}/action`, {
        action: action,
      });

      let newStatus: TransactionStatus = selectedTx.status;
      if (action === "hold") newStatus = "on_hold";
      if (action === "release") newStatus = "completed";
      if (action === "refund") newStatus = "cancelled";

      // تحديث الحالة محلياً في الجدول
      const updatedData = data.map((t) =>
        t.id === selectedTx.id ? { ...t, status: newStatus } : t,
      );
      setData(updatedData);

      // تحديث الحالة في النافذة المفتوحة
      setSelectedTx({ ...selectedTx, status: newStatus });

      toast.success(
        action === "hold"
          ? "تم تعليق الأموال بنجاح"
          : action === "release"
            ? "تم فك تعليق الأموال"
            : "تم استرداد الأموال وإعادتها للمحفظة",
      );
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "فشل تنفيذ الإجراء، تأكد من الصلاحيات",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8" dir="rtl">
      <AdminNav />

      {/* --- Top Bar --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            الرقابة المالية المركزية
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            تتبع كافة التدفقات النقدية، الاشتراكات، والنزاعات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px] bg-white">
              <Calendar className="w-4 h-4 ml-2 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="7_days">آخر 7 أيام</SelectItem>
              <SelectItem value="30_days">آخر 30 يوم</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="bg-white gap-2"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* --- KPI Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              صافي دخل المنصة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.total_revenue) : "..."}
            </div>
            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              محدث مباشرة
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              إيرادات الاشتراكات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats ? formatCurrency(stats.subscriptions_income) : "..."}
            </div>
            <div className="text-xs text-gray-400 mt-1">من التجار والمودلز</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              إيرادات الترويج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats ? formatCurrency(stats.promotions_income) : "..."}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              حملات إعلانية مدفوعة
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${stats?.held_funds! > 0 ? "border-rose-200 bg-rose-50" : ""}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              أموال محجوزة (نزاعات)
              {stats?.held_funds! > 0 && (
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {stats ? formatCurrency(stats.held_funds) : "..."}
            </div>
            <div className="text-xs text-rose-600/80 mt-1">
              تتطلب تدخلاً إدارياً
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart 1: Revenue Breakdown */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>تحليل مصادر الدخل</CardTitle>
            <CardDescription>
              توزيع الإيرادات بين الاشتراكات، العمولات، والترويج
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: "عمولات المبيعات",
                    value: stats?.sales_commission || 0,
                    fill: "#2563eb",
                  },
                  {
                    name: "الاشتراكات",
                    value: stats?.subscriptions_income || 0,
                    fill: "#7c3aed",
                  },
                  {
                    name: "الترويج",
                    value: stats?.promotions_income || 0,
                    fill: "#ea580c",
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  cursor={{ fill: "#f3f4f6" }}
                  contentStyle={{ borderRadius: "8px" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Transaction Status */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>حالة المعاملات</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "مكتمل",
                      value: data.filter((t) => t.status === "completed")
                        .length,
                    },
                    {
                      name: "معلق",
                      value: data.filter((t) => t.status === "pending").length,
                    },
                    {
                      name: "نزاع",
                      value: data.filter((t) => t.status === "on_hold").length,
                    },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* --- Main Data Table --- */}
      <Card className="shadow-sm border-none overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between gap-4 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-gray-800">
              سجل الحركات المالية
            </h2>
            <Badge variant="secondary" className="text-xs">
              {filteredData.length} عملية
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث (ID، اسم، مرجع)..."
                className="pr-9 w-full sm:w-[250px] bg-gray-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px] bg-gray-50">
                <Filter className="w-4 h-4 ml-2 text-gray-500" />
                <SelectValue placeholder="تصفية حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل العمليات</SelectItem>
                <SelectItem value="subscription_fee">اشتراكات</SelectItem>
                <SelectItem value="product_sale">مبيعات / عمولات</SelectItem>
                <SelectItem value="promotion_fee">ترويج</SelectItem>
                <SelectItem value="withdrawal">سحوبات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-right">المعرف</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell
                      colSpan={7}
                      className="h-12 animate-pulse bg-gray-50/50"
                    />
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center h-32 text-gray-500"
                  >
                    لا توجد بيانات مطابقة
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => {
                  const typeMeta = getTypeLabel(item.type);
                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 cursor-pointer group"
                      onClick={() => {
                        setSelectedTx(item);
                        setIsSheetOpen(true);
                      }}
                    >
                      <TableCell className="font-mono text-xs text-gray-500">
                        {item.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-full bg-opacity-10 ${typeMeta.color.replace("text-", "bg-")}`}
                          >
                            <typeMeta.icon
                              className={`w-4 h-4 ${typeMeta.color}`}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {typeMeta.label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {item.user.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {item.user.role}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          dir="ltr"
                          className={`font-bold ${item.amount < 0 ? "text-red-600" : "text-gray-900"}`}
                        >
                          {formatCurrency(item.amount)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* --- Action Details Sheet (Intervention) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="text-right border-b pb-4">
            <div className="flex items-center gap-2 mb-2">
              {selectedTx && getStatusBadge(selectedTx.status)}
              <span className="text-xs text-gray-400 font-mono">
                {selectedTx?.id}
              </span>
            </div>
            <SheetTitle>تفاصيل المعاملة</SheetTitle>
            <SheetDescription>
              مراجعة التفاصيل واتخاذ إجراءات التدخل المالي.
            </SheetDescription>
          </SheetHeader>

          {selectedTx && (
            <div className="space-y-6 mt-6">
              {/* Summary Card */}
              <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-500 text-sm">نوع العملية</span>
                  <span className="font-medium flex items-center gap-1">
                    {getTypeLabel(selectedTx.type).label}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-500 text-sm">المبلغ الإجمالي</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(selectedTx.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    المستخدم المستفيد
                  </span>
                  <div className="text-left">
                    <p className="font-medium text-sm">
                      {selectedTx.user.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {selectedTx.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description & Meta */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  الوصف / المرجع
                </h4>
                <p className="text-sm text-gray-600 bg-white border p-3 rounded-md">
                  {selectedTx.description}
                  <br />
                  <span className="text-xs text-gray-400 mt-1 block font-mono">
                    Ref ID: {selectedTx.reference_id}
                  </span>
                </p>
              </div>

              {/* Intervention Actions */}
              <div className="border-t pt-6 space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  منطقة التدخل (إجراءات حساسة)
                </h4>

                {selectedTx.status === "completed" ||
                selectedTx.status === "pending" ? (
                  <Button
                    variant="destructive"
                    className="w-full justify-start gap-3 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                    onClick={() => handleTransactionAction("hold")}
                    disabled={actionLoading}
                  >
                    <Lock className="w-4 h-4" />
                    تعليق الأموال (تجميد الرصيد)
                  </Button>
                ) : null}

                {selectedTx.status === "on_hold" ? (
                  <Button
                    variant="default"
                    className="w-full justify-start gap-3 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleTransactionAction("release")}
                    disabled={actionLoading}
                  >
                    <Unlock className="w-4 h-4" />
                    فك التعليق (إتاحة الأموال)
                  </Button>
                ) : null}

                {(selectedTx.status === "completed" ||
                  selectedTx.status === "on_hold") && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => handleTransactionAction("refund")}
                    disabled={actionLoading}
                  >
                    <RefreshCcw className="w-4 h-4" />
                    عكس العملية (Refund)
                  </Button>
                )}

                {actionLoading && (
                  <p className="text-center text-xs text-gray-400">
                    جاري تنفيذ الإجراء...
                  </p>
                )}
              </div>

              <SheetFooter className="mt-8">
                <Button variant="ghost" onClick={() => setIsSheetOpen(false)}>
                  إغلاق
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
