import React, { forwardRef } from "react";
import { CreditCard } from "lucide-react";

// تعريف أنواع البيانات (نفس الموجودة لديك)
interface PayoutRequest {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  description: string;
  name: string;
  email: string;
  user_type: string;
  bank_name?: string;
  account_number?: string;
  iban?: string;
  account_holder_name?: string;
}

interface InvoiceProps {
  data: PayoutRequest | null;
}

// نستخدم forwardRef لكي تتمكن مكتبة الطباعة من الوصول للمكون
export const PayoutInvoice = forwardRef<HTMLDivElement, InvoiceProps>(
  ({ data }, ref) => {
    if (!data) return null;

    return (
      <div ref={ref} className="p-8 bg-white text-black" dir="rtl">
        {/* --- إعدادات الطباعة: إجبار الخلفيات والألوان --- */}
        <style type="text/css" media="print">
          {`
            @page { size: A4; margin: 20mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          `}
        </style>

        {/* --- Header --- */}
        <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <CreditCard className="w-8 h-8" />
              <h1 className="text-2xl font-bold">منصة لينيورا</h1>
            </div>
            <p className="text-gray-500 text-sm">الإدارة المالية</p>
            <p className="text-gray-500 text-sm">الرياض، المملكة العربية السعودية</p>
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">إيصال سحب</h2>
            <div className="text-sm text-gray-500">
              <p>رقم الإيصال: <span className="font-mono text-black font-bold">#{data.id}</span></p>
              <p>التاريخ: {new Date().toLocaleDateString("ar-SA")}</p>
              <p>الحالة: <span className="text-emerald-600 font-bold">تم التحويل</span></p>
            </div>
          </div>
        </div>

        {/* --- Info Grid --- */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          {/* Beneficiary */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">
              بيانات المستفيد
            </h3>
            <div className="space-y-1">
              <p className="font-bold text-lg text-gray-900">{data.name}</p>
              <p className="text-gray-600">{data.email}</p>
              <p className="text-gray-600">
                الدور:{" "}
                {data.user_type === "merchant"
                  ? "تاجر"
                  : data.user_type === "supplier"
                  ? "مورد"
                  : "مودل"}
              </p>
            </div>
          </div>

          {/* Bank Info */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">
              تفاصيل التحويل البنكي
            </h3>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">البنك:</span>
                <span className="font-medium">{data.bank_name || "---"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">صاحب الحساب:</span>
                <span className="font-medium">
                  {data.account_holder_name || data.name}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-500">IBAN:</span>
                <span className="font-mono font-bold text-gray-800 dir-ltr text-right">
                  {data.iban || "---"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Details Table --- */}
        <div className="mb-10">
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-rose-50 text-rose-900">
                <th className="py-3 px-4 text-right font-bold rounded-r-lg">الوصف</th>
                <th className="py-3 px-4 text-center font-bold">نوع العملية</th>
                <th className="py-3 px-4 text-left font-bold rounded-l-lg">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 text-gray-700">
                  {data.description || `طلب سحب رصيد رقم #${data.id}`}
                </td>
                <td className="py-4 px-4 text-center text-gray-500">سحب محفظة</td>
                <td className="py-4 px-4 text-left font-bold font-mono">
                  {Number(data.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  SAR
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* --- Total --- */}
        <div className="flex justify-end mb-12">
          <div className="text-left bg-rose-600 text-white p-6 rounded-xl shadow-sm min-w-[250px]">
            <p className="text-rose-100 text-sm mb-1">المبلغ الإجمالي</p>
            <p className="text-3xl font-bold font-mono">
              {Number(data.amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}{" "}
              <span className="text-lg">SAR</span>
            </p>
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="text-center border-t border-gray-100 pt-8 text-gray-400 text-sm">
          <p>تم إنشاء هذا المستند إلكترونياً من خلال منصة لينيورا ولا يحتاج إلى توقيع.</p>
          <p className="mt-1">لأي استفسارات يرجى التواصل مع الإدارة المالية: support@linyora.com</p>
        </div>
      </div>
    );
  }
);

PayoutInvoice.displayName = "PayoutInvoice";