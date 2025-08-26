import { useState } from "react";
import { Customer } from "@shared/schema";
import { X, Search, Filter, SortAsc, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomerForm from "./customer-form";
import CustomerList from "./customer-list";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerSidebarProps {
  customers: Customer[];
  isLoading: boolean;
  onCustomerSelect: (customer: Customer) => void;
  onClose: () => void;
  isMobile: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function CustomerSidebar({
  customers,
  isLoading,
  onCustomerSelect,
  onClose,
  isMobile,
  searchQuery,
  onSearchChange,
}: CustomerSidebarProps) {
  const [showForm, setShowForm] = useState(false);

  const totalCustomers = customers.length;
  const activeZones = new Set(customers.map(c => `${Math.floor(parseFloat(c.lat) * 100)},${Math.floor(parseFloat(c.lng) * 100)}`)).size;

  return (
    <>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground" data-testid="text-customers-title">
            Clientes
          </h2>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-sidebar"
            >
              <X size={16} />
            </Button>
          )}
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <div className="text-2xl font-bold text-primary" data-testid="text-total-customers">
                {totalCustomers}
              </div>
            )}
            <div className="text-sm text-muted-foreground">Total Clientes</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <div className="text-2xl font-bold text-accent" data-testid="text-active-zones">
                {activeZones}
              </div>
            )}
            <div className="text-sm text-muted-foreground">Zonas Activas</div>
          </div>
        </div>

        {/* Mobile Search */}
        {isMobile && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="text"
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              data-testid="input-mobile-search"
            />
          </div>
        )}
      </div>
      
      {/* Add Customer Form */}
      <div className="p-6 border-b border-border">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full"
          data-testid="button-toggle-form"
        >
          <Plus size={16} className="mr-2" />
          Agregar Cliente
        </Button>
        
        {showForm && (
          <div className="mt-4">
            <CustomerForm 
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </div>
      
      {/* Customer List Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Lista de Clientes</span>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" title="Filtrar" data-testid="button-filter">
              <Filter size={14} />
            </Button>
            <Button variant="ghost" size="sm" title="Ordenar" data-testid="button-sort">
              <SortAsc size={14} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Customer List */}
      <div className="flex-1 overflow-y-auto">
        <CustomerList
          customers={customers}
          isLoading={isLoading}
          onCustomerSelect={onCustomerSelect}
        />
      </div>
    </>
  );
}
