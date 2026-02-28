import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Loader2, MoreHorizontal, FileImage, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  approved: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  shipped: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
  delivered: "bg-green-100 text-green-700 hover:bg-green-100",
  cancelled: "bg-red-100 text-red-700 hover:bg-red-100",
};

const STATUS_OPTIONS = ["pending", "approved", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [_, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  if (authLoading) return <div className="h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!user) { setLocation("/admin/login"); return null; }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground">Manage incoming orders and payments.</p>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>UPI ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : !orders?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.toString().padStart(4, '0')}</TableCell>
                    <TableCell>{order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : "-"}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.mobileNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">₹{order.totalAmount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{order.upiTransactionId}</span>
                        {order.screenshotUrl && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:text-primary">
                                <FileImage className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Payment Screenshot</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 rounded-xl overflow-hidden border border-border">
                                <img src={order.screenshotUrl} alt="Payment Receipt" className="w-full h-auto" />
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[order.status] || "bg-muted"}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Update Status</div>
                          {STATUS_OPTIONS.map(status => (
                            <DropdownMenuItem 
                              key={status}
                              onClick={() => updateStatus.mutate({ id: order.id, status })}
                              disabled={order.status === status}
                              className="capitalize cursor-pointer"
                            >
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
