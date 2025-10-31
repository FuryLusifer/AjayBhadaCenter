import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import bankQRCode from "@/assets/bank-qr-code.png";
import { compressImage } from "@/lib/imageCompression";
import { Upload } from "lucide-react";

const checkoutSchema = z.object({
  phone: z.string()
    .trim()
    .min(10, "Phone number required")
    .regex(/^[+]?[1-9]\d{9,14}$/, "Please enter a valid phone number"),
  address: z.string()
    .trim()
    .min(10, "Address is required")
    .refine((val) => val.replace(/\s/g, '').length >= 10, {
      message: "Address must contain meaningful content"
    }),
  paymentScreenshot: z.instanceof(File).optional(),
}).refine((data) => {
  if (!data.paymentScreenshot) {
    return false;
  }
  return true;
}, {
  message: "Payment screenshot is required",
  path: ["paymentScreenshot"],
});

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phone: "",
      address: "",
      paymentScreenshot: undefined,
    },
  });

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Calculate delivery charges based on subtotal
  const calculateDeliveryCharge = (amount: number) => {
    if (amount <= 1000) return 150;
    if (amount <= 5000) return 200;
    return 300; // >5000
  };
  
  const deliveryCharge = calculateDeliveryCharge(subtotal);
  const total = subtotal + deliveryCharge;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setUploadedFile(compressed);
        form.setValue("paymentScreenshot", compressed);
        form.clearErrors("paymentScreenshot");
      } catch (error) {
        toast.error("Failed to compress image");
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof checkoutSchema>) => {
    if (!user) {
      toast.error("Please login to place an order");
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      let screenshotUrl = null;

      // Upload screenshot to Supabase storage
      if (uploadedFile) {
        const fileExt = uploadedFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-screenshots')
          .upload(filePath, uploadedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('payment-screenshots')
          .getPublicUrl(filePath);

        screenshotUrl = publicUrl;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          payment_method: "bank_transfer",
          payment_status: "pending",
          order_status: "pending",
          shipping_address: values.address,
          phone: values.phone,
          transaction_screenshot_url: screenshotUrl,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to checkout</h2>
        <Button asChild>
          <a href="/auth">Login</a>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button asChild>
          <a href="/products">Browse Products</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Shipping Information</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+977 xxxxxxxxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your full shipping address"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Payment Information</h2>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">Bank Transfer Details</h3>
                  <div className="space-y-2 text-sm mb-4">
                    <p><strong>Account Name:</strong> Ajay Bhada Center</p>
                    <p><strong>Account Number:</strong> 02301017504873</p>
                    <p><strong>Bank Name:</strong> Nabil Bank Limited</p>
                    <p><strong>Branch:</strong> Hetauda Branch</p>
                    <p><strong>SWIFT Code:</strong> NARBNPKA</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2">Or scan QR code:</p>
                    <img src={bankQRCode} alt="Payment QR Code" className="w-90 h-90 border rounded" />
                  </div>
                  <FormField
                    control={form.control}
                    name="paymentScreenshot"
                    render={() => (
                      <FormItem>
                        <FormLabel>Upload Payment Screenshot *</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                              />
                              <Upload className="h-5 w-5 text-muted-foreground" />
                            </div>
                            {uploadedFile && (
                              <p className="text-sm text-green-600">
                                ✓ Image uploaded and compressed ({(uploadedFile.size / 1024).toFixed(2)} KB)
                              </p>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-20">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="font-semibold">
                    Rs. {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charge</span>
                <span className="font-medium">Rs. {deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">Rs. {total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;