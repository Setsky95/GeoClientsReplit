import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface CustomerListProps {
  customers: Customer[];
  isLoading: boolean;
  onCustomerSelect: (customer: Customer) => void;
}

export default function CustomerList({ 
  customers, 
  isLoading, 
  onCustomerSelect 
}: CustomerListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      deleteCustomerMutation.mutate(id);
    }
  };

  const getDensityColor = (index: number, total: number) => {
    const percentage = index / total;
    if (percentage < 0.33) return "bg-success";
    if (percentage < 0.66) return "bg-accent";
    return "bg-destructive";
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-4">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-1" />
            <Skeleton className="h-4 w-36 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p data-testid="text-no-customers">No hay clientes registrados</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {customers.map((customer, index) => (
        <div
          key={customer.id}
          className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => onCustomerSelect(customer)}
          data-testid={`card-customer-${customer.id}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-foreground" data-testid={`text-customer-name-${customer.id}`}>
                {customer.name}
              </h4>
              <p className="text-sm text-muted-foreground mt-1" data-testid={`text-customer-address-${customer.id}`}>
                {customer.address}
              </p>
              <p className="text-sm text-muted-foreground" data-testid={`text-customer-phone-${customer.id}`}>
                {customer.phone}
              </p>
              {customer.description && (
                <p className="text-xs text-muted-foreground/70 mt-2" data-testid={`text-customer-description-${customer.id}`}>
                  {customer.description}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-3">
              <div 
                className={cn(
                  "w-3 h-3 rounded-full",
                  getDensityColor(index, customers.length)
                )}
              />
              <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                  title="Editar"
                  data-testid={`button-edit-${customer.id}`}
                >
                  <Edit size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => handleDelete(e, customer.id)}
                  title="Eliminar"
                  disabled={deleteCustomerMutation.isPending}
                  data-testid={`button-delete-${customer.id}`}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
