import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Crosshair, Flame, Layers, MapPin } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
  manualMode: boolean;
  onManualModeChange: (enabled: boolean) => void;
}

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onMyLocation,
  manualMode,
  onManualModeChange,
}: MapControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      {/* Zoom Controls */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Controles de Zoom</h4>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomIn}
            title="Zoom In"
            data-testid="button-zoom-in"
          >
            <Plus size={16} className="mr-1" />
            Acercar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomOut}
            title="Zoom Out"
            data-testid="button-zoom-out"
          >
            <Minus size={16} className="mr-1" />
            Alejar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onMyLocation}
            title="Mi Ubicación"
            data-testid="button-my-location"
          >
            <Crosshair size={16} className="mr-1" />
            Mi Ubicación
          </Button>
        </div>
      </div>

      {/* Manual Pin Mode */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Modo Manual</h4>
        <div className="flex items-center space-x-3 bg-muted/50 rounded-lg p-3">
          <MapPin className="text-accent" size={16} />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Agregar Pin Manual</p>
            <p className="text-xs text-muted-foreground">Click en el mapa para agregar cliente</p>
          </div>
          <Switch
            checked={manualMode}
            onCheckedChange={onManualModeChange}
            data-testid="toggle-manual-mode"
          />
        </div>
      </div>

      {/* Map Tools */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Herramientas</h4>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            title="Mapa de Calor"
            data-testid="button-heatmap"
          >
            <Flame size={16} className="mr-1" />
            Densidad
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Agrupar Pines"
            data-testid="button-clusters"
          >
            <Layers size={16} className="mr-1" />
            Agrupar
          </Button>
        </div>
      </div>

      {/* Map Legend */}
      <div>
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
  );
}