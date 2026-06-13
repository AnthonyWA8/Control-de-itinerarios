import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { CalendarDays } from "lucide-react";
import { Textarea } from "./ui/textarea";
import {
  MapPin, Clock, DollarSign, Heart, AlertCircle,
  Plane, Mountain, Utensils, Camera, Music, Compass,
  Waves, Building2, TreePine, ShoppingBag, Sparkles
} from "lucide-react";

export interface TravelPreferences {
  destination: string;
  travelDate: string;
  duration: number;
  budget: number;
  budgetType: "budget" | "moderate" | "luxury";
  interests: string[];
  restrictions: string;
  travelStyle: string;
  groupType: string;
}

const INTERESTS = [
  { id: "outdoor", label: "Aire libre", icon: Mountain },
  { id: "culture", label: "Cultura", icon: Building2 },
  { id: "food", label: "Gastronomía", icon: Utensils },
  { id: "adventure", label: "Aventura", icon: Compass },
  { id: "beach", label: "Playas", icon: Waves },
  { id: "photography", label: "Fotografía", icon: Camera },
  { id: "nightlife", label: "Vida nocturna", icon: Music },
  { id: "nature", label: "Naturaleza", icon: TreePine },
  { id: "shopping", label: "Compras", icon: ShoppingBag },
];

const GROUP_TYPES = [
  { id: "solo", label: "Solo" },
  { id: "couple", label: "Pareja" },
  { id: "family", label: "Familia" },
  { id: "friends", label: "Amigos" },
];

const TRAVEL_STYLES = [
  { id: "relaxed", label: "Relajado" },
  { id: "balanced", label: "Equilibrado" },
  { id: "intensive", label: "Intensivo" },
];

interface Props {
  onGenerate: (prefs: TravelPreferences) => void;
  loading: boolean;
  initialDestination?: string;
}

export function TravelForm({ onGenerate, loading, initialDestination = "" }: Props) {
  const [destination, setDestination] = useState(initialDestination);
  const [travelDate, setTravelDate] = useState("");
  const [duration, setDuration] = useState(5);
  const [budget, setBudget] = useState(1500);
  const [budgetType, setBudgetType] = useState<"budget" | "moderate" | "luxury">("moderate");
  const [interests, setInterests] = useState<string[]>(["culture", "food"]);
  const [restrictions, setRestrictions] = useState("");
  const [travelStyle, setTravelStyle] = useState("balanced");
  const [groupType, setGroupType] = useState("couple");

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };


  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    onGenerate({ destination, travelDate, duration, budget, budgetType, interests, restrictions, travelStyle, groupType });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Destination */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Destino
        </Label>
        <Input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Ej: Tokio, Japón · París, Francia · Machu Picchu"
          required
          className="bg-input-background border-border"
        />
      </div>

      {/* Travel Date */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          Fecha de viaje <span className="text-muted-foreground text-sm">(opcional)</span>
        </Label>
        <Input
          type="date"
          value={travelDate}
          min={today}
          onChange={(e) => setTravelDate(e.target.value)}
          className="bg-input-background border-border"
        />
        {travelDate && (
          <p className="text-xs text-muted-foreground">
            Salida: {new Date(travelDate + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
      </div>

      {/* Duration */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Duración: <span className="text-primary">{duration} {duration === 1 ? "día" : "días"}</span>
        </Label>
        <Slider
          min={1}
          max={21}
          step={1}
          value={[duration]}
          onValueChange={([v]) => setDuration(v)}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 día</span>
          <span>3 semanas</span>
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Presupuesto: <span className="text-primary">${budget.toLocaleString()} USD</span>
        </Label>
        <Slider
          min={200}
          max={10000}
          step={100}
          value={[budget]}
          onValueChange={([v]) => setBudget(v)}
          className="py-2"
        />
        <div className="flex gap-2 mt-2">
          {(["budget", "moderate", "luxury"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setBudgetType(type)}
              className={`flex-1 py-1.5 rounded-md text-sm border transition-all ${
                budgetType === type
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {type === "budget" ? "Económico" : type === "moderate" ? "Moderado" : "Lujo"}
            </button>
          ))}
        </div>
      </div>

      {/* Group Type */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-primary" />
          Tipo de viajero
        </Label>
        <div className="flex gap-2 flex-wrap">
          {GROUP_TYPES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setGroupType(id)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                groupType === id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Travel Style */}
      <div className="space-y-2">
        <Label>Ritmo del viaje</Label>
        <div className="flex gap-2">
          {TRAVEL_STYLES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTravelStyle(id)}
              className={`flex-1 py-1.5 rounded-md text-sm border transition-all ${
                travelStyle === id
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card border-border text-muted-foreground hover:border-accent/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          Intereses <span className="text-muted-foreground text-sm">(selecciona varios)</span>
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {INTERESTS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleInterest(id)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-sm transition-all ${
                interests.includes(id)
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Restrictions */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          Restricciones o requisitos especiales <span className="text-muted-foreground text-sm">(opcional)</span>
        </Label>
        <Textarea
          value={restrictions}
          onChange={(e) => setRestrictions(e.target.value)}
          placeholder="Ej: dieta vegetariana, movilidad reducida, viaje con niños pequeños, sin vuelos…"
          className="bg-input-background border-border resize-none"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={loading || !destination.trim() || interests.length === 0}
        className="w-full bg-primary text-primary-foreground gap-2 py-6"
        size="lg"
      >
        <Sparkles className="w-5 h-5" />
        {loading ? "Generando tu itinerario…" : "Generar itinerario personalizado"}
      </Button>
    </form>
  );
}
