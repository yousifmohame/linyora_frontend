// src/app/dashboard/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Settings,
  DollarSign,
  Gem,
  Key,
  CreditCard,
  Mail,
  Truck,
  Users,
  Timer,
  Sparkles,
  Crown,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Shield,
  Cloud,
  MessageCircle,
  Globe,
  Coins,
  Percent,
} from "lucide-react";
import AdminNav from "@/components/dashboards/AdminNav";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// ✅ تحديث الواجهة لتتطابق مع مفاتيح قاعدة البيانات في الباك إند
interface PlatformSettings {
  commission_rate: string;
  shipping_commission_rate: string;
  agreement_commission_rate: string;
  dropshipping_price: string;
  clearance_days: string; // تم التصحيح من payout_clearing_days
  cod_fee: string; // جديد: رسوم الدفع عند الاستلام
  vat_rate: string; // جديد: نسبة الضريبة
  min_withdrawal_limit: string; // جديد: الحد الأدنى للسحب

  stripe_secret_key: string;
  stripe_publishable_key: string;
  resend_api_key: string;
  cloudinary_cloud_name: string;
  cloudinary_api_key: string;
  cloudinary_api_secret: string;

  platform_name: string;
  platform_description: string;
  maintenance_mode: boolean;
}

export default function AdminSettingsPage() {
  const { t } = useTranslation();

  // ✅ القيم الافتراضية مطابقة لما هو متوقع من الباك إند
  const [settings, setSettings] = useState<PlatformSettings>({
    commission_rate: "10",
    shipping_commission_rate: "10",
    agreement_commission_rate: "10",
    dropshipping_price: "0",
    clearance_days: "14",
    cod_fee: "15",
    vat_rate: "15",
    min_withdrawal_limit: "50",

    stripe_secret_key: "",
    stripe_publishable_key: "",
    resend_api_key: "",
    cloudinary_cloud_name: "",
    cloudinary_api_key: "",
    cloudinary_api_secret: "",

    platform_name: "Linora",
    platform_description: "Your all-in-one e-commerce platform",
    maintenance_mode: false,
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("financial");
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>(
    {},
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/admin/settings");
        // دمج البيانات القادمة مع القيم الافتراضية لضمان عدم وجود حقول فارغة
        setSettings((prev) => ({ ...prev, ...response.data }));
      } catch (error) {
        console.error("Failed to fetch settings", error);
        toast.error("فشل تحميل الإعدادات");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings({ ...settings, [name]: checked });
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put("/admin/settings", settings);
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      id: "financial",
      icon: DollarSign,
      label: "المالية والعمولات",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "payments",
      icon: CreditCard,
      label: "بوابات الدفع",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "apis",
      icon: Key,
      label: "مفاتيح الربط (API)",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "general",
      icon: Settings,
      label: "الإعدادات العامة",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-6 sm:p-8"
      dir="rtl"
    >
      <div className="absolute top-0 left-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <AdminNav />

      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Settings className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Crown className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          إعدادات المنصة
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          تحكم كامل في العمولات، بوابات الدفع، وخصائص النظام
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="grid lg:grid-cols-4 gap-8 items-start max-w-7xl mx-auto">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl sticky top-24">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-3xl pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings className="w-5 h-5" />
                أقسام الإعدادات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 text-sm font-medium group ${
                      activeTab === item.id
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                        : "text-rose-700 bg-rose-50 hover:bg-rose-100 hover:shadow-md"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${activeTab === item.id ? "text-white" : "text-rose-500"}`}
                    />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* 1. Financial Settings (القسم المالي والعمولات) */}
              {activeTab === "financial" && (
                <>
                  <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <DollarSign className="w-6 h-6" />
                      الإعدادات المالية والعمولات
                    </CardTitle>
                    <CardDescription className="text-pink-100">
                      حدد نسب العمولات والرسوم التي تقتطعها المنصة من العمليات
                      المختلفة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                    {/* عمولة المبيعات العامة */}
                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                      <Label
                        htmlFor="commission_rate"
                        className="flex items-center gap-2 font-semibold text-blue-800 text-lg mb-3"
                      >
                        <Gem className="w-5 h-5" />
                        <span>عمولة المبيعات (المنتجات)</span>
                      </Label>
                      <p className="text-blue-600/80 text-sm mb-4">
                        النسبة المقتطعة من سعر بيع المنتج (للتاجر أو المورد)
                      </p>
                      <div className="relative">
                        <Input
                          id="commission_rate"
                          name="commission_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={settings.commission_rate}
                          onChange={handleChange}
                          className="bg-white pl-12 text-lg font-bold text-blue-900"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold">
                          %
                        </div>
                      </div>
                    </div>

                    {/* عمولة الشحن */}
                    <div className="p-6 bg-purple-50/50 border border-purple-100 rounded-2xl">
                      <Label
                        htmlFor="shipping_commission_rate"
                        className="flex items-center gap-2 font-semibold text-purple-800 text-lg mb-3"
                      >
                        <Truck className="w-5 h-5" />
                        <span>عمولة الشحن</span>
                      </Label>
                      <p className="text-purple-600/80 text-sm mb-4">
                        النسبة المقتطعة من تكلفة الشحن (من شركة الشحن/المورد)
                      </p>
                      <div className="relative">
                        <Input
                          id="shipping_commission_rate"
                          name="shipping_commission_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={settings.shipping_commission_rate}
                          onChange={handleChange}
                          className="bg-white pl-12 text-lg font-bold text-purple-900"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 font-bold">
                          %
                        </div>
                      </div>
                    </div>

                    {/* عمولة الاتفاقيات (المودل) */}
                    <div className="p-6 bg-teal-50/50 border border-teal-100 rounded-2xl">
                      <Label
                        htmlFor="agreement_commission_rate"
                        className="flex items-center gap-2 font-semibold text-teal-800 text-lg mb-3"
                      >
                        <Users className="w-5 h-5" />
                        <span>عمولة الاتفاقيات (المودل)</span>
                      </Label>
                      <p className="text-teal-600/80 text-sm mb-4">
                        النسبة المقتطعة من أرباح المودل/الإنفلونسر
                      </p>
                      <div className="relative">
                        <Input
                          id="agreement_commission_rate"
                          name="agreement_commission_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={settings.agreement_commission_rate}
                          onChange={handleChange}
                          className="bg-white pl-12 text-lg font-bold text-teal-900"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600 font-bold">
                          %
                        </div>
                      </div>
                    </div>

                    {/* رسوم الدفع عند الاستلام (COD) - جديد */}
                    <div className="p-6 bg-rose-50/50 border border-rose-100 rounded-2xl">
                      <Label
                        htmlFor="cod_fee"
                        className="flex items-center gap-2 font-semibold text-rose-800 text-lg mb-3"
                      >
                        <Coins className="w-5 h-5" />
                        <span>رسوم الدفع عند الاستلام (COD)</span>
                      </Label>
                      <p className="text-rose-600/80 text-sm mb-4">
                        مبلغ ثابت يضاف على العميل عند اختيار الدفع كاش
                      </p>
                      <div className="relative">
                        <Input
                          id="cod_fee"
                          name="cod_fee"
                          type="number"
                          step="1"
                          min="0"
                          value={settings.cod_fee}
                          onChange={handleChange}
                          className="bg-white pl-12 text-lg font-bold text-rose-900"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-600 font-bold">
                          SAR
                        </div>
                      </div>
                    </div>

                    {/* مدة تصفية الأرباح */}
                    <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-2xl">
                      <Label
                        htmlFor="clearance_days"
                        className="flex items-center gap-2 font-semibold text-orange-800 text-lg mb-3"
                      >
                        <Timer className="w-5 h-5" />
                        <span>مدة تصفية الأرباح</span>
                      </Label>
                      <p className="text-orange-600/80 text-sm mb-4">
                        عدد الأيام المطلوبة لتحرير الرصيد المعلق بعد اكتمال
                        الطلب
                      </p>
                      <div className="relative">
                        <Input
                          id="clearance_days"
                          name="clearance_days"
                          type="number"
                          step="1"
                          min="0"
                          value={settings.clearance_days}
                          onChange={handleChange}
                          className="bg-white pl-12 text-lg font-bold text-orange-900"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-600 font-bold">
                          يوم
                        </div>
                      </div>
                    </div>

                    {/* الحد الأدنى للسحب - جديد */}
                    <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
                      <Label
                        htmlFor="min_withdrawal_limit"
                        className="flex items-center gap-2 font-semibold text-slate-800 text-lg mb-3"
                      >
                        <DollarSign className="w-5 h-5" />
                        <span>الحد الأدنى للسحب</span>
                      </Label>
                      <p className="text-slate-600/80 text-sm mb-4">
                        أقل مبلغ يمكن للمستخدم طلب سحبه من المحفظة
                      </p>
                      <div className="relative">
                        <Input
                          id="min_withdrawal_limit"
                          name="min_withdrawal_limit"
                          type="number"
                          step="1"
                          min="0"
                          value={settings.min_withdrawal_limit}
                          onChange={handleChange}
                          className="bg-white pl-12 text-lg font-bold text-slate-900"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-bold">
                          SAR
                        </div>
                      </div>
                    </div>

                    {/* نسبة الضريبة (VAT) - جديد */}
                    <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                      <Label
                        htmlFor="vat_rate"
                        className="flex items-center gap-2 font-semibold text-indigo-800 text-lg mb-3"
                      >
                        <Percent className="w-5 h-5" />
                        <span>ضريبة القيمة المضافة (VAT)</span>
                      </Label>
                      <p className="text-indigo-600/80 text-sm mb-4">
                        تستخدم للعرض في الفواتير والحسابات الضريبية
                      </p>
                      <div className="relative">
                        <Input
                          id="vat_rate"
                          name="vat_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={settings.vat_rate}
                          onChange={handleChange}
                          className="bg-white pl-12 text-lg font-bold text-indigo-900"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 font-bold">
                          %
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* 2. Payment Gateways */}
              {activeTab === "payments" && (
                <>
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <CreditCard className="w-6 h-6" />
                      إعدادات بوابات الدفع
                    </CardTitle>
                    <CardDescription className="text-pink-100">
                      إدارة مفاتيح الربط مع Stripe والبنوك
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl">
                      <Label
                        htmlFor="stripe_publishable_key"
                        className="flex items-center gap-2 font-semibold text-indigo-800 text-lg mb-3"
                      >
                        <Key className="w-5 h-5" />
                        <span>Stripe Publishable Key</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="stripe_publishable_key"
                          name="stripe_publishable_key"
                          type={showSecrets.stripe_public ? "text" : "password"}
                          placeholder="pk_test_..."
                          value={settings.stripe_publishable_key}
                          onChange={handleChange}
                          className="bg-white border-indigo-300 focus:border-indigo-500 rounded-xl pr-12 text-lg font-mono"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700"
                          onClick={() =>
                            toggleSecretVisibility("stripe_public")
                          }
                        >
                          {showSecrets.stripe_public ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 rounded-2xl">
                      <Label
                        htmlFor="stripe_secret_key"
                        className="flex items-center gap-2 font-semibold text-violet-800 text-lg mb-3"
                      >
                        <Shield className="w-5 h-5" />
                        <span>Stripe Secret Key</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="stripe_secret_key"
                          name="stripe_secret_key"
                          type={showSecrets.stripe_secret ? "text" : "password"}
                          placeholder="sk_test_..."
                          value={settings.stripe_secret_key}
                          onChange={handleChange}
                          className="bg-white border-violet-300 focus:border-violet-500 rounded-xl pr-12 text-lg font-mono"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-600 hover:text-violet-700"
                          onClick={() =>
                            toggleSecretVisibility("stripe_secret")
                          }
                        >
                          {showSecrets.stripe_secret ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* 3. API Keys */}
              {activeTab === "apis" && (
                <>
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Key className="w-6 h-6" />
                      مفاتيح الربط (API Keys)
                    </CardTitle>
                    <CardDescription className="text-emerald-100">
                      إعدادات خدمات الطرف الثالث (إيميلات، صور، خرائط)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Resend API Key */}
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-2xl">
                      <Label
                        htmlFor="resend_api_key"
                        className="flex items-center gap-2 font-semibold text-gray-800 text-lg mb-3"
                      >
                        <Mail className="w-5 h-5" />
                        <span>Resend API Key (Email Service)</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="resend_api_key"
                          name="resend_api_key"
                          type={showSecrets.resend ? "text" : "password"}
                          placeholder="re_..."
                          value={settings.resend_api_key}
                          onChange={handleChange}
                          className="bg-white border-gray-300 focus:border-gray-500 rounded-xl pr-12 text-lg font-mono"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700"
                          onClick={() => toggleSecretVisibility("resend")}
                        >
                          {showSecrets.resend ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Cloudinary Settings */}
                    <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl">
                      <Label className="flex items-center gap-2 font-semibold text-cyan-800 text-lg mb-3">
                        <Cloud className="w-5 h-5" />
                        <span>Cloudinary Settings (Image Hosting)</span>
                      </Label>

                      <div className="space-y-4">
                        <Input
                          id="cloudinary_cloud_name"
                          name="cloudinary_cloud_name"
                          type="text"
                          placeholder="Cloud Name"
                          value={settings.cloudinary_cloud_name}
                          onChange={handleChange}
                          className="bg-white border-cyan-300 focus:border-cyan-500 rounded-xl text-lg font-mono"
                        />

                        <Input
                          id="cloudinary_api_key"
                          name="cloudinary_api_key"
                          type={
                            showSecrets.cloudinary_key ? "text" : "password"
                          }
                          placeholder="API Key"
                          value={settings.cloudinary_api_key}
                          onChange={handleChange}
                          className="bg-white border-cyan-300 focus:border-cyan-500 rounded-xl pr-12 text-lg font-mono"
                        />

                        <div className="relative">
                          <Input
                            id="cloudinary_api_secret"
                            name="cloudinary_api_secret"
                            type={
                              showSecrets.cloudinary_secret
                                ? "text"
                                : "password"
                            }
                            placeholder="API Secret"
                            value={settings.cloudinary_api_secret}
                            onChange={handleChange}
                            className="bg-white border-cyan-300 focus:border-cyan-500 rounded-xl pr-12 text-lg font-mono"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600 hover:text-cyan-700"
                            onClick={() =>
                              toggleSecretVisibility("cloudinary_secret")
                            }
                          >
                            {showSecrets.cloudinary_secret ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* 4. General Settings */}
              {activeTab === "general" && (
                <>
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Settings className="w-6 h-6" />
                      الإعدادات العامة
                    </CardTitle>
                    <CardDescription className="text-red-100">
                      معلومات المنصة ووضع الصيانة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Platform Name */}
                    <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl">
                      <Label
                        htmlFor="platform_name"
                        className="flex items-center gap-2 font-semibold text-rose-800 text-lg mb-3"
                      >
                        <Globe className="w-5 h-5" />
                        <span>اسم المنصة</span>
                      </Label>
                      <Input
                        id="platform_name"
                        name="platform_name"
                        type="text"
                        value={settings.platform_name}
                        onChange={handleChange}
                        className="bg-white border-rose-300 focus:border-rose-500 rounded-xl text-lg"
                      />
                    </div>

                    {/* Platform Description */}
                    <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl">
                      <Label
                        htmlFor="platform_description"
                        className="flex items-center gap-2 font-semibold text-amber-800 text-lg mb-3"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>وصف المنصة</span>
                      </Label>
                      <Input
                        id="platform_description"
                        name="platform_description"
                        type="text"
                        value={settings.platform_description}
                        onChange={handleChange}
                        className="bg-white border-amber-300 focus:border-amber-500 rounded-xl text-lg"
                      />
                    </div>

                    {/* Maintenance Mode */}
                    <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="flex items-center gap-2 font-semibold text-slate-800 text-lg mb-2">
                            <Shield className="w-5 h-5" />
                            <span>وضع الصيانة</span>
                          </Label>
                          <p className="text-slate-600 text-sm">
                            تفعيل هذا الوضع سيمنع المستخدمين العاديين من الوصول
                            للموقع
                          </p>
                        </div>
                        <Switch
                          checked={settings.maintenance_mode}
                          onCheckedChange={(checked) =>
                            handleSwitchChange("maintenance_mode", checked)
                          }
                          className="data-[state=checked]:bg-rose-500"
                        />
                      </div>
                      {settings.maintenance_mode && (
                        <Badge variant="destructive" className="mt-3">
                          ⚠️ الموقع حالياً في وضع الصيانة
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </>
              )}

              {/* Save Button */}
              <div className="p-6 pt-0 mt-6 sticky bottom-4 z-10">
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSaving}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-4 px-10 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin ml-2" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-6 h-6 ml-2" />
                        حفظ التغييرات
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
