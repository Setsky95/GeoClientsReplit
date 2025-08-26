import { useEffect, useRef, useState } from "react";
import { Customer } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MapContainerProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  manualMode: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function MapContainer({ 
  customers, 
  selectedCustomer, 
  onCustomerSelect,
  manualMode,
  onZoomIn,
  onZoomOut,
  onMyLocation
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Exponer funciones del mapa a los props
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Asignar funciones para que los controles externos puedan usarlas
    const zoomIn = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.zoomIn();
      }
    };
    
    const zoomOut = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.zoomOut();
      }
    };
    
    const myLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([latitude, longitude], 15);
            }
          },
          () => {
            toast({
              title: "Error de ubicación",
              description: "No se pudo obtener tu ubicación",
              variant: "destructive",
            });
          }
        );
      }
    };

    // Exponer las funciones (esto se ejecutará cuando se monte el mapa)
    window.mapZoomIn = zoomIn;
    window.mapZoomOut = zoomOut;
    window.mapMyLocation = myLocation;
    
    return () => {
      // Limpiar funciones globales
      delete window.mapZoomIn;
      delete window.mapZoomOut;
      delete window.mapMyLocation;
    };
  }, [mapInstanceRef.current]);

  const createCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/customers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Cliente agregado",
        description: "Cliente agregado exitosamente en el mapa",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el cliente",
        variant: "destructive",
      });
    },
  });

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && !window.L) {
      // Create link element for CSS
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(cssLink);

      // Create script element for JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        setIsLoaded(true);
      };
      document.head.appendChild(script);
    } else if (window.L) {
      setIsLoaded(true);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;

    // La Plata coordinates
    const laPlataCords: [number, number] = [-34.9215, -57.9545];

    const map = L.map(mapRef.current).setView(laPlataCords, 13);

    // OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    // Manual pin placement
    map.on("click", (e: any) => {
      if (manualMode) {
        handleManualPinPlacement(e.latlng);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLoaded, manualMode]);

  // Exponer funciones de mapa
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Estas funciones serán llamadas desde los controles externos
    const zoomInHandler = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.zoomIn();
      }
    };
    
    const zoomOutHandler = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.zoomOut();
      }
    };
    
    const myLocationHandler = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([latitude, longitude], 15);
            }
          },
          () => {
            toast({
              title: "Error de ubicación",
              description: "No se pudo obtener tu ubicación",
              variant: "destructive",
            });
          }
        );
      }
    };

    // Conectar las funciones con los props que vienen del padre
    window.currentMapHandlers = {
      zoomIn: zoomInHandler,
      zoomOut: zoomOutHandler,
      myLocation: myLocationHandler
    };
    
    return () => {
      if (window.currentMapHandlers) {
        delete window.currentMapHandlers;
      }
    };
  }, [mapInstanceRef.current]);

  // Update markers when customers change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const L = window.L;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    customers.forEach((customer, index) => {
      const lat = parseFloat(customer.lat);
      const lng = parseFloat(customer.lng);

      if (isNaN(lat) || isNaN(lng)) return;

      const marker = L.marker([lat, lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="p-3 min-w-48">
            <h4 class="font-medium text-gray-900 mb-1">${customer.name}</h4>
            <p class="text-sm text-gray-600 mb-1">${customer.street} ${customer.number}</p>
            <p class="text-sm text-gray-500 mb-1">${customer.phone}</p>
            ${customer.description ? `<p class="text-xs text-gray-400 mt-2">${customer.description}</p>` : ''}
            <div class="mt-3 space-x-2">
              <button class="text-xs text-blue-600 hover:underline" onclick="window.editCustomer('${customer.id}')">
                Editar
              </button>
              <button class="text-xs text-red-500 hover:underline" onclick="window.deleteCustomer('${customer.id}')">
                Eliminar
              </button>
            </div>
          </div>
        `);

      marker.on('click', () => {
        onCustomerSelect(customer);
      });

      markersRef.current.push(marker);
    });
  }, [customers, isLoaded, onCustomerSelect]);

  // Focus on selected customer
  useEffect(() => {
    if (!selectedCustomer || !mapInstanceRef.current) return;

    const lat = parseFloat(selectedCustomer.lat);
    const lng = parseFloat(selectedCustomer.lng);

    if (!isNaN(lat) && !isNaN(lng)) {
      mapInstanceRef.current.setView([lat, lng], 16);
    }
  }, [selectedCustomer]);

  const handleManualPinPlacement = (latlng: any) => {
    const name = prompt("Nombre del cliente:");
    if (!name) return;

    const street = prompt("Calle:") || "Calle sin nombre";
    const number = prompt("Número:") || "S/N";
    const phone = prompt("Teléfono:") || "";
    const description = prompt("Descripción (opcional):") || "";

    const customerData = {
      name,
      street,
      number,
      phone,
      description,
      lat: latlng.lat.toString(),
      lng: latlng.lng.toString(),
    };

    createCustomerMutation.mutate(customerData);
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Map Container - Sin controles superpuestos */}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ cursor: manualMode ? 'crosshair' : 'grab' }}
        data-testid="map-container"
      />
    </div>
  );
}
