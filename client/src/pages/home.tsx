import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Customer } from "@shared/schema";
import CustomerSidebar from "@/components/customer-sidebar";
import MapContainer from "@/components/map-container";
import { Search, Menu, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const isMobile = useIsMobile();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: searchResults = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers/search", searchQuery],
    enabled: searchQuery.length > 0,
  });

  const displayCustomers = searchQuery ? searchResults : customers;

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border h-16 flex items-center px-6 relative z-50">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="text-primary-foreground" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground" data-testid="title-header">
                Mapa de Clientes
              </h1>
              <p className="text-sm text-muted-foreground">La Plata y alrededores</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          {!isMobile && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="Buscar cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search"
              />
            </div>
          )}
          
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="button-mobile-menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 pt-0 relative">
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
            data-testid="mobile-overlay"
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            "w-96 bg-white shadow-lg border-r border-border flex flex-col sidebar-transition z-40",
            isMobile ? "fixed h-full" : "relative",
            isMobile && !sidebarOpen && "-translate-x-full"
          )}
        >
          <CustomerSidebar
            customers={displayCustomers}
            isLoading={isLoading}
            onCustomerSelect={handleCustomerSelect}
            onClose={() => setSidebarOpen(false)}
            isMobile={isMobile}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            customers={customers}
            selectedCustomer={selectedCustomer}
            onCustomerSelect={handleCustomerSelect}
          />
        </div>
      </div>
    </div>
  );
}
