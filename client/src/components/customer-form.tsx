import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, type InsertCustomer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CustomerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface GeocodeResponse {
  lat: number;
  lng: number;
  formatted_address: string;
}

export default function CustomerForm({ onSuccess, onCancel }: CustomerFormProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      street: "",
      number: "",
      phone: "",
      description: "",
      lat: "",
      lng: "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const response = await apiRequest("POST", "/api/customers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Cliente agregado",
        description: "El cliente ha sido agregado exitosamente",
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo agregar el cliente",
        variant: "destructive",
      });
    },
  });

  const geocodeAddress = async (address: string): Promise<GeocodeResponse | null> => {
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      return null;
    }
  };

  const onSubmit = async (data: InsertCustomer) => {
    setIsGeocoding(true);
    
    try {
      // Combinar calle y numero para geocodificación
      const fullAddress = `${data.street} ${data.number}`;
      const geocodeResult = await geocodeAddress(fullAddress);
      
      if (geocodeResult) {
        const customerData = {
          ...data,
          lat: geocodeResult.lat.toString(),
          lng: geocodeResult.lng.toString(),
        };
        createCustomerMutation.mutate(customerData);
      } else {
        toast({
          title: "Error de geocodificación",
          description: "No se pudo encontrar la dirección. Verifica que la calle y número estén en La Plata y alrededores.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar la dirección",
        variant: "destructive",
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const isLoading = createCustomerMutation.isPending || isGeocoding;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-foreground">
          Nombre *
        </Label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="Juan Pérez"
          className="mt-1"
          data-testid="input-customer-name"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="street" className="text-sm font-medium text-foreground">
            Calle *
          </Label>
          <Input
            id="street"
            {...form.register("street")}
            placeholder="Calle 7"
            className="mt-1"
            data-testid="input-customer-street"
          />
          {form.formState.errors.street && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.street.message}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="number" className="text-sm font-medium text-foreground">
            Número *
          </Label>
          <Input
            id="number"
            {...form.register("number")}
            placeholder="852"
            className="mt-1"
            data-testid="input-customer-number"
          />
          {form.formState.errors.number && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.number.message}
            </p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="phone" className="text-sm font-medium text-foreground">
          Teléfono *
        </Label>
        <Input
          id="phone"
          {...form.register("phone")}
          placeholder="+54 221 123-4567"
          className="mt-1"
          data-testid="input-customer-phone"
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>
      
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-foreground">
          Descripción (Opcional)
        </Label>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Información adicional..."
          rows={2}
          className="mt-1"
          data-testid="textarea-customer-description"
        />
      </div>
      
      <div className="flex space-x-2">
        <Button
          type="submit"
          className="flex-1 bg-accent hover:bg-accent/90"
          disabled={isLoading}
          data-testid="button-save-customer"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isGeocoding ? "Ubicando..." : "Guardar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          data-testid="button-cancel-form"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
