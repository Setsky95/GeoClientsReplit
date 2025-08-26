import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Customer } from "@shared/schema";
import CustomerSidebar from "@/components/customer-sidebar";
import MapContainer from "@/components/map-container";
import MapControls from "@/components/map-controls";
import { Search, Menu, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [manualMode, setManualMode] = useState(false);
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

  // Funciones para controlar el mapa
  const handleZoomIn = () => {
    if (window.currentMapHandlers) {
      window.currentMapHandlers.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (window.currentMapHandlers) {
      window.currentMapHandlers.zoomOut();
    }
  };

  const handleMyLocation = () => {
    if (window.currentMapHandlers) {
      window.currentMapHandlers.myLocation();
    }
  };

  if (isMobile) {
    // Layout móvil: Mapa arriba, UI abajo
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Header para móvil */}
        <header className="bg-white shadow-sm border-b border-border h-16 flex items-center px-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="text-primary-foreground" size={16} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground" data-testid="title-header">
                Mapa de Clientes
              </h1>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="button-mobile-menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </header>

        {/* Mapa superior en móvil */}
        <div className="flex-1 min-h-0">
          <MapContainer
            customers={customers}
            selectedCustomer={selectedCustomer}
            onCustomerSelect={handleCustomerSelect}
            manualMode={manualMode}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onMyLocation={handleMyLocation}
          />
        </div>

        {/* UI inferior en móvil */}
        <div className="bg-white border-t border-border">
          {/* Controles del mapa en móvil */}
          <div className="p-4 border-b border-border">
            <MapControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onMyLocation={handleMyLocation}
              manualMode={manualMode}
              onManualModeChange={setManualMode}
            />
          </div>

          {/* Lista de clientes collapsible en móvil */}
          {sidebarOpen && (
            <div className="max-h-96 overflow-y-auto">
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
          )}
        </div>
      </div>
    );
  }

  // Layout desktop: UI izquierda, Mapa derecha
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header para desktop */}
      <header className="bg-white shadow-sm border-b border-border h-16 flex items-center px-6">
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
        
        {/* Search Bar en header para desktop */}
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
      </header>

      <div className="flex flex-1">
        {/* Panel izquierdo: Clientes + Controles */}
        <div className="w-96 bg-white shadow-lg border-r border-border flex flex-col">
          {/* Lista de clientes */}
          <div className="flex-1 overflow-hidden">
            <CustomerSidebar
              customers={displayCustomers}
              isLoading={isLoading}
              onCustomerSelect={handleCustomerSelect}
              onClose={() => setSidebarOpen(false)}
              isMobile={false}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Controles del mapa */}
          <div className="border-t border-border p-4">
            <MapControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onMyLocation={handleMyLocation}
              manualMode={manualMode}
              onManualModeChange={setManualMode}
            />
          </div>
        </div>

        {/* Panel derecho: Solo el mapa */}
        <div className="flex-1">
          <MapContainer
            customers={customers}
            selectedCustomer={selectedCustomer}
            onCustomerSelect={handleCustomerSelect}
            manualMode={manualMode}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onMyLocation={handleMyLocation}
          />
        </div>
      </div>
    </div>
  );
}
