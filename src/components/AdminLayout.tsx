import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingCart, Image, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { path: "/admin/banners", label: "Banners", icon: Image },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="p-4 border-t">
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Store
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;