import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import bankQRCode1 from "@/assets/bank-qr-code.png";
import bankQRCode2 from "@/assets/nabil_bank_qr.jpg";

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
  paymentMethod: z.enum(["cod", "bank_transfer"]),
  transactionCode: z.string().optional(),
}).refine((data) => {
  if (data.paymentMethod === "bank_transfer" && !data.transactionCode?.trim()) {
    return false;
  }
  return true;
}, {
  message: "Transaction code is required for bank transfers",
  path: ["transactionCode"],
});

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phone: "",
      address: "",
      paymentMethod: "cod",
      transactionCode: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  //const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const getDeliveryCharge = (amount: number): number => {
    if (amount <= 1000) return 150;
    if (amount <= 5000) return 200; // covers >1000 up to 5000
    return 300; // >5000
  };

  const deliverycharge = getDeliveryCharge(subtotal);
  const tax = subtotal * 0.0; // No tax for simplicity
  const total = subtotal + tax + deliverycharge;

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
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          payment_method: values.paymentMethod,
          payment_status: values.paymentMethod === "bank_transfer" ? "pending" : "confirmed",
          order_status: "pending",
          shipping_address: values.address,
          phone: values.phone,
          transaction_code: values.transactionCode || null,
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
                          <Input placeholder="+1234567890" {...field} />
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
                <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-4"
                        >
                          <div className="flex items-center space-x-2 border rounded-lg p-4">
                            <RadioGroupItem value="cod" id="cod" />
                            <Label htmlFor="cod" className="flex-1 cursor-pointer">
                              <div className="font-semibold">Cash on Delivery</div>
                              <div className="text-sm text-muted-foreground">
                                Pay when you receive your order
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-lg p-4">
                            <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                            <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                              <div className="font-semibold">Bank Transfer</div>
                              <div className="text-sm text-muted-foreground">
                                Transfer to our bank account
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {paymentMethod === "bank_transfer" && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-3">Bank Transfer Details</h3>
                    <div className="space-y-2 text-sm mb-4">
                      <p><strong>Account Name:</strong> Ajay Bhada Center</p>
                      <p><strong>Account Number:</strong> 02301017504873</p>
                      <p><strong>Bank Name:</strong> Nabil Bank</p>
                      <p><strong>Branch:</strong> Hetauda Branch</p>
                      <p><strong>SWIFT Code:</strong> NARBNPKA</p>
                    </div>
                    {/* <div className="mb-4">
                      <p className="text-sm font-semibold mb-2">Or scan QR code:</p>
                      <img src={bankQRCode1} alt="Payment QR Code" className="w-90 h-90 border rounded" />
                      <img src={bankQRCode2} alt="Payment QR Code" className="w-20 h-20 border rounded" />
                    </div> */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-2">Or scan QR code:</p>
                      <div className="flex gap-4 items-center">
                        <img src={bankQRCode1} alt="Payment QR Code" className="w-90 h-90 border rounded" />
                        <img src={bankQRCode2} alt="Payment QR Code" className="w-65 h-60 border rounded" />
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="transactionCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction/Reference Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter transaction reference number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
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
                    Rs.{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            {/* <div className="border-t pt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">Rs.{total.toFixed(2)}</span>
            </div> */}
            <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Charge</span>
              <span className="font-medium">Rs. {deliverycharge.toFixed(2)}</span>
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