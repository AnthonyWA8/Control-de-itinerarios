import type { TravelPreferences } from "./TravelForm";
import { apiFetch } from "../lib/api";

export type { TravelPreferences };

export interface Activity {
  time: string;
  title: string;
  description: string;
  type: "food" | "culture" | "outdoor" | "leisure" | "transport" | "accommodation";
  cost: number;
  tip?: string;
}

export interface DayPlan {
  day: number;
  title: string;
  theme: string;
  activities: Activity[];
  dailyBudget: number;
}

export interface Itinerary {
  id?: string;
  destination: string;
  travelDate: string;
  totalDays: number;
  totalEstimatedCost: number;
  summary: string;
  highlights: string[];
  days: DayPlan[];
  practicalInfo: {
    bestTimeToVisit: string;
    currency: string;
    language: string;
    transportation: string;
    accommodation: string;
  };
}

function toPreferencesPayload(prefs: TravelPreferences) {
  return {
    destination: prefs.destination,
    duration: prefs.duration,
    budget: prefs.budget,
    budgetType: prefs.budgetType,
    interests: prefs.interests,
    restrictions: prefs.restrictions,
    travelStyle: prefs.travelStyle,
    groupType: prefs.groupType,
  };
}

export async function generateItinerary(prefs: TravelPreferences): Promise<Itinerary> {
  const result = await apiFetch<Itinerary>("/api/v1/itineraries/generate", {
    method: "POST",
    body: JSON.stringify({ preferences: toPreferencesPayload(prefs) }),
  });

  // NUEVO
  const dateLabel = prefs.travelDate
    ? new Date(prefs.travelDate + "T12:00:00").toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  // NUEVO
  return {
    ...result,
    travelDate: prefs.travelDate || "",
    summary: `Itinerario personalizado para ${prefs.duration} días en ${prefs.destination}${
      dateLabel ? `, con salida el ${dateLabel}` : ""
    }, diseñado para...`,
  };
}

export async function regenerateItinerary(prefs: TravelPreferences): Promise<Itinerary> {
  return apiFetch<Itinerary>("/api/v1/itineraries/regenerate", {
    method: "POST",
    body: JSON.stringify({ preferences: toPreferencesPayload(prefs) }),
  });
}

export async function refineItinerary(itineraryId: string, instruction: string): Promise<Itinerary> {
  return apiFetch<Itinerary>("/api/v1/itineraries/refine", {
    method: "POST",
    body: JSON.stringify({ itinerary_id: itineraryId, instruction }),
  });
}

export async function submitFeedback(
  itineraryId: string,
  rating: number,
  likedActivityTitles: string[] = [],
  comment?: string
): Promise<void> {
  await apiFetch<{ id: string; status: string }>("/api/v1/feedback", {
    method: "POST",
    body: JSON.stringify({
      itinerary_id: itineraryId,
      rating,
      liked_activity_titles: likedActivityTitles,
      comment,
    }),
  });
}