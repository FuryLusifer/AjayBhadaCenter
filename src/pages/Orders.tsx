import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Order {
  id: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items(product_name, quantity, unit_price)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view orders</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Order ID: {order.id.substring(0, 8)}...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), "PPP")}
                  </p>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Badge className={getStatusColor(order.order_status)}>
                    {order.order_status}
                  </Badge>
                  <Badge className={getStatusColor(order.payment_status)}>
                    Payment: {order.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.order_items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>
                      {item.product_name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      Rs.{(item.unit_price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-semibold">
                  Payment: {order.payment_method === "cod" ? "Cash on Delivery" : "Bank Transfer"}
                </span>
                <span className="text-lg font-bold text-primary">
                  Total: Rs.{order.total_amount.toFixed(2)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;