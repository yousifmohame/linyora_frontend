'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2, Lock } from 'lucide-react';

// استبدل هذا بمفتاحك العام من Stripe Dashboard
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const AddCardForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg('');

    // تأكيد الإعداد (Confirm Setup)
    // هذا لا يخصم مبلغاً، بل يحفظ البطاقة فقط
    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: window.location.href, // Stripe يتطلب هذا لكننا لن نعيد التوجيه فعلياً
      },
      redirect: "if_required", // مهم جداً لمنع إعادة التوجيه
    });

    if (error) {
      setErrorMsg(error.message || 'حدث خطأ غير معروف');
      setLoading(false);
    } else {
      // نجاح!
      toast.success(t('Payment.cardAdded', { defaultValue: 'تمت إضافة البطاقة بنجاح' }));
      setLoading(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <PaymentElement />
      {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
      
      <div className="flex justify-end gap-3">
        <Button disabled={!stripe || loading} type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save', { defaultValue: 'حفظ البطاقة' })}
        </Button>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Lock className="w-3 h-3" />
        <span>مدفوعات آمنة ومشفرة بواسطة Stripe</span>
      </div>
    </form>
  );
};

export default function AddCardModal({ onCardAdded }: { onCardAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const { t } = useTranslation();

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !clientSecret) {
      try {
        // طلب SetupIntent من الباك إند
        const { data } = await api.post('/payments/setup-intent');
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast.error('فشل في تهيئة نموذج الدفع');
        setOpen(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg transition-transform hover:-translate-y-0.5">
          <Plus className="w-5 h-5 mr-2" />
          {t('Payment.addNew', { defaultValue: 'إضافة بطاقة جديدة' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Payment.addCardTitle', { defaultValue: 'إضافة بطاقة آمنة' })}</DialogTitle>
        </DialogHeader>
        
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <AddCardForm onSuccess={() => { setOpen(false); onCardAdded(); }} />
          </Elements>
        ) : (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}