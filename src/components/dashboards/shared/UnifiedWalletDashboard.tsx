"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import {
  Loader2,
  ArrowUpRight,
  Clock,
  Wallet,
  TrendingUp,
  Info,
  Banknote,
  AlertCircle,
  CalendarDays,
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
  const rawBalance = Number(stats?.balance || 0);
  const displayAvailableBalance = rawBalance > 0 ? rawBalance : 0;
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
          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-0 whitespace-nowrap">
            مكتمل
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-0 whitespace-nowrap">
            معلق
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-0 whitespace-nowrap">
            قيد المعالجة
          </Badge>
        );
      case "cancelled":
      case "rejected":
        return (
          <Badge variant="destructive" className="whitespace-nowrap">
            ملغي
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="whitespace-nowrap">
            {status}
          </Badge>
        );
    }
  };

  const translateType = (type: string) => {
    const types: Record<string, string> = {
      sale_earning: "أرباح مبيعات",
      shipping_earning: "عائد شحن",
      cod_commission_deduction: "عمولة (COD)",
      payout: "سحب رصيد",
      agreement_income: "أرباح تسويق",
      adjustment: "تسوية إدارية",
      commission_deduction: "خصم عمولة",
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
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto" dir="rtl">
      {/* --- Header Section --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            المحفظة المالية
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            نظرة شاملة على أرباحك، مستحقاتك، والعمليات المالية.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={displayAvailableBalance < 50}
                className="w-full md:w-auto gap-2 bg-primary hover:bg-primary/90 shadow-sm h-12 md:h-10 text-base md:text-sm"
              >
                <Banknote className="h-5 w-5 md:h-4 md:w-4" />
                سحب الرصيد
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95%] max-w-[425px] rounded-xl">
              <DialogHeader>
                <DialogTitle>طلب سحب أرباح</DialogTitle>
                <DialogDescription>
                  سيتم تحويل المبلغ إلى حسابك البنكي المسجل خلال 24-48 ساعة عمل.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-right block">
                    المبلغ (ر.س)
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="pl-12 text-lg font-bold h-12"
                      min={50}
                      max={displayAvailableBalance}
                    />
                    <span className="absolute left-3 top-3.5 text-sm text-muted-foreground font-bold">
                      SAR
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                    <span>الحد الأدنى: 50 ر.س</span>
                    <span>
                      المتاح: {formatCurrency(displayAvailableBalance)}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleRequestPayout}
                  disabled={isPayoutLoading}
                  className="w-full sm:w-auto"
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

      {/* --- Analytics Cards (Responsive Grid) --- */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. الرصيد المتاح */}
        <Card className="border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الرصيد المتاح
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
              جاهز للتحويل
            </p>
          </CardContent>
        </Card>

        {/* 2. المديونيات */}
        <Card
          className={`border-t-4 ${
            displayTotalDebt > 0
              ? "border-t-rose-500 bg-rose-50/30"
              : "border-t-gray-200"
          } shadow-sm`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المديونيات
              </CardTitle>
              {displayTotalDebt > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        مبالغ مستحقة للمنصة سيتم خصمها تلقائياً
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(displayTotalDebt)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {displayTotalDebt > 0 ? "يخصم من القادم" : "لا توجد مديونيات"}
            </p>
          </CardContent>
        </Card>

        {/* 3. الرصيد المعلق */}
        <Card className="border-t-4 border-t-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              قيد التسوية
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
              {stats.pending_transactions_count} عمليات معلقة
            </p>
          </CardContent>
        </Card>

        {/* 4. إجمالي الأرباح */}
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
            <p className="text-xs text-muted-foreground mt-1">التاريخي</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Transactions Section --- */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>سجل العمليات</CardTitle>
          <CardDescription>عرض تفصيلي للحركات المالية</CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="overflow-x-auto px-4 md:px-0 pb-2">
              <TabsList className="w-full justify-start md:w-auto h-auto flex-wrap gap-1 p-1 bg-muted/50">
                <TabsTrigger value="all" className="flex-1 md:flex-none">
                  الكل
                </TabsTrigger>
                <TabsTrigger
                  value="earnings"
                  className="flex-1 md:flex-none text-emerald-700 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-800"
                >
                  الإيداعات
                </TabsTrigger>
                <TabsTrigger
                  value="deductions"
                  className="flex-1 md:flex-none text-rose-700 data-[state=active]:bg-rose-50 data-[state=active]:text-rose-800"
                >
                  الخصومات
                </TabsTrigger>
                <TabsTrigger value="payouts" className="flex-1 md:flex-none">
                  السحوبات
                </TabsTrigger>
              </TabsList>
            </div>

            {["all", "earnings", "deductions", "payouts"].map((tabValue) => {
              const filteredTransactions = transactions.filter((t) => {
                if (tabValue === "all") return true;
                if (tabValue === "earnings") return Number(t.amount) > 0;
                if (tabValue === "deductions")
                  return Number(t.amount) < 0 && t.type !== "payout";
                if (tabValue === "payouts") return t.type === "payout";
                return true;
              });

              return (
                <TabsContent key={tabValue} value={tabValue} className="mt-0">
                  {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center px-4">
                      <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-2" />
                      <p>لا توجد عمليات مطابقة لهذا التصنيف.</p>
                    </div>
                  ) : (
                    <>
                      {/* --- Mobile View: Cards --- */}
                      <div className="md:hidden divide-y divide-border">
                        {filteredTransactions.map((trx) => (
                          <div
                            key={trx.id}
                            className="p-4 flex flex-col gap-3 hover:bg-muted/5"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-2 items-center">
                                <div
                                  className={`h-2 w-2 rounded-full mt-1 ${
                                    Number(trx.amount) > 0
                                      ? "bg-emerald-500"
                                      : "bg-rose-500"
                                  }`}
                                />
                                <div>
                                  <p className="font-semibold text-sm text-foreground">
                                    {translateType(trx.type)}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                    {trx.description}
                                  </p>
                                </div>
                              </div>
                              <div className="text-left">
                                <span
                                  className={`font-bold text-sm block ${
                                    Number(trx.amount) > 0
                                      ? "text-emerald-600"
                                      : "text-rose-600"
                                  }`}
                                >
                                  {Number(trx.amount) > 0 ? "+" : ""}
                                  {formatCurrency(trx.amount)}
                                </span>
                                {getStatusBadge(trx.status)}
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                              <div className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {new Date(trx.created_at).toLocaleDateString(
                                  "en-GB",
                                )}
                              </div>
                              {trx.available_at && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  متاح:{" "}
                                  {new Date(
                                    trx.available_at,
                                  ).toLocaleDateString("en-GB")}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* --- Desktop View: Table --- */}
                      <div className="hidden md:block rounded-md border m-4 md:m-0 md:border-0">
                        <Table dir="rtl">
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="text-right w-[180px]">
                                النوع
                              </TableHead>
                              <TableHead className="text-right">
                                التفاصيل
                              </TableHead>
                              <TableHead className="text-right">
                                المبلغ
                              </TableHead>
                              <TableHead className="text-right">
                                الحالة
                              </TableHead>
                              <TableHead className="text-right">
                                التاريخ
                              </TableHead>
                              <TableHead className="text-right">
                                الاستحقاق
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTransactions.map((trx) => (
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
                                </TableCell>
                                <TableCell dir="ltr" className="text-right">
                                  <span
                                    className={`font-bold ${
                                      Number(trx.amount) > 0
                                        ? "text-emerald-600"
                                        : "text-rose-600"
                                    }`}
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
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
