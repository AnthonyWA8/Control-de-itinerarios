import type { Itinerary, TravelPreferences } from "./itineraryGenerator";
import { apiFetch, ApiError, getToken, setToken, clearToken } from "../lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SavedItinerary {
  id: string;
  userId: string;
  itinerary: Itinerary;
  savedAt: string;
  note?: string;
}

const SESSION_KEY = "wl_session";

interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ user: User } | { error: string }> {
  try {
    const data = await apiFetch<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    setToken(data.access_token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));

    return { user: data.user };
  } catch (e) {
    if (e instanceof ApiError) return { error: e.message };
    return { error: "No se pudo conectar con el servidor." };
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User } | { error: string }> {
  try {
    const data = await apiFetch<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setToken(data.access_token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));

    return { user: data.user };
  } catch (e) {
    if (e instanceof ApiError) return { error: e.message };
    return { error: "No se pudo conectar con el servidor." };
  }
}

export function logout() {
  clearToken();
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): User | null {
  if (!getToken()) return null;

  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

// ---------- Itinerarios guardados (backend) ----------

interface ItineraryDTO extends Itinerary {
  id?: string;
}

export async function saveItinerary(
  _userId: string,
  itinerary: Itinerary,
  preferences: TravelPreferences,
  note?: string
): Promise<SavedItinerary | { error: string }> {
  try {

    // Convertir camelCase -> snake_case
    const fixedItinerary = {
      ...itinerary,

      total_days: itinerary.totalDays,
      total_estimated_cost: itinerary.totalEstimatedCost,

      practical_info: {
        best_time_to_visit: itinerary.practicalInfo.bestTimeToVisit,
        currency: itinerary.practicalInfo.currency,
        language: itinerary.practicalInfo.language,
        transportation: itinerary.practicalInfo.transportation,
        accommodation: itinerary.practicalInfo.accommodation,
      },

      days: itinerary.days.map((day) => ({
        ...day,

        daily_budget: day.dailyBudget,

        activities: day.activities.map((activity) => ({
          ...activity,
        })),
      })),
    };

    const saved = await apiFetch<ItineraryDTO>("/api/v1/itineraries", {
      method: "POST",

      body: JSON.stringify({
        itinerary: fixedItinerary,
        preferences,
        note,
      }),
    });

    return {
      id: saved.id || crypto.randomUUID(),
      userId: _userId,
      itinerary: saved,
      savedAt: new Date().toISOString(),
      note,
    };

  } catch (e) {
    if (e instanceof ApiError) return { error: e.message };

    return { error: "No se pudo guardar el itinerario." };
  }
}

export async function deleteItinerary(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/itineraries/${id}`, {
    method: "DELETE",
  });
}

export async function getUserItineraries(
  _userId: string
): Promise<SavedItinerary[]> {

  const items = await apiFetch<ItineraryDTO[]>("/api/v1/itineraries");

  return items.map((it) => ({
    id: it.id || crypto.randomUUID(),
    userId: _userId,
    itinerary: it,
    savedAt: new Date().toISOString(),
  }));
}