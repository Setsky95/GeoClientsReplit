import { useEffect, useRef, useState } from "react";
import { Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Minus, Crosshair, Flame, Layers, MapPin } from "lucide-react";

interface MapContainerProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function MapContainer({ 
  customers, 
  selectedCustomer, 
  onCustomerSelect 
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
            <p class="text-sm text-gray-600 mb-1">${customer.address}</p>
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

    const address = prompt("Dirección:") || "Ubicación manual";
    const phone = prompt("Teléfono:") || "";
    const description = prompt("Descripción (opcional):") || "";

    const customerData = {
      name,
      address,
      phone,
      description,
      lat: latlng.lat.toString(),
      lng: latlng.lng.toString(),
    };

    createCustomerMutation.mutate(customerData);
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleMyLocation = () => {
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
    <div className="relative w-full h-full">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <div className="bg-white rounded-lg shadow-lg p-1">
          <div className="flex flex-col space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={handleZoomIn}
              title="Zoom In"
              data-testid="button-zoom-in"
            >
              <Plus size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={handleZoomOut}
              title="Zoom Out"
              data-testid="button-zoom-out"
            >
              <Minus size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={handleMyLocation}
              title="Mi Ubicación"
              data-testid="button-my-location"
            >
              <Crosshair size={16} />
            </Button>
          </div>
        </div>
        
        {/* Map Layers Toggle */}
        <div className="bg-white rounded-lg shadow-lg p-1">
          <div className="flex flex-col space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              title="Mapa de Calor"
              data-testid="button-heatmap"
            >
              <Flame size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              title="Agrupar Pines"
              data-testid="button-clusters"
            >
              <Layers size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Manual Pin Mode Toggle */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-3">
            <MapPin className="text-accent" size={16} />
            <div>
              <p className="text-sm font-medium text-foreground">Modo Manual</p>
              <p className="text-xs text-muted-foreground">Click en el mapa para agregar pin</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={manualMode}
                onChange={(e) => setManualMode(e.target.checked)}
                className="sr-only peer"
                data-testid="toggle-manual-mode"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Leyenda</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-success rounded-full"></div>
              <span className="text-xs text-muted-foreground">Zona Baja Densidad</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-accent rounded-full"></div>
              <span className="text-xs text-muted-foreground">Zona Media Densidad</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-destructive rounded-full"></div>
              <span className="text-xs text-muted-foreground">Zona Alta Densidad</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ cursor: manualMode ? 'crosshair' : 'grab' }}
        data-testid="map-container"
      />
    </div>
  );
}
