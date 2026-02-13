"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import {
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertTriangle,
  Wallet,
  TrendingUp,
  TrendingDown,
  Info,
  Banknote,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WalletStats, Transaction } from "@/types/wallet";

export default function UnifiedWalletDashboard() {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [isPayoutLoading, setIsPayoutLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // --- 1. جلب البيانات ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const statsRes = await axios.get("/wallet/my-wallet");
      setStats(statsRes.data);

      const transRes = await axios.get("/wallet/transactions?limit=50");
      setTransactions(transRes.data.transactions);
    } catch (error) {
      console.error(error);
      toast.error("فشل تحميل بيانات المحفظة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. معالجة المنطق المالي للعرض ---
  // نقوم هنا بفصل الرصيد السالب عن الموجب للعرض فقط
  const rawBalance = Number(stats?.balance || 0);

  // الرصيد الفعلي القابل للسحب (لا يمكن أن يكون سالب في العرض)
  const displayAvailableBalance = rawBalance > 0 ? rawBalance : 0;

  // المديونية الفعلية (إذا كان الرصيد بالسالب، أو إذا كان هناك دين مسجل)
  // نجمع المديونية المسجلة + العجز في الرصيد الرئيسي
  const displayTotalDebt =
    Number(stats?.outstanding_debt || 0) +
    (rawBalance < 0 ? Math.abs(rawBalance) : 0);

  // --- 3. دوال المساعدة ---
  const handleRequestPayout = async () => {
    if (!stats) return;
    const amount = parseFloat(payoutAmount);

    if (isNaN(amount) || amount < 50) {
      toast.error("الحد الأدنى للسحب هو 50 ريال");
      return;
    }

    if (amount > displayAvailableBalance) {
      toast.error("الرصيد المتاح غير كافٍ");
      return;
    }

    try {
      setIsPayoutLoading(true);
      await axios.post("/wallet/request-payout", { amount });
      toast.success("تم إرسال طلب السحب بنجاح");
      setIsDialogOpen(false);
      setPayoutAmount("");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الطلب");
    } finally {
      setIsPayoutLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = Number(amount);
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "cleared":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-0">
            مكتمل
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-0">
            معلق
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-0">
            قيد المعالجة
          </Badge>
        );
      case "cancelled":
      case "rejected":
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const translateType = (type: string) => {
    const types: Record<string, string> = {
      sale_earning: "أرباح مبيعات (بطاقة)",
      shipping_earning: "عائد شحن",
      cod_commission_deduction: "تسوية عمولة (دفع عند الاستلام)",
      payout: "سحب رصيد",
      agreement_income: "أرباح تسويق",
      adjustment: "تسوية إدارية",
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          جاري تحميل البيانات المالية...
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 p-2 md:p-8" dir="rtl">
      {/* --- Header Section --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            المحفظة المالية
          </h1>
          <p className="text-muted-foreground mt-1">
            نظرة شاملة على أرباحك، مستحقاتك، والعمليات المالية.
          </p>
        </div>

        <div className="flex gap-3">
          {/* زر السحب يظهر فقط إذا كان هناك رصيد متاح */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={displayAvailableBalance < 50}
                className="gap-2 bg-primary hover:bg-primary/90 shadow-sm"
              >
                <Banknote className="h-4 w-4" />
                سحب الرصيد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>طلب سحب أرباح</DialogTitle>
                <DialogDescription>
                  سيتم تحويل المبلغ إلى حسابك البنكي المسجل خلال 24-48 ساعة عمل.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-right">
                    المبلغ (ر.س)
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="pl-12 text-lg font-bold"
                      min={50}
                      max={displayAvailableBalance}
                    />
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-bold">
                      SAR
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>الحد الأدنى: 50 ر.س</span>
                    <span>
                      المتاح: {formatCurrency(displayAvailableBalance)}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleRequestPayout}
                  disabled={isPayoutLoading}
                >
                  {isPayoutLoading ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  )}
                  تأكيد السحب
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* --- Analytics Cards --- */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* 1. الرصيد المتاح (الأخضر) */}
        <Card className="border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الرصيد المتاح للسحب
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {formatCurrency(displayAvailableBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              جاهز للتحويل الفوري
            </p>
          </CardContent>
        </Card>

        {/* 2. المديونيات (الأحمر) - يظهر فقط إذا كان هناك دين */}
        <Card
          className={`border-t-4 ${displayTotalDebt > 0 ? "border-t-rose-500 bg-rose-50/30" : "border-t-gray-200"} shadow-sm`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المديونيات المستحقة
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">
                      هذه المبالغ تمثل عمولة المنصة من طلبات "الدفع عند
                      الاستلام". يتم خصمها تلقائياً من أرباحك القادمة.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(displayTotalDebt)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {displayTotalDebt > 0
                ? "يتم خصمها من المبيعات الجديدة"
                : "لا توجد عليك مديونيات"}
            </p>
          </CardContent>
        </Card>

        {/* 3. الرصيد المعلق (الأصفر) */}
        <Card className="border-t-4 border-t-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              رصيد قيد التسوية
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {formatCurrency(stats.pending_balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pending_transactions_count} عمليات في فترة الضمان
            </p>
          </CardContent>
        </Card>

        {/* 4. إجمالي الأرباح التاريخية */}
        <Card className="border-t-4 border-t-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الأرباح
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.total_earnings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              صافي الأرباح منذ التسجيل
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- Transactions Table Section --- */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>سجل العمليات المالية</CardTitle>
          <CardDescription>
            عرض تفصيلي لجميع الحركات المالية الصادرة والواردة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="earnings" className="text-emerald-700">
                  الإيداعات
                </TabsTrigger>
                <TabsTrigger value="deductions" className="text-rose-700">
                  الخصومات والديون
                </TabsTrigger>
                <TabsTrigger value="payouts">السحوبات</TabsTrigger>
              </TabsList>
            </div>

            {/* محتوى الجدول الموحد مع الفلترة */}
            {["all", "earnings", "deductions", "payouts"].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue}>
                <div className="rounded-md border">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-right w-[180px]">
                          نوع العملية
                        </TableHead>
                        <TableHead className="text-right">التفاصيل</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">
                          تاريخ المعاملة
                        </TableHead>
                        <TableHead className="text-right">
                          تاريخ الاستحقاق
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.filter((t) => {
                        if (tabValue === "all") return true;
                        if (tabValue === "earnings")
                          return Number(t.amount) > 0;
                        if (tabValue === "deductions")
                          return Number(t.amount) < 0 && t.type !== "payout";
                        if (tabValue === "payouts") return t.type === "payout";
                        return true;
                      }).length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-12 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                              <p>لا توجد عمليات مطابقة لهذا التصنيف.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions
                          .filter((t) => {
                            if (tabValue === "all") return true;
                            if (tabValue === "earnings")
                              return Number(t.amount) > 0;
                            if (tabValue === "deductions")
                              return (
                                Number(t.amount) < 0 && t.type !== "payout"
                              );
                            if (tabValue === "payouts")
                              return t.type === "payout";
                            return true;
                          })
                          .map((trx) => (
                            <TableRow
                              key={trx.id}
                              className="hover:bg-muted/5 transition-colors"
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {Number(trx.amount) > 0 ? (
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                  ) : (
                                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                                  )}
                                  {translateType(trx.type)}
                                </div>
                              </TableCell>
                              <TableCell
                                className="text-sm text-muted-foreground max-w-[250px] truncate"
                                title={trx.description}
                              >
                                {trx.description}
                                <div className="text-[10px] text-muted-foreground/70">
                                  Ref ID: {trx.reference_id}
                                </div>
                              </TableCell>
                              <TableCell dir="ltr" className="text-right">
                                <span
                                  className={`font-bold ${Number(trx.amount) > 0 ? "text-emerald-600" : "text-rose-600"}`}
                                >
                                  {Number(trx.amount) > 0 ? "+" : ""}
                                  {formatCurrency(trx.amount)}
                                </span>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(trx.status)}
                              </TableCell>
                              <TableCell className="text-sm font-mono">
                                {new Date(trx.created_at).toLocaleDateString(
                                  "en-GB",
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {trx.available_at ? (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(
                                      trx.available_at,
                                    ).toLocaleDateString("en-GB")}
                                  </div>
                                ) : (
                                  <span className="text-emerald-600 text-xs">
                                    فوري
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
