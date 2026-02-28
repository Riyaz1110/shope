import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar flex flex-col border-r border-sidebar-border shadow-sm">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">Cloud Admin</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.name} href={link.href}>
              <button className={cn(
                "flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <link.icon className={cn("w-5 h-5", isActive ? "text-primary" : "")} />
                {link.name}
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button 
          onClick={() => logout.mutate()}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout Account
        </button>
      </div>
    </div>
  );
}
