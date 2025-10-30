import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Get total products
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Get low stock products (less than 10)
    const { count: lowStockProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lt("stock_quantity", 10);

    // Get total orders
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("order_status", "pending");

    // Get total revenue
    const { data: orders } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "confirmed");

    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    setStats({
      totalProducts: totalProducts || 0,
      lowStockProducts: lowStockProducts || 0,
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      totalRevenue,
    });
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Low Stock Products",
      value: stats.lowStockProducts,
      icon: AlertCircle,
      color: "text-orange-500",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-500",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: "text-yellow-500",
    },
    {
      title: "Total Revenue",
      value: `Rs.${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;