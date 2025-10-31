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
  transaction_screenshot_url: string | null;
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

  const getDeliveryCharge = (amount: number): number => {
    if (amount <= 1000) return 150;
    if (amount <= 5000) return 200;
    return 300; // >5000
  };

  const generateOrderPDF = (order: Order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Calculate subtotal and delivery charge
    const itemsTotal = order.order_items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
    const deliveryCharge = getDeliveryCharge(itemsTotal);
    
    // Color scheme
    const primaryColor = [41, 128, 185]; // Professional blue
    const secondaryColor = [52, 73, 94]; // Dark gray
    const lightGray = [236, 240, 241];
    
    // Header with colored background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 28, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("AJAY BHADA CENTER", pageWidth / 2, 15, { align: "center" });
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text("Order Receipt", pageWidth / 2, 25, { align: "center" });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Order info box
    let yPos = 35;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(20, yPos, pageWidth - 40, 20, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`Order ID: ${order.id}`, 25, yPos + 7);
    doc.text(`Date: ${format(new Date(order.created_at), "PPP, h:mm:ss a")}`, 25, yPos + 14);
    
    // Status badge
    const statusX = pageWidth - 45;
    const statusY = yPos + 5;
    const statusColor = order.order_status === 'delivered' ? [46, 204, 113] : 
                        order.order_status === 'pending' ? [241, 196, 15] : 
                        [52, 152, 219];
    
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(statusX, statusY, 35, 8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(order.order_status.toUpperCase(), statusX + 17.5, statusY + 5.5, { align: "center" });
    
    // Reset colors
    doc.setTextColor(0, 0, 0);
    
    // Two column layout for customer and shipping
    yPos = 63;
    
    // Customer Details - Left Column
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, yPos, 2, 6, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER DETAILS", 25, yPos + 4);
    
    yPos += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setFont("helvetica", "bold");
    doc.text("Name:", 25, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(order.profiles?.full_name || 'N/A', 45, yPos);
    
    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Email:", 25, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(order.profiles?.email || 'N/A', 45, yPos);
    
    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Phone:", 25, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(order.phone, 45, yPos);
    
    // Shipping Address - Right Column
    const rightColX = pageWidth / 2 + 10;
    yPos = 63;
    
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(rightColX, yPos, 2, 6, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("SHIPPING ADDRESS", rightColX + 5, yPos + 4);
    
    yPos += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(order.shipping_address, 75);
    doc.text(addressLines, rightColX + 5, yPos);
    
    // Order Items Table
    yPos = 95;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, yPos, 2, 6, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER ITEMS", 25, yPos + 4);
    
    yPos += 12;
    
    // Table header with background
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Product", 25, yPos);
    doc.text("Qty", 125, yPos, { align: "center" });
    doc.text("Price", 150, yPos, { align: "right" });
    doc.text("Total", pageWidth - 25, yPos, { align: "right" });
    
    doc.setTextColor(0, 0, 0);
    yPos += 8;
    
    // Table rows with alternating background
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    order.order_items?.forEach((item, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPos - 5, pageWidth - 40, 7, 'F');
      }
      
      const productName = item.product_name.length > 45 ? 
                        item.product_name.substring(0, 42) + '...' : 
                        item.product_name;
      
      doc.text(productName, 25, yPos);
      doc.text(item.quantity.toString(), 125, yPos, { align: "center" });
      doc.text(`Rs. ${item.unit_price.toFixed(2)}`, 150, yPos, { align: "right" });
      doc.text(`Rs. ${item.subtotal.toFixed(2)}`, pageWidth - 25, yPos, { align: "right" });
      yPos += 7;
    });
    
    // Summary section
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", pageWidth - 70, yPos);
    doc.text(`Rs. ${itemsTotal.toFixed(2)}`, pageWidth - 25, yPos, { align: "right" });

    yPos += 7;
    doc.text("Delivery Charge:", pageWidth - 70, yPos);
    doc.text(`Rs. ${deliveryCharge.toFixed(2)}`, pageWidth - 25, yPos, { align: "right" });

    yPos += 8;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(pageWidth - 75, yPos - 5, 65, 10, 'F');
  
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL AMOUNT:", pageWidth - 70, yPos + 2);
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Rs. ${order.total_amount.toFixed(2)}`, pageWidth - 14, yPos + 2, { align: "right" });
  
    doc.setTextColor(0, 0, 0);

    // Payment Details
    yPos += 18;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, yPos, 2, 6, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT DETAILS", 25, yPos + 4);
    
    yPos += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    doc.setFont("helvetica", "bold");
    doc.text("Method: Bank Transfer", 25, yPos);
    doc.setFont("helvetica", "normal");
    
    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Status:", 25, yPos);
    doc.setFont("helvetica", "normal");
    
    const paymentStatusColor = order.payment_status === 'paid' ? [46, 204, 113] : [231, 76, 60];
    doc.setTextColor(paymentStatusColor[0], paymentStatusColor[1], paymentStatusColor[2]);
    doc.text(order.payment_status.toUpperCase(), 40, yPos);
    doc.setTextColor(0, 0, 0);
    
    if (order.transaction_screenshot_url) {
      yPos += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Payment Screenshot: Uploaded", 25, yPos);
    }
    
    // Footer with border
    const footerY = pageHeight - 20;
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(20, footerY, pageWidth - 20, footerY);
    
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for your order!", pageWidth / 2, footerY + 6, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text("For any queries, please contact our customer support", pageWidth / 2, footerY + 11, { align: "center" });
    
    // Save
    doc.save(`order-${order.id.substring(0, 8)}-${format(new Date(), "yyyy-MM-dd-HHmmss")}.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  const generateAllOrdersPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Color scheme
  const primaryColor = [41, 128, 185];
  const secondaryColor = [52, 73, 94];
  const lightGray = [236, 240, 241];
  const accentColor = [149, 165, 166];
  
  // Header with colored background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("AJAY BHADA CENTER", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(15);
  doc.setFont("helvetica", "normal");
  doc.text("ORDER SUMMARY", pageWidth / 2, 25, { align: "center" });
  
  doc.setFontSize(9);
  doc.text(`Generated on: ${format(new Date(), "PPP, h:mm:ss a")}`, pageWidth / 2, 33, { align: "center" });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Summary box
  let yPos = 48;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(20, yPos, pageWidth - 40, 16, 2, 2, 'F');
  
  // Calculate totals
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = orders.filter(o => o.order_status === 'pending').length;
  const completedOrders = orders.filter(o => o.order_status === 'delivered').length;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  
  // Summary statistics
  doc.text(`Total Orders: ${orders.length}`, 25, yPos + 6);
  doc.text(`Total Revenue: Rs. ${totalRevenue.toFixed(2)}`, 25, yPos + 12);
  
  doc.text(`Completed: ${completedOrders}`, 110, yPos + 6);
  doc.text(`Pending: ${pendingOrders}`, 110, yPos + 12);
  
  const processingOrders = orders.length - pendingOrders - completedOrders;
  doc.text(`Processing: ${processingOrders}`, 160, yPos + 6);
  
  doc.setTextColor(0, 0, 0);
  
  yPos = 72;
  
  // Table header
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(20, yPos, pageWidth - 40, 9, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("#", 23, yPos + 6);
  doc.text("Order ID", 32, yPos + 6);
  doc.text("Customer", 65, yPos + 6);
  doc.text("Date", 110, yPos + 6);
  doc.text("Amount", 140, yPos + 6);
  doc.text("Status", 168, yPos + 6);
  
  doc.setTextColor(0, 0, 0);
  yPos += 12;
  
  // Function to add page header for continuation pages
  const addPageHeader = () => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("AJAY BHADA CENTER", pageWidth / 2, 12, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("All Orders Report (Continued)", pageWidth / 2, 19, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    
    // Table header
    const headerY = 30;
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(20, headerY, pageWidth - 40, 9, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("#", 23, headerY + 6);
    doc.text("Order ID", 32, headerY + 6);
    doc.text("Customer", 65, headerY + 6);
    doc.text("Date", 110, headerY + 6);
    doc.text("Amount", 140, headerY + 6);
    doc.text("Status", 168, headerY + 6);
    
    doc.setTextColor(0, 0, 0);
    
    return headerY + 12;
  };
  
  // Orders list
  orders.forEach((order, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = addPageHeader();
    }
    
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPos - 4, pageWidth - 40, 20, 'F');
    }
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    // Order number
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}`, 23, yPos);
    
    // Order ID
    doc.setFont("helvetica", "normal");
    doc.text(order.id.substring(0, 8).toUpperCase(), 32, yPos);
    
    // Customer name (truncate if too long)
    const customerName = order.profiles?.full_name || 'N/A';
    const truncatedName = customerName.length > 18 ? 
                          customerName.substring(0, 15) + '...' : 
                          customerName;
    doc.text(truncatedName, 65, yPos);
    
    // Date
    doc.text(format(new Date(order.created_at), "PP"), 110, yPos);
    
    // Amount
    doc.setFont("helvetica", "bold");
    doc.text(`Rs. ${order.total_amount.toFixed(2)}`, 140, yPos);
    doc.setFont("helvetica", "normal");
    
    // Status badge
    const statusX = 168;
    const statusY = yPos - 3;
    const statusColor = order.order_status === 'delivered' ? [46, 204, 113] : 
                        order.order_status === 'pending' ? [241, 196, 15] : 
                        [52, 152, 219];
    
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(statusX, statusY, 28, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(order.order_status.toUpperCase(), statusX + 14, statusY + 4, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    
    // Additional details row
    yPos += 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    
    doc.text(`Phone: ${order.phone}`, 32, yPos);
    
    // Payment status
    const paymentStatusText = `Payment: ${order.payment_status}`;
    const paymentColor = order.payment_status === 'paid' ? [46, 204, 113] : [231, 76, 60];
    doc.setTextColor(paymentColor[0], paymentColor[1], paymentColor[2]);
    doc.text(paymentStatusText, 110, yPos);
    
    doc.setTextColor(0, 0, 0);
    
    yPos += 9;
    
    // Thin separator line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 5;
  });
  
  // Footer on last page
  const footerY = pageHeight - 15;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(20, footerY, pageWidth - 20, footerY);
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont("helvetica", "italic");
  doc.text("End of Report", pageWidth / 2, footerY + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth / 2, footerY + 10, { align: "center" });
  
  doc.save(`all-orders-${format(new Date(), "yyyy-MM-dd-HHmmss")}.pdf`);
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
                  <p className="text-xs text-muted-foreground">Bank Transfer</p>
                  {order.transaction_screenshot_url && (
                    <a 
                      href={order.transaction_screenshot_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View Screenshot
                    </a>
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