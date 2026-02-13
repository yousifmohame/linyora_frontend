// frontend/src/app/dashboard/admin/payouts/page.tsx
"use client";

import { useState, useEffect, Fragment, useRef } from "react"; // Added useRef
import { useTranslation } from "react-i18next";
import api from "@/lib/axios";
import { useReactToPrint } from "react-to-print"; // Added Library

// Import Invoice Component
import { PayoutInvoice } from "@/components/invoices/PayoutInvoice";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Eye,
  Check,
  X,
  User,
  Bot,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  TrendingUp,
  Download,
  Filter,
  Search,
  Printer,
  Crown, // Added Printer Icon
} from "lucide-react";
import AdminNav from "@/components/dashboards/AdminNav";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PayoutRequest {
  id: number;
  amount: number;
  status: "pending" | "approved" | "cleared" | "rejected";
  created_at: string;
  user_id: number;
  name: string;
  email: string;
  user_type: "merchant" | "supplier" | "model" | "user";
  bank_name?: string; // Added for Invoice
  iban?: string; // Added for Invoice
}

interface PayoutDetails extends PayoutRequest {
  phone_number: string;
  account_number: string;
  iban: string;
  iban_certificate_url: string;
}

export default function AdminPayoutsPage() {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PayoutDetails | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // --- Print System Logic ---
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [printData, setPrintData] = useState<PayoutRequest | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Payout_Invoice_${printData?.id}`,
    onAfterPrint: () => toast.success("تمت الطباعة بنجاح"),
  });

  useEffect(() => {
    if (printData && invoiceRef.current) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [printData, handlePrint]);

  const triggerPrintInvoice = (request: PayoutRequest) => {
    // نجلب البيانات الإضافية إذا لزم الأمر، أو نستخدم البيانات الموجودة في الجدول
    // لضمان وجود بيانات البنك في الطباعة، يفضل أن يعيد الـ API الرئيسي هذه البيانات
    // أو يمكننا عمل fetch سريع للتفاصيل قبل الطباعة. هنا سأستخدم البيانات المتاحة.
    setPrintData(request);
  };
  // -------------------------

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get<PayoutRequest[]>("/admin/payouts");
      setRequests(response.data);
    } catch (error) {
      toast.error(t("PayoutsPage.toast.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleViewDetails = async (request: PayoutRequest) => {
    try {
      const response = await api.get<PayoutDetails>(
        `/admin/payouts/${request.id}`,
        {
          params: { user_type: request.user_type },
        },
      );
      setSelectedRequest(response.data);
      setIsModalOpen(true);
      setNotes("");
    } catch (error) {
      toast.error(t("PayoutsPage.toast.detailsError"));
    }
  };

  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    if (!selectedRequest) return;

    try {
      const promise = api.put(`/admin/payouts/${selectedRequest.id}`, {
        status,
        notes,
        user_type: selectedRequest.user_type,
      });

      toast.promise(promise, {
        loading: t("common.saving"),
        success: () => {
          setIsModalOpen(false);
          fetchRequests();
          return t("PayoutsPage.toast.updateSuccess", {
            id: selectedRequest.id,
          });
        },
        error: t("PayoutsPage.toast.updateError", { id: selectedRequest.id }),
      });
    } catch (error) {
      console.error("Failed to update request status:", error);
    }
  };

  const getUserTypeLabel = (userType: string) => {
    return userType === "merchant" ? t("PayoutsPage.table.merchant") : "المورد";
  };

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case "merchant":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1">
            <User className="w-3 h-3" />
            {t("PayoutsPage.table.merchant")} {/* تاجر */}
          </Badge>
        );
      case "supplier":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 flex items-center gap-1">
            <Bot className="w-3 h-3" />
            مورد
          </Badge>
        );
      case "model":
        return (
          <Badge className="bg-pink-100 text-pink-700 border-pink-200 flex items-center gap-1">
            <Crown className="w-3 h-3" /> {/* أيقونة مختلفة للمودل */}
            مودل
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1">
            <User className="w-3 h-3" />
            مستخدم
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: {
        icon: <Clock className="w-3 h-3" />,
        label: t("AdminOrdersPage.status.pending"),
        className: "bg-amber-100 text-amber-700 border-amber-200",
      },
      approved: {
        icon: <CheckCircle className="w-3 h-3" />,
        label: t("PayoutsPage.actions.approve"),
        className: "bg-green-100 text-green-700 border-green-200",
      },
      rejected: {
        icon: <XCircle className="w-3 h-3" />,
        label: t("PayoutsPage.actions.reject"),
        className: "bg-red-100 text-red-700 border-red-200",
      },
    };
    const config = statusMap[status as keyof typeof statusMap] || {
      icon: <Clock />,
      label: status,
      className: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge
        variant="outline"
        className={`${config.className} flex items-center gap-1`}
      >
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesType =
      typeFilter === "all" || request.user_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    totalAmount: requests.reduce((sum, r) => sum + r.amount, 0),
    pendingAmount: requests
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + r.amount, 0),
  };

  const exportPayouts = () => {
    toast.info(t("common.system"));
  };

  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const currency = i18n.language === "ar" ? t("common.currency") : "SAR";

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-6 sm:p-8">
      <AdminNav />

      {/* Hidden Invoice Component */}
      <div style={{ display: "none" }}>
        <PayoutInvoice ref={invoiceRef} data={printData} />
      </div>

      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <DollarSign className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <TrendingUp className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t("PayoutsPage.title")}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          مراجعة وإدارة طلبات سحب الأرباح من التجار والموردين
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-rose-600 mb-1">
              {stats.total}
            </div>
            <div className="text-rose-700 text-sm">إجمالي الطلبات</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600 mb-1">
              {stats.pending}
            </div>
            <div className="text-amber-700 text-sm">
              {t("AdminOrdersPage.status.pending")}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {stats.approved}
            </div>
            <div className="text-green-700 text-sm">
              {t("PayoutsPage.actions.approve")}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {stats.rejected}
            </div>
            <div className="text-red-700 text-sm">
              {t("PayoutsPage.actions.reject")}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {stats.pendingAmount.toLocaleString(locale)}
            </div>
            <div className="text-purple-700 text-sm">
              إجمالي المبالغ المعلقة
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
                <Input
                  placeholder={t("PayoutsPage.table.empty").replace(
                    "لا توجد طلبات سحب معلقة حاليًا.",
                    "ابحث بالاسم أو البريد الإلكتروني...",
                  )}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl"
                />
              </div>

              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                    >
                      <Filter className="w-4 h-4 ml-2" />
                      {statusFilter === "all"
                        ? t("AdminOrdersPage.status.all")
                        : statusFilter === "pending"
                          ? t("AdminOrdersPage.status.pending")
                          : statusFilter === "approved"
                            ? t("PayoutsPage.actions.approve")
                            : t("PayoutsPage.actions.reject")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-rose-200 rounded-xl">
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("all")}
                      className="text-rose-700"
                    >
                      {t("AdminOrdersPage.status.all")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("pending")}
                      className="text-amber-600"
                    >
                      {t("AdminOrdersPage.status.pending")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("approved")}
                      className="text-green-600"
                    >
                      {t("PayoutsPage.actions.approve")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("rejected")}
                      className="text-red-600"
                    >
                      {t("PayoutsPage.actions.reject")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                    >
                      <Filter className="w-4 h-4 ml-2" />
                      {typeFilter === "all"
                        ? "جميع الأنواع"
                        : typeFilter === "merchant"
                          ? t("PayoutsPage.table.merchant")
                          : "الموردين فقط"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-rose-200 rounded-xl">
                    <DropdownMenuItem
                      onClick={() => setTypeFilter("all")}
                      className="text-rose-700"
                    >
                      جميع الأنواع
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTypeFilter("merchant")}
                      className="text-blue-600"
                    >
                      {t("PayoutsPage.table.merchant")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTypeFilter("supplier")}
                      className="text-purple-600"
                    >
                      الموردين فقط
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={exportPayouts}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <Download className="w-4 h-4 ml-2" />
                {t("common.exportData")}
              </Button>
              <Button
                variant="outline"
                onClick={fetchRequests}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <Sparkles className="w-4 h-4 ml-2" />
                {t("common.refresh")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <DollarSign className="w-6 h-6" />
                {t("PayoutsPage.title")}
              </CardTitle>
              <CardDescription className="text-pink-100">
                {t("PayoutsPage.table.empty").replace(
                  "لا توجد طلبات سحب معلقة حاليًا.",
                  `مراجعة وإدارة جميع طلبات السحب (${filteredRequests.length} طلب)`,
                )}
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-0"
            >
              {filteredRequests.length} {t("common.users")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                <TableHead className="text-rose-800 font-bold">
                  {t("PayoutsPage.dialog.name")}
                </TableHead>
                <TableHead className="text-rose-800 font-bold">النوع</TableHead>
                <TableHead className="text-rose-800 font-bold">
                  {t("PayoutsPage.table.amount")}
                </TableHead>
                <TableHead className="text-rose-800 font-bold">
                  {t("AdminOrdersPage.table.status")}
                </TableHead>
                <TableHead className="text-rose-800 font-bold">
                  {t("PayoutsPage.table.date")}
                </TableHead>
                <TableHead className="text-rose-800 font-bold text-left">
                  {t("AdminOrdersPage.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-3"></div>
                      <p className="text-rose-700 font-medium">
                        {t("PayoutsPage.toast.fetchError")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <DollarSign className="w-16 h-16 text-rose-300 mb-4" />
                      <h3 className="font-bold text-xl text-rose-800 mb-2">
                        {t("PayoutsPage.table.empty")}
                      </h3>
                      <p className="text-rose-600">
                        {searchTerm ||
                        statusFilter !== "all" ||
                        typeFilter !== "all"
                          ? "لم نعثر على طلبات تطابق معايير البحث"
                          : t("PayoutsPage.table.empty")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => (
                  <TableRow
                    key={`${req.id}-${req.user_type}`}
                    className="border-rose-100 hover:bg-rose-50/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-rose-900">
                            {req.name}
                          </div>
                          <div className="text-rose-600 text-sm">
                            {req.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getUserTypeBadge(req.user_type)}</TableCell>
                    <TableCell>
                      <div className="font-bold text-rose-600 text-lg">
                        {Number(req.amount).toLocaleString(locale)} {currency}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell>
                      <div className="text-rose-600 text-sm">
                        {new Date(req.created_at).toLocaleDateString(locale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center gap-2">
                        {/* VIEW DETAILS BUTTON */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(req)}
                          className="text-blue-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* 🔥 PRINT BUTTON (NEW) 🔥 */}
                        {(req.status === "approved" ||
                          req.status === "cleared") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => triggerPrintInvoice(req)}
                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
                            title="طباعة الفاتورة"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl max-w-2xl">
          {selectedRequest && (
            <Fragment>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-rose-800 text-2xl">
                  <Eye className="w-6 h-6" />
                  {t("PayoutsPage.dialog.title", { id: selectedRequest.id })}
                </DialogTitle>
                <DialogDescription className="text-rose-600 text-lg">
                  {t("PayoutsPage.dialog.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-rose-50/50 border-rose-200 rounded-2xl">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-rose-800 mb-3">
                        {t("PayoutsPage.dialog.merchantInfo")}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>{t("PayoutsPage.dialog.name")}:</strong>{" "}
                          {selectedRequest.name}
                        </p>
                        <p>
                          <strong>{t("PayoutsPage.dialog.email")}:</strong>{" "}
                          {selectedRequest.email}
                        </p>
                        {selectedRequest.phone_number && (
                          <p>
                            <strong>{t("PayoutsPage.dialog.phone")}:</strong>{" "}
                            {selectedRequest.phone_number}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50/50 border-blue-200 rounded-2xl">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-800 mb-3">
                        {t("PayoutsPage.dialog.bankInfo")}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>
                            {t("PayoutsPage.dialog.accountNumber")}:
                          </strong>{" "}
                          {selectedRequest.account_number ||
                            t("PayoutsPage.dialog.notAvailable")}
                        </p>
                        <p>
                          <strong>{t("PayoutsPage.dialog.iban")}:</strong>{" "}
                          {selectedRequest.iban ||
                            t("PayoutsPage.dialog.notAvailable")}
                        </p>
                        {selectedRequest.iban_certificate_url && (
                          <a
                            href={selectedRequest.iban_certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            {t("PayoutsPage.dialog.viewIbanCertificate")}
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {(selectedRequest.status === "approved" ||
                  selectedRequest.status === "cleared") && (
                  <div className="pt-2">
                    <Button
                      className="w-full gap-2 py-6 text-lg bg-slate-900 hover:bg-slate-800 text-white"
                      onClick={() => triggerPrintInvoice(selectedRequest)}
                    >
                      <Printer className="w-5 h-5" /> طباعة إيصال التحويل الرسمي
                    </Button>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-rose-800 mb-3">
                    {t("PayoutsPage.prompt.rejectionReason")}
                  </h4>
                  <Textarea
                    placeholder={t("PayoutsPage.prompt.rejectionReason")}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border-rose-200 focus:border-rose-400 rounded-xl min-h-[100px] resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus("rejected")}
                  className="rounded-2xl px-6"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t("PayoutsPage.actions.reject")}
                </Button>
                <Button
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl px-6"
                  onClick={() => handleUpdateStatus("approved")}
                >
                  <Check className="w-4 h-4 ml-2" />
                  {t("PayoutsPage.actions.approve")}
                </Button>
              </div>
            </Fragment>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
