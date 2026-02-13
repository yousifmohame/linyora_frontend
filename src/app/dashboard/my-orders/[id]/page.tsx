"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Star,
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  MessageCircle,
  Download,
  Share2,
  Sparkles,
  Wallet,
  Coins,
  Info,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// --- TypeScript Interfaces ---
interface ShippingAddress {
  fullName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface OrderItem {
  product_id: number;
  productName: string;
  color: string;
  quantity: number;
  price: string;
  images: unknown;
}

interface OrderDetails {
  id: number;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
  totalAmount: string;
  created_at: string;
  shipping_cost: string;
  cod_fee?: string; // ✅ مضاف: رسوم الدفع عند الاستلام
  tax_amount?: string; // ✅ مضاف: الضريبة
  shippingAddress: ShippingAddress | null;
  paymentMethod?: string;
  paymentStatus: string;
  cardLast4?: string;
}

interface OrderResponse {
  details: OrderDetails;
  items: OrderItem[];
}

// --- Helper: Safely extract first image URL ---
const getFirstImageUrl = (imagesField: unknown): string => {
  if (!imagesField) return "/placeholder.png";
  if (Array.isArray(imagesField)) {
    return imagesField.length > 0 && typeof imagesField[0] === "string"
      ? imagesField[0]
      : "/placeholder.png";
  }
  if (typeof imagesField === "string") {
    const str = imagesField.trim();
    if (str.startsWith("[")) {
      try {
        const parsed = JSON.parse(str);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          typeof parsed[0] === "string"
        )
          return parsed[0];
      } catch (e) {
        console.warn("Image parse error", e);
      }
    }
    return str || "/placeholder.png";
  }
  return "/placeholder.png";
};

// --- Review Form Component ---
const ReviewForm = ({
  productId,
  productName,
  onReviewSubmitted,
}: {
  productId: number;
  productName: string;
  onReviewSubmitted: () => void;
}) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert(t("OrderDetailsPage.reviewForm.selectRating"));
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/customer/reviews", { productId, rating, comment });
      alert(t("OrderDetailsPage.reviewForm.success"));
      onReviewSubmitted();
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert(t("OrderDetailsPage.reviewForm.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          {t("OrderDetailsPage.reviewForm.title")}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm mt-1">{productName}</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 sm:w-10 sm:h-10 cursor-pointer transition-all duration-200 transform hover:scale-110 ${(hoverRating || rating) >= star ? "text-amber-400 fill-amber-400" : "text-gray-300 hover:text-amber-300"}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2 sm:space-y-3">
        <Label htmlFor="comment">
          {t("OrderDetailsPage.reviewForm.commentLabel")}
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("OrderDetailsPage.reviewForm.commentPlaceholder")}
          className="min-h-20 sm:min-h-24 resize-none"
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white"
      >
        {isSubmitting
          ? t("OrderDetailsPage.reviewForm.submitting")
          : t("OrderDetailsPage.reviewForm.submitButton")}
      </Button>
    </div>
  );
};

// --- Order Timeline Component ---
const OrderTimeline = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const steps = [
    {
      key: "pending",
      icon: Clock,
      label: t("OrderDetailsPage.timeline.pending.label"),
      description: t("OrderDetailsPage.timeline.pending.description"),
    },
    {
      key: "processing",
      icon: Package,
      label: t("OrderDetailsPage.timeline.processing.label"),
      description: t("OrderDetailsPage.timeline.processing.description"),
    },
    {
      key: "shipped",
      icon: Truck,
      label: t("OrderDetailsPage.timeline.shipped.label"),
      description: t("OrderDetailsPage.timeline.shipped.description"),
    },
    {
      key: "completed",
      icon: CheckCircle,
      label: t("OrderDetailsPage.timeline.completed.label"),
      description: t("OrderDetailsPage.timeline.completed.description"),
    },
  ];
  const currentStepIndex = steps.findIndex((step) => step.key === status);
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sm:shadow-xl rounded-2xl sm:rounded-3xl">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center space-x-2 space-x-reverse text-base sm:text-lg">
          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <span>{t("OrderDetailsPage.timeline.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <div
                key={step.key}
                className="flex items-start space-x-3 sm:space-x-4 space-x-reverse"
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-600 border-green-500 text-white" : "bg-white border-gray-300 text-gray-400"} ${isCurrent ? "ring-2 sm:ring-4 ring-green-200 scale-105 sm:scale-110" : ""}`}
                >
                  <StepIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 pt-1 sm:pt-2">
                  <p
                    className={`font-semibold transition-colors duration-300 text-sm sm:text-base ${isCompleted ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const Separator = () => <div className="border-t border-gray-200 my-2" />;

export default function CustomerOrderDetailsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { id: orderId } = params;
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const response = await api.get(`/customer/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order details", error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // --- Calculations ---
  // حساب المجموع الفرعي من العناصر فقط (قبل الشحن والضريبة والرسوم)
  const subTotal = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  }, [order]);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        variant: "bg-amber-100 text-amber-800 border-amber-200",
        icon: Clock,
        label: t("OrderDetailsPage.status.pending"),
      },
      processing: {
        variant: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Package,
        label: t("OrderDetailsPage.status.processing"),
      },
      shipped: {
        variant: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Truck,
        label: t("OrderDetailsPage.status.shipped"),
      },
      completed: {
        variant: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: t("OrderDetailsPage.status.completed"),
      },
      cancelled: {
        variant: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: t("OrderDetailsPage.status.cancelled"),
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getPaymentStatusConfig = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      paid: {
        label: t("OrderDetailsPage.paymentStatus.paid", {
          defaultValue: "مدفوع",
        }),
        className: "text-green-700 bg-green-50 border-green-200",
      },
      unpaid: {
        label: t("OrderDetailsPage.paymentStatus.unpaid", {
          defaultValue: "غير مدفوع",
        }),
        className: "text-amber-700 bg-amber-50 border-amber-200",
      },
      refunded: {
        label: t("OrderDetailsPage.paymentStatus.refunded", {
          defaultValue: "مسترجع",
        }),
        className: "text-red-700 bg-red-50 border-red-200",
      },
    };
    return map[status] || map.unpaid;
  };

  const getPaymentMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      card: t("OrderDetailsPage.paymentMethod.card", {
        defaultValue: "بطاقة ائتمان",
      }),
      cod: t("OrderDetailsPage.paymentMethod.cod", {
        defaultValue: "دفع عند الاستلام",
      }),
      wallet: t("OrderDetailsPage.paymentMethod.wallet", {
        defaultValue: "المحفظة",
      }),
    };
    return map[method] || method;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-rose-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3 sm:mb-4 animate-pulse">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            {t("OrderDetailsPage.loading")}
          </p>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
          <p className="text-red-500 text-base sm:text-lg mb-3 sm:mb-4">
            {t("OrderDetailsPage.notFound")}
          </p>
          <Button
            onClick={() => router.push("/dashboard/my-orders")}
            className="h-9 sm:h-10 text-sm sm:text-base"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
            {t("OrderDetailsPage.backToOrders")}
          </Button>
        </div>
      </div>
    );

  const { details, items } = order;
  const statusConfig = getStatusConfig(details.status);
  const paymentStatusConfig = getPaymentStatusConfig(details.paymentStatus);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t("common.locale"), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/my-orders")}
              className="hover:bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent truncate">
                {t("OrderDetailsPage.orderTitle", { id: details.id })}
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm">
                {formatDate(details.created_at)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50 rounded-xl text-xs sm:text-sm h-8 sm:h-9"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                {t("OrderDetailsPage.share")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50 rounded-xl text-xs sm:text-sm h-8 sm:h-9"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                {t("OrderDetailsPage.downloadInvoice")}
              </Button>
            </div>
            <Badge
              className={`${statusConfig.variant} px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center justify-center space-x-1 sm:space-x-2 space-x-reverse text-xs sm:text-sm`}
            >
              <statusConfig.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-semibold truncate">
                {statusConfig.label}
              </span>
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Order Items */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sm:shadow-xl rounded-2xl sm:rounded-3xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 space-x-reverse text-base sm:text-lg">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                  <span>{t("OrderDetailsPage.orderItems.title")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                {items.map((item: OrderItem) => (
                  <div
                    key={item.product_id}
                    className="flex items-start justify-between p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4 space-x-reverse flex-1 min-w-0">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                        <Image
                          src={getFirstImageUrl(item.images)}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {item.color}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {t("OrderDetailsPage.orderItems.itemPrice", {
                            quantity: item.quantity,
                            price: Number(item.price).toFixed(2),
                            currency: t("common.currency"),
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                      <p className="font-bold text-base sm:text-lg text-gray-900 whitespace-nowrap">
                        {(Number(item.price) * item.quantity).toFixed(2)}{" "}
                        {t("common.currency")}
                      </p>
                      {details.status === "completed" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 border-gray-300 hover:border-amber-400 hover:bg-amber-50 text-amber-600 rounded-lg text-xs h-7 sm:h-8"
                            >
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                              <span className="hidden xs:inline">
                                {t("OrderDetailsPage.orderItems.reviewButton")}
                              </span>
                              <span className="xs:hidden">Review</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl sm:rounded-3xl max-w-[95vw] sm:max-w-md p-4 sm:p-6">
                            <DialogHeader>
                              <DialogTitle className="text-center text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                {t("OrderDetailsPage.reviewForm.dialogTitle")}
                              </DialogTitle>
                            </DialogHeader>
                            <ReviewForm
                              productId={item.product_id}
                              productName={item.productName}
                              onReviewSubmitted={fetchOrder}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Timeline */}
            <OrderTimeline status={details.status} />
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Payment Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sm:shadow-xl rounded-2xl sm:rounded-3xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 space-x-reverse text-base sm:text-lg">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                  <span>
                    {t("OrderDetailsPage.payment.title", {
                      defaultValue: "معلومات الدفع",
                    })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                {details.paymentMethod ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {details.paymentMethod === "cod" ? (
                            <Coins className="w-5 h-5 text-green-600" />
                          ) : (
                            <CreditCard className="w-5 h-5 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-indigo-600 font-medium">
                            {t("OrderDetailsPage.payment.methodTitle", {
                              defaultValue: "طريقة الدفع",
                            })}
                          </p>
                          <p className="text-sm font-bold text-indigo-900">
                            {getPaymentMethodLabel(details.paymentMethod)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Wallet className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            {t("OrderDetailsPage.payment.statusTitle", {
                              defaultValue: "حالة الدفع",
                            })}
                          </p>
                          <Badge
                            variant="outline"
                            className={`${paymentStatusConfig.className} mt-1 border`}
                          >
                            {paymentStatusConfig.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600 text-sm sm:text-base italic">
                    {t("OrderDetailsPage.payment.notAvailable")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Order Summary (المصحح) */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sm:shadow-xl rounded-2xl sm:rounded-3xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 space-x-reverse text-base sm:text-lg">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span>{t("OrderDetailsPage.summary.title")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center py-1 sm:py-2">
                  <span className="text-gray-600 text-sm sm:text-base">
                    {t("OrderDetailsPage.summary.subtotal")}
                  </span>
                  <span className="font-semibold text-sm sm:text-base">
                    {subTotal.toFixed(2)} {t("common.currency")}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-center py-1 sm:py-2">
                  <span className="text-gray-600 text-sm sm:text-base">
                    {t("OrderDetailsPage.summary.shipping")}
                  </span>
                  <span className="font-semibold text-sm sm:text-base">
                    {Number(details?.shipping_cost ?? 0) === 0 ? (
                      <span className="text-green-600">{t("common.free")}</span>
                    ) : (
                      `${Number(details.shipping_cost).toFixed(2)} ${t("common.currency")}`
                    )}
                  </span>
                </div>

                {/* COD Fee (Only if present) */}
                {Number(details.cod_fee) > 0 && (
                  <div className="flex justify-between items-center py-1 sm:py-2">
                    <span className="text-gray-600 text-sm sm:text-base flex items-center gap-1">
                      {t("checkout.codFee", {
                        defaultValue: "رسوم الدفع عند الاستلام",
                      })}
                      <Info className="w-3 h-3 text-gray-400" />
                    </span>
                    <span className="font-semibold text-sm sm:text-base">
                      {Number(details.cod_fee).toFixed(2)}{" "}
                      {t("common.currency")}
                    </span>
                  </div>
                )}

                {/* Tax (Only if present) */}
                {Number(details.tax_amount) > 0 && (
                  <div className="flex justify-between items-center py-1 sm:py-2">
                    <span className="text-gray-600 text-sm sm:text-base">
                      {t("OrderDetailsPage.summary.tax")}
                    </span>
                    <span className="font-semibold text-sm sm:text-base">
                      {Number(details.tax_amount).toFixed(2)}{" "}
                      {t("common.currency")}
                    </span>
                  </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center py-1 sm:py-2">
                  <span className="font-bold text-gray-900 text-base sm:text-lg">
                    {t("OrderDetailsPage.summary.total")}
                  </span>
                  <span className="font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent text-lg sm:text-xl">
                    {Number(details.totalAmount).toFixed(2)}{" "}
                    {t("common.currency")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            {details.shippingAddress && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sm:shadow-xl rounded-2xl sm:rounded-3xl">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    {t("OrderDetailsPage.shipping.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-orange-900">
                        {details.shippingAddress.fullName}
                      </p>
                      <p className="text-orange-600 text-sm">
                        {details.shippingAddress.address1}
                      </p>
                      <p className="text-orange-600 text-sm">
                        {details.shippingAddress.city},{" "}
                        {details.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Support */}
            <Card className="bg-gradient-to-br from-rose-50 to-purple-50 border-0 shadow-lg sm:shadow-xl rounded-2xl sm:rounded-3xl">
              <CardContent className="p-4 sm:p-6 text-center">
                <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 text-rose-500 mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">
                  {t("OrderDetailsPage.support.title")}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  {t("OrderDetailsPage.support.description")}
                </p>
                <Link href={"/contact"}>
                  <Button className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base h-9 sm:h-10 w-full">
                    {t("OrderDetailsPage.support.contactButton")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
