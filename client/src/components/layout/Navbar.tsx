import { Link } from "wouter";
import { ShoppingBag, Menu, Sparkles, UserCircle } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function Navbar() {
    const totalPrice = useCartStore((state) => state.totalPrice);
    const cartItemsCount = useCartStore((state) => state.totalItems());
    const cartItems = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-foreground">
                Cloudy Clutches
              </span>
            </Link>
          </div>

          <div className="flex-1 flex justify-end items-center gap-4">
            <Link href="/admin/login">
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                <UserCircle className="w-5 h-5" />
              </Button>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 transition-all">
                  <ShoppingBag className="w-5 h-5 text-foreground" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-in zoom-in">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md bg-background/95 backdrop-blur-xl border-l-primary/10">
                <SheetHeader className="pb-6">
                  <SheetTitle className="font-display text-2xl">Your Cart</SheetTitle>
                </SheetHeader>
                
                {cartItemsCount === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-muted-foreground">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-primary/50" />
                    </div>
                    <p className="text-lg">Your cart is feeling light.</p>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="mt-4 rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white">
                        Browse Collection
                      </Button>
                    </SheetTrigger>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <ScrollArea className="flex-1 -mx-6 px-6">
                      <div className="space-y-6">
                        {cartItems.map((item) => (
                          <div key={item.product.id} className="flex gap-4 items-center">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted/30 border border-primary/10 shrink-0">
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground truncate">{item.product.name}</h4>
                              <p className="text-sm text-primary font-medium mt-1">₹{item.product.price}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center rounded-full border border-border/50 bg-background">
                                  <button 
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                                <button 
                                  onClick={() => removeItem(item.product.id)}
                                  className="text-xs text-muted-foreground hover:text-destructive underline underline-offset-4"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="pt-6 pb-8 border-t border-border mt-auto">
                      <div className="flex justify-between items-center mb-6">
                        <span className="font-medium text-muted-foreground">Subtotal</span>
                        <span className="font-display text-2xl font-bold text-foreground">₹{totalPrice().toFixed(2)}</span>
                      </div>
                      <SheetTrigger asChild>
                        <Link href="/checkout">
                          <Button className="w-full py-6 rounded-full text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                            Proceed to Checkout
                          </Button>
                        </Link>
                      </SheetTrigger>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
