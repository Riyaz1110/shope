import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ShoppingBag, CreditCard, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [_, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: products, isLoading: productsLoading } = useProducts();

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) {
    setLocation("/admin/login");
    return null;
  }

  const isLoading = ordersLoading || productsLoading;
  
  const totalRevenue = orders?.reduce((sum, order) => {
    return order.status !== 'cancelled' ? sum + Number(order.totalAmount) : sum;
  }, 0) || 0;
  
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        <h1 className="font-display text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground mb-10">Welcome back! Here's what's happening today.</p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl border-border/50 shadow-sm bg-card hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <h3 className="font-display text-2xl font-bold">₹{totalRevenue.toFixed(2)}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl border-border/50 shadow-sm bg-card hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                    <h3 className="font-display text-2xl font-bold">{pendingOrders}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm bg-card hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                    <h3 className="font-display text-2xl font-bold">{products?.length || 0}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
