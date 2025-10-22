// components/cart/CartSheet.tsx
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Input } from "../ui/input";

export default function CartSheet() {
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (cartItems.length === 0) return;

    try {
      await api.post('/orders', { cartItems });
      alert('تم إرسال طلبك بنجاح!');
      clearCart();
      router.push('/dashboard'); // توجيه العميل لصفحة طلباته
    } catch (error) {
      console.error("Checkout failed:", error);
      alert('فشل إتمام الطلب. الرجاء المحاولة مرة أخرى.');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-1">
              {cartCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>سلة التسوق</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full py-4">
          {cartItems.length === 0 ? (
            <div className="flex-grow flex items-center justify-center">
              <p>سلتك فارغة.</p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto pr-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.price.toFixed(2)} ريال</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min="1" 
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-16 h-8 text-center"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {cartItems.length > 0 && (
            <SheetFooter className="mt-auto border-t pt-4">
              <div className="w-full">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>الإجمالي:</span>
                  <span>{cartTotal.toFixed(2)} ريال</span>
                </div>
                <Button className="w-full" onClick={handleCheckout}>إتمام الطلب</Button>
              </div>
            </SheetFooter>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}