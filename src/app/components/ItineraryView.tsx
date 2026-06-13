import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import type { Itinerary, DayPlan, Activity } from "./itineraryGenerator";
import {
  MapPin, Clock, DollarSign, Star, ThumbsUp,
  Info, Utensils, Map, Landmark, Trees, Zap, Hotel, Bus,
  ChevronDown, ChevronUp, RefreshCw, CheckCircle, BookmarkPlus, BookmarkCheck
} from "lucide-react";

const activityTypeConfig: Record<Activity["type"], { icon: typeof Utensils; color: string; label: string }> = {
  food: { icon: Utensils, color: "bg-amber-100 text-amber-800", label: "Gastronomía" },
  culture: { icon: Landmark, color: "bg-blue-100 text-blue-800", label: "Cultura" },
  outdoor: { icon: Trees, color: "bg-emerald-100 text-emerald-800", label: "Aire libre" },
  leisure: { icon: Star, color: "bg-purple-100 text-purple-800", label: "Ocio" },
  transport: { icon: Bus, color: "bg-slate-100 text-slate-700", label: "Transporte" },
  accommodation: { icon: Hotel, color: "bg-rose-100 text-rose-800", label: "Alojamiento" },
};

function ActivityCard({ activity }: { activity: Activity }) {
  const [expanded, setExpanded] = useState(false);
  const config = activityTypeConfig[activity.type];
  const Icon = config.icon;

  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="w-px flex-1 bg-border mt-1 group-last:hidden" />
      </div>

      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <span className="text-xs text-muted-foreground font-mono">
              {activity.time}
            </span>
            <h4 className="leading-snug mt-0.5">{activity.title}</h4>
          </div>

          <span className="text-sm text-muted-foreground shrink-0 mt-1">
            ${activity.cost}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {activity.description}
        </p>

        {activity.tip && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
          >
            <Info className="w-3 h-3" />
            {expanded ? "Ocultar consejo" : "Ver consejo local"}
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}

        {expanded && activity.tip && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-primary/8 border border-primary/20 text-xs text-primary">
            💡 {activity.tip}
          </div>
        )}
      </div>
    </div>
  );
}

function DayCard({ day }: { day: DayPlan }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Día {day.day}
        </span>

        <span className="text-sm text-muted-foreground">
          ${day.dailyBudget}/día
        </span>
      </div>

      <h3 className="mb-1">{day.theme}</h3>

      <Separator className="my-4" />

      <div>
        {day.activities.map((act, i) => (
          <ActivityCard key={i} activity={act} />
        ))}
      </div>
    </div>
  );
}

interface FeedbackState {
  rating: number | null;
  liked: string[];
  comment: string;
  submitted: boolean;
}

interface Props {
  itinerary: Itinerary;
  onRegenerate: () => void;
  onModify: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function ItineraryView({
  itinerary,
  onRegenerate,
  onModify,
  onSave,
  isSaved
}: Props) {
  const [feedback, setFeedback] = useState<FeedbackState>({
    rating: null,
    liked: [],
    comment: "",
    submitted: false,
  });

  const toggleLiked = (item: string) => {
    setFeedback((prev) => ({
      ...prev,
      liked: prev.liked.includes(item)
        ? prev.liked.filter((i) => i !== item)
        : [...prev.liked, item],
    }));
  };

  const submitFeedback = () => {
    setFeedback((prev) => ({
      ...prev,
      submitted: true,
    }));
  };

  const FEEDBACK_ASPECTS = [
    "Actividades culturales",
    "Opciones gastronómicas",
    "Ritmo del itinerario",
    "Distribución del presupuesto",
    "Diversidad de experiencias",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
        <div className="flex items-start gap-3 mb-4">
          <MapPin className="w-5 h-5 mt-0.5 shrink-0" />

          <div>
            <h2 className="text-primary-foreground leading-tight">
              {itinerary.destination}
            </h2>

            <p className="text-primary-foreground/70 text-sm mt-1">
              {itinerary.totalDays} días · ~$
              {itinerary.totalEstimatedCost.toLocaleString()} USD estimado
              {itinerary.travelDate && (
                <>
                  {" "}
                  · Salida:{" "}
                  {new Date(
                    itinerary.travelDate + "T12:00:00"
                  ).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </>
              )}
            </p>
          </div>
        </div>

        <p className="text-primary-foreground/85 text-sm leading-relaxed">
          {itinerary.summary}
        </p>

        {itinerary.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {itinerary.highlights.map((h, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-full bg-primary-foreground/15 text-primary-foreground/90"
              >
                ✦ {h}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onModify}
          className="flex-1 gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Modificar
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          className="gap-1.5"
        >
          <Zap className="w-3.5 h-3.5" />
          Regenerar
        </Button>

        {onSave && (
          <Button
            size="sm"
            variant={isSaved ? "outline" : "default"}
            onClick={onSave}
            disabled={isSaved}
            className="gap-1.5"
          >
            {isSaved ? (
              <BookmarkCheck className="w-3.5 h-3.5" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5" />
            )}

            {isSaved ? "Guardado" : "Guardar"}
          </Button>
        )}
      </div>

      <Tabs defaultValue="itinerary">
        <TabsList className="w-full">
          <TabsTrigger value="itinerary" className="flex-1">
            Itinerario
          </TabsTrigger>

          <TabsTrigger value="info" className="flex-1">
            Info práctica
          </TabsTrigger>

          <TabsTrigger value="feedback" className="flex-1">
            Valorar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary" className="space-y-4 mt-4">
          {itinerary.days.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {[
              {
                icon: Clock,
                label: "Mejor época para visitar",
                value: itinerary.practicalInfo.bestTimeToVisit,
              },
              {
                icon: DollarSign,
                label: "Moneda",
                value: itinerary.practicalInfo.currency,
              },
              {
                icon: Map,
                label: "Idioma",
                value: itinerary.practicalInfo.language,
              },
              {
                icon: Bus,
                label: "Transporte recomendado",
                value: itinerary.practicalInfo.transportation,
              },
              {
                icon: Hotel,
                label: "Alojamiento sugerido",
                value: itinerary.practicalInfo.accommodation,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-4">
                <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />

                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Budget breakdown */}
          <div className="bg-card rounded-xl border border-border p-4 mt-4">
            <h4 className="mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Desglose del presupuesto
            </h4>

            <div className="space-y-2">
              {[
                { label: "Alojamiento", pct: 35 },
                { label: "Alimentación", pct: 30 },
                { label: "Actividades", pct: 20 },
                { label: "Transporte", pct: 10 },
                { label: "Imprevistos", pct: 5 },
              ].map(({ label, pct }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-28 shrink-0">
                    {label}
                  </span>

                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="mt-4">
          {feedback.submitted ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />

              <h3 className="mb-2">¡Gracias por tu valoración!</h3>

              <p className="text-sm text-muted-foreground">
                Tu feedback nos ayuda a mejorar los itinerarios futuros.
              </p>

              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  setFeedback({
                    rating: null,
                    liked: [],
                    comment: "",
                    submitted: false,
                  })
                }
              >
                Dejar otra valoración
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-5 space-y-5">
              <div>
                <h4 className="mb-3">
                  ¿Cómo calificarías este itinerario?
                </h4>

                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setFeedback((prev) => ({
                          ...prev,
                          rating: star,
                        }))
                      }
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                        feedback.rating !== null &&
                        star <= feedback.rating
                          ? "bg-accent border-accent text-accent-foreground"
                          : "bg-muted border-border text-muted-foreground hover:border-accent"
                      }`}
                    >
                      <Star
                        className="w-4 h-4"
                        fill={
                          feedback.rating !== null &&
                          star <= feedback.rating
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3">
                  ¿Qué aspectos te gustaron más?
                </h4>

                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_ASPECTS.map((aspect) => (
                    <button
                      key={aspect}
                      onClick={() => toggleLiked(aspect)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        feedback.liked.includes(aspect)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {aspect}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm mb-2 block">
                  Comentarios adicionales
                </label>

                <textarea
                  value={feedback.comment}
                  onChange={(e) =>
                    setFeedback((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="¿Algo que mejorarías? ¿Qué echas en falta?…"
                  className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={submitFeedback}
                  disabled={feedback.rating === null}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Enviar valoración
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}