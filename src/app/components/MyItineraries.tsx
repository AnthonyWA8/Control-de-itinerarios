import { useState, useEffect } from "react";
import { getUserItineraries, deleteItinerary, type SavedItinerary, type User } from "./auth";
import { ItineraryView } from "./ItineraryView";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { Itinerary } from "./itineraryGenerator";
import {
  MapPin, Calendar, DollarSign, Trash2, Eye,
  ArrowLeft, Plane, PlusCircle, Clock
} from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

interface Props {
  user: User;
  onNewTrip: () => void;
}

export function MyItineraries({ user, onNewTrip }: Props) {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<SavedItinerary | null>(null);

  const reload = () => {
    setLoading(true);
    getUserItineraries(user.id)
      .then(setItineraries)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [user.id]);

  const handleDelete = async (id: string) => {
    await deleteItinerary(id);
    reload();
    if (viewing?.id === id) setViewing(null);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground text-sm">
        Cargando tus viajes…
      </div>
    );
  }

  if (viewing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button
          onClick={() => setViewing(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis viajes
        </button>
        <div className="mb-1">
          <span className="text-xs text-muted-foreground">Guardado el {formatDate(viewing.savedAt)}</span>
        </div>
        <ItineraryView
          itinerary={viewing.itinerary}
          onRegenerate={() => {}}
          onModify={onNewTrip}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 style={{ fontFamily: "'Lora', serif" }}>Mis viajes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {itineraries.length === 0
              ? "Aún no tienes itinerarios guardados"
              : `${itineraries.length} itinerar${itineraries.length === 1 ? "io guardado" : "ios guardados"}`}
          </p>
        </div>
        <Button onClick={onNewTrip} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Nuevo viaje
        </Button>
      </div>

      {itineraries.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <Plane className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="mb-2">Sin itinerarios todavía</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Crea tu primer itinerario personalizado y aparecerá aquí guardado.
          </p>
          <Button onClick={onNewTrip} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Planear mi primer viaje
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {itineraries.map((saved) => (
            <ItineraryCard
              key={saved.id}
              saved={saved}
              onView={() => setViewing(saved)}
              onDelete={() => handleDelete(saved.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ItineraryCard({
  saved, onView, onDelete,
}: { saved: SavedItinerary; onView: () => void; onDelete: () => void }) {
  const { itinerary } = saved;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-md transition-shadow">
      {/* Color band */}
      <div className="h-2 bg-primary" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="leading-snug truncate" style={{ fontFamily: "'Lora', serif" }}>{itinerary.destination}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(saved.savedAt)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            {itinerary.totalDays} días
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            <DollarSign className="w-3 h-3" />
            ~${itinerary.totalEstimatedCost.toLocaleString()}
          </span>
        </div>

        {itinerary.highlights.length > 0 && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {itinerary.highlights[0]}
          </p>
        )}

        <div className="flex gap-2">
          <Button size="sm" onClick={onView} className="flex-1 gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Ver itinerario
          </Button>
          {confirmDelete ? (
            <div className="flex gap-1">
              <Button size="sm" variant="destructive" onClick={onDelete} className="text-xs px-2">
                Eliminar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)} className="text-xs px-2">
                Cancelar
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setConfirmDelete(true)} className="px-2.5">
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
