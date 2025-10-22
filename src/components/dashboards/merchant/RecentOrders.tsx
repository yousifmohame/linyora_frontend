// linora-platform/frontend/src/components/dashboards/merchant/RecentOrders.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface Order {
  orderId: number;
  customerName: string;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
}

interface RecentOrdersProps {
  orders: Order[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">قيد التنفيذ</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800">ملغي</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">آخر الطلبات</h3>
            <Link href="/dashboard/orders">
                <Button variant="outline" size="sm">عرض الكل</Button>
            </Link>
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>العميل</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">الإجمالي</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.orderId}>
                        <TableCell className="font-medium">{order.customerName}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-left">{Number(order.totalAmount).toFixed(2)} ريال</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
}