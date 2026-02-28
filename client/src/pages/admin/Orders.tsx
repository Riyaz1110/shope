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
    <TableHead>Address</TableHead>
    <TableHead>Total</TableHead>
    <TableHead>UPI ID</TableHead>
    <TableHead>Status</TableHead>
    <TableHead className="text-right">Actions</TableHead>
  </TableRow>
</TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : !orders?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
  <TableRow key={order.id}>
    <TableCell className="font-medium">
      #{order.id.toString().padStart(4, "0")}
    </TableCell>

    <TableCell>
      {order.createdAt
        ? format(new Date(order.createdAt), "MMM d, yyyy")
        : "-"}
    </TableCell>

    <TableCell>
      <div>
        <p className="font-medium">{order.customerName}</p>
        <p className="text-xs text-muted-foreground">
          {order.mobileNumber}
        </p>
      </div>
    </TableCell>

    {/* ADDRESS COLUMN */}
    <TableCell className="max-w-[220px]">
      <p className="text-sm break-words">
        {order.address ? order.address : "-"}
      </p>
    </TableCell>

    {/* TOTAL COLUMN */}
    <TableCell className="font-bold">
      ₹{order.totalAmount}
    </TableCell>

    {/* UPI COLUMN */}
    <TableCell>
      <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
        {order.upiTransactionId}
      </span>
    </TableCell>

    {/* STATUS COLUMN */}
    <TableCell>
      <Badge className={STATUS_COLORS[order.status] || "bg-muted"}>
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </Badge>
    </TableCell>

    {/* ACTION COLUMN */}
    <TableCell className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {STATUS_OPTIONS.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() =>
                updateStatus.mutate({ id: order.id, status })
              }
              disabled={order.status === status}
              className="capitalize"
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
