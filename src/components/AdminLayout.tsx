import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingCart, Image, ArrowLeft, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { path: "/admin/banners", label: "Banners", icon: Image },
    { path: "/admin/users", label: "User Roles", icon: UserCog },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r md:border-b-0 border-b flex flex-col md:sticky md:top-0 md:h-screen">
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>
        <nav className="flex-1 p-3 md:p-4 overflow-x-auto md:overflow-x-visible">
          <div className="flex md:flex-col md:space-y-2 space-x-2 md:space-x-0 min-w-max md:min-w-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={cn(
                      "flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                    <span className="font-medium text-sm md:text-base">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="p-3 md:p-4 border-t">
          <Button asChild variant="outline" className="w-full text-sm md:text-base">
            <Link to="/">
              <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
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