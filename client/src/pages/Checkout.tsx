import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useCartStore } from "@/store/cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QrCode, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { QRCodeSVG } from "qrcode.react";
export default function Checkout() {

  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const cartItems = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  const upiLink = `upi://pay?pa=nishu01suba-2@okhdfcbank&pn=Cloud Clutches&am=${totalPrice.toFixed(2)}&cu=INR`;
  const createOrder = useCreateOrder();

  const [formData, setFormData] = useState({
    customerName: "",
    mobileNumber: "",
    address: "",
    upiTransactionId: "",
    screenshotUrl: "",
  });

  if (cartItems.length === 0 && !createOrder.isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-xl text-muted-foreground mb-6">Your cart is empty.</p>
          <Link href="/">
            <Button className="rounded-full">Return to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (createOrder.isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
            Thank you for shopping with Cloudy Clutches. We will review your payment and process your order shortly.
          </p>
          <Link href="/">
            <Button className="rounded-full px-8 py-6 text-lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.mobileNumber || !formData.address || !formData.upiTransactionId) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields to proceed.",
        variant: "destructive"
      });
      return;
    }

    createOrder.mutate({
      ...formData,
      totalAmount: totalPrice.toString(),
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price.toString()
      }))
    }, {
      onSuccess: () => {
        clearCart();
        window.scrollTo(0,0);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </button>
        </Link>
        
        <h1 className="font-display text-4xl font-bold mb-10">Checkout</h1>
        
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-7 space-y-8">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Shipping Details */}
              <Card className="rounded-3xl shadow-sm border-border/50">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <h2 className="font-display text-2xl font-semibold border-b pb-4">Shipping Details</h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input 
                        id="customerName"
                        className="rounded-xl h-12 bg-muted/20"
                        value={formData.customerName}
                        onChange={e => setFormData({...formData, customerName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Mobile Number *</Label>
                      <Input 
                        id="mobileNumber"
                        type="tel"
                        className="rounded-xl h-12 bg-muted/20"
                        value={formData.mobileNumber}
                        onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Textarea 
                        id="address"
                        className="rounded-xl min-h-[100px] bg-muted/20 resize-none"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card className="rounded-3xl shadow-sm border-border/50 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <CardContent className="p-6 sm:p-8 space-y-8 pl-10">
                  <div>
                    <h2 className="font-display text-2xl font-semibold">Payment</h2>
                    <p className="text-muted-foreground mt-1">Scan the QR code to pay via UPI</p>
                  </div>
                  
                  <div className="bg-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center border border-primary/10">
                    <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                      {/* Placeholder for UPI QR Code - in a real app this would be a real QR */}
                      <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                        <QRCodeSVG
                          value={upiLink}
                          size={192}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="H"
                        />
                      </div>
                    </div>
                    <p className="font-medium text-lg">UPI ID: cloudcluthes@upi</p>
                    <p className="text-sm text-muted-foreground mt-1">Amount to pay: <span className="font-bold text-primary">₹{totalPrice.toFixed(2)}</span></p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upiTransactionId">UPI Transaction ID *</Label>
                      <Input 
                        id="upiTransactionId"
                        placeholder="e.g., 123456789012"
                        className="rounded-xl h-12 bg-muted/20"
                        value={formData.upiTransactionId}
                        onChange={e => setFormData({...formData, upiTransactionId: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="screenshotUrl">Payment Screenshot URL (Optional)</Label>
                      <Input 
                        id="screenshotUrl"
                        placeholder="https://..."
                        className="rounded-xl h-12 bg-muted/20"
                        value={formData.screenshotUrl}
                        onChange={e => setFormData({...formData, screenshotUrl: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <Card className="rounded-3xl shadow-lg border-primary/20 sticky top-28 bg-primary/5">
              <CardContent className="p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-card shrink-0 shadow-sm">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-semibold text-primary">
                        ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-primary/20 pt-6 space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-primary/20 mt-3">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-display font-bold text-3xl text-primary">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  form="checkout-form"
                  disabled={createOrder.isPending}
                  className="w-full py-6 mt-8 rounded-full text-lg shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
                >
                  {createOrder.isPending ? "Processing..." : "Place Order"}
                </Button>
                
                <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Secure Checkout
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
