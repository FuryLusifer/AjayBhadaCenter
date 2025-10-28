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
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Orders Management</h1>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">
                  {order.id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.profiles?.full_name || 'Unknown Customer'}</p>
                    <p className="text-sm text-muted-foreground">{order.profiles?.email || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{order.phone}</p>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(order.created_at), "PPP")}</TableCell>
                <TableCell className="font-semibold">
                  Rs. {order.total_amount.toFixed(2)}
                  <p className="text-xs text-muted-foreground">
                    {order.payment_method === "cod" ? "COD" : "Bank Transfer"}
                  </p>
                  {order.transaction_code && (
                    <p className="text-xs text-muted-foreground">
                      Ref: {order.transaction_code}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <p className="text-sm mb-2">{order.shipping_address}</p>
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
                <TableCell>
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