import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";

interface Order {
  id: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_address: string;
  phone: string;
  transaction_code: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        profiles(full_name, email)
      `)
      .order("created_at", { ascending: false });

    if (data) setOrders(data);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: status })
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Order status updated!");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const updatePaymentStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: status })
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Payment status updated!");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || "Failed to update payment");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      shipped: "bg-purple-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
      failed: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8">Orders Management</h1>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">Order ID</TableHead>
              <TableHead className="min-w-[150px]">Customer</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="min-w-[120px]">Amount</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[120px]">Payment</TableHead>
              <TableHead className="min-w-[140px]">Order Status</TableHead>
              <TableHead className="hidden xl:table-cell min-w-[130px]">Payment Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs sm:text-sm">
                  {order.id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm truncate max-w-[150px]">{order.profiles?.full_name || 'Unknown Customer'}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{order.profiles?.email || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{order.phone}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{format(new Date(order.created_at), "PPP")}</TableCell>
                <TableCell className="font-semibold">
                  <div className="text-sm">₹{order.total_amount.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {order.payment_method === "cod" ? "COD" : "Bank Transfer"}
                  </p>
                  {order.transaction_code && (
                    <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                      Ref: {order.transaction_code}
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <p className="text-sm mb-2 truncate max-w-[150px]">{order.shipping_address}</p>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.order_status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <Select
                    value={order.payment_status}
                    onValueChange={(value) => updatePaymentStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Orders;