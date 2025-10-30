// import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { toast } from "sonner";
// import { format } from "date-fns";

// interface Order {
//   id: string;
//   total_amount: number;
//   payment_method: string;
//   payment_status: string;
//   order_status: string;
//   shipping_address: string;
//   phone: string;
//   transaction_code: string | null;
//   created_at: string;
//   profiles: {
//     full_name: string;
//     email: string;
//   } | null;
// }

// const Orders = () => {
//   const [orders, setOrders] = useState<Order[]>([]);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     const { data } = await supabase
//       .from("orders")
//       .select(`
//         *,
//         profiles(full_name, email)
//       `)
//       .order("created_at", { ascending: false });

//     if (data) setOrders(data);
//   };

//   const updateOrderStatus = async (orderId: string, status: string) => {
//     try {
//       const { error } = await supabase
//         .from("orders")
//         .update({ order_status: status })
//         .eq("id", orderId);

//       if (error) throw error;
//       toast.success("Order status updated!");
//       fetchOrders();
//     } catch (error: any) {
//       toast.error(error.message || "Failed to update order");
//     }
//   };

//   const updatePaymentStatus = async (orderId: string, status: string) => {
//     try {
//       const { error } = await supabase
//         .from("orders")
//         .update({ payment_status: status })
//         .eq("id", orderId);

//       if (error) throw error;
//       toast.success("Payment status updated!");
//       fetchOrders();
//     } catch (error: any) {
//       toast.error(error.message || "Failed to update payment");
//     }
//   };

//   const getStatusColor = (status: string) => {
//     const colors: Record<string, string> = {
//       pending: "bg-yellow-500",
//       confirmed: "bg-blue-500",
//       shipped: "bg-purple-500",
//       delivered: "bg-green-500",
//       cancelled: "bg-red-500",
//       failed: "bg-red-500",
//     };
//     return colors[status] || "bg-gray-500";
//   };

//   return (
//     <div className="p-4 sm:p-6 md:p-8">
//       <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8">Orders Management</h1>

//       <Card className="overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="min-w-[100px]">Order ID</TableHead>
//               <TableHead className="min-w-[150px]">Customer</TableHead>
//               <TableHead className="hidden md:table-cell">Date</TableHead>
//               <TableHead className="min-w-[120px]">Amount</TableHead>
//               <TableHead className="hidden lg:table-cell min-w-[120px]">Payment</TableHead>
//               <TableHead className="min-w-[140px]">Order Status</TableHead>
//               <TableHead className="hidden xl:table-cell min-w-[130px]">Payment Status</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {orders.map((order) => (
//               <TableRow key={order.id}>
//                 <TableCell className="font-mono text-xs sm:text-sm">
//                   {order.id.substring(0, 8)}...
//                 </TableCell>
//                 <TableCell>
//                   <div>
//                     <p className="font-medium text-sm truncate max-w-[150px]">{order.profiles?.full_name || 'Unknown Customer'}</p>
//                     <p className="text-xs text-muted-foreground truncate max-w-[150px]">{order.profiles?.email || 'N/A'}</p>
//                     <p className="text-xs text-muted-foreground">{order.phone}</p>
//                   </div>
//                 </TableCell>
//                 <TableCell className="hidden md:table-cell text-sm">{format(new Date(order.created_at), "PPP")}</TableCell>
//                 <TableCell className="font-semibold">
//                   <div className="text-sm">Rs.{order.total_amount.toFixed(2)}</div>
//                   <p className="text-xs text-muted-foreground">
//                     {order.payment_method === "cod" ? "COD" : "Bank Transfer"}
//                   </p>
//                   {order.transaction_code && (
//                     <p className="text-xs text-muted-foreground truncate max-w-[100px]">
//                       Ref: {order.transaction_code}
//                     </p>
//                   )}
//                 </TableCell>
//                 <TableCell className="hidden lg:table-cell">
//                   <p className="text-sm mb-2 truncate max-w-[150px]">{order.shipping_address}</p>
//                 </TableCell>
//                 <TableCell>
//                   <Select
//                     value={order.order_status}
//                     onValueChange={(value) => updateOrderStatus(order.id, value)}
//                   >
//                     <SelectTrigger className="w-[140px]">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="confirmed">Confirmed</SelectItem>
//                       <SelectItem value="shipped">Shipped</SelectItem>
//                       <SelectItem value="delivered">Delivered</SelectItem>
//                       <SelectItem value="cancelled">Cancelled</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </TableCell>
//                 <TableCell className="hidden xl:table-cell">
//                   <Select
//                     value={order.payment_status}
//                     onValueChange={(value) => updatePaymentStatus(order.id, value)}
//                   >
//                     <SelectTrigger className="w-[130px]">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="confirmed">Confirmed</SelectItem>
//                       <SelectItem value="failed">Failed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </Card>
//     </div>
//   );
// };

// export default Orders;

//****************************** new version********************************* */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import jsPDF from "jspdf";
import { Download, FileDown } from "lucide-react";

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

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
  order_items?: OrderItem[];
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
        profiles(full_name, email),
        order_items(product_name, quantity, unit_price, subtotal)
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

  const generateOrderPDF = (order: Order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("AJAY BHADA CENTER", pageWidth / 2, 25, { align: "center" });
    doc.setFontSize(15);
    doc.setFont("helvetica", "normal");
    doc.text("Order Receipt", pageWidth / 2, 18, { align: "center" });

    // Order Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: ${order.id}`, 20, 35);
    doc.text(`Date: ${format(new Date(order.created_at), "PPP")}`, 20, 42);
    doc.text(`Status: ${order.order_status.toUpperCase()}`, 20, 49);
    
    // Customer Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER DETAILS", 20, 62);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${order.profiles?.full_name || 'N/A'}`, 20, 70);
    doc.text(`Email: ${order.profiles?.email || 'N/A'}`, 20, 77);
    doc.text(`Phone: ${order.phone}`, 20, 84);
    
    // Shipping Address
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("SHIPPING ADDRESS", 20, 97);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(order.shipping_address, 170);
    doc.text(addressLines, 20, 105);
    
    // Order Items
    let yPos = 105 + (addressLines.length * 7) + 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER ITEMS", 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Table header
    doc.setFont("helvetica", "bold");
    doc.text("Product", 20, yPos);
    doc.text("Qty", 120, yPos);
    doc.text("Price", 145, yPos);
    doc.text("Total", 170, yPos);
    yPos += 7;
    
    doc.setFont("helvetica", "normal");
    // Table rows
    order.order_items?.forEach((item) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(item.product_name.substring(0, 35), 20, yPos);
      doc.text(item.quantity.toString(), 120, yPos);
      doc.text(`Rs. ${item.unit_price.toFixed(2)}`, 145, yPos);
      doc.text(`Rs. ${item.subtotal.toFixed(2)}`, 170, yPos);
      yPos += 7;
    });
    
    // Total
    yPos += 5;
    doc.setFont("helvetica", "normal")
    doc.text(`Delivery Charge: Rs. ${order.total_amount.toFixed(2)}`, 120, yPos);
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL AMOUNT: Rs. ${order.total_amount.toFixed(2)}`, 120, yPos);
    
    // Payment Info
    yPos += 10;
    doc.setFontSize(12);
    doc.text("PAYMENT DETAILS", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Method: ${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}`, 20, yPos);
    yPos += 7;
    doc.text(`Status: ${order.payment_status.toUpperCase()}`, 20, yPos);
    if (order.transaction_code) {
      yPos += 7;
      doc.text(`Transaction Ref: ${order.transaction_code}`, 20, yPos);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("Thank you for your order!", pageWidth / 2, 285, { align: "center" });
    
    // Save
    doc.save(`order-${order.id.substring(0, 8)}.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  const generateAllOrdersPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("AJAY BHADA CENTER", pageWidth / 2, 20, { align: "center" });
    doc.text("ALL ORDERS REPORT", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${format(new Date(), "PPP")}`, pageWidth / 2, 28, { align: "center" });
    doc.text(`Total Orders: ${orders.length}`, pageWidth / 2, 35, { align: "center" });
    
    let yPos = 45;
    
    orders.forEach((order, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Order header
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Order #${index + 1}: ${order.id.substring(0, 8)}`, 20, yPos);
      yPos += 7;
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Customer: ${order.profiles?.full_name || 'N/A'}`, 20, yPos);
      doc.text(`Date: ${format(new Date(order.created_at), "PP")}`, 120, yPos);
      yPos += 6;
      
      doc.text(`Phone: ${order.phone}`, 20, yPos);
      doc.text(`Amount: Rs.${order.total_amount.toFixed(2)}`, 120, yPos);
      yPos += 6;
      
      doc.text(`Status: ${order.order_status}`, 20, yPos);
      doc.text(`Payment: ${order.payment_status}`, 120, yPos);
      yPos += 10;
      
      // Separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;
    });
    
    doc.save(`all-orders-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("All orders PDF downloaded successfully!");
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Orders Management</h1>
        <Button 
          onClick={generateAllOrdersPDF}
          className="gap-2"
          disabled={orders.length === 0}
        >
          <FileDown className="h-4 w-4" />
          Export All Orders
        </Button>
      </div>

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
              <TableHead className="text-right">Actions</TableHead>
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
                  <div className="text-sm">Rs.{order.total_amount.toFixed(2)}</div>
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
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateOrderPDF(order)}
                    className="gap-2"
                  >
                    <Download className="h-3 w-3" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
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