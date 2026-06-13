import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TravelForm, type TravelPreferences } from "./components/TravelForm";
import { ItineraryView } from "./components/ItineraryView";
import { MyItineraries } from "./components/MyItineraries";
import { AuthModal } from "./components/AuthModal";
import { generateItinerary, type Itinerary } from "./components/itineraryGenerator";
import { getSession, logout, saveItinerary, type User } from "./components/auth";
import { ApiError } from "./lib/api";
import { Compass, Sparkles, Globe, Map, LogIn, LogOut, Suitcase, User as UserIcon, BookOpen } from "lucide-react";
import { Button } from "./components/ui/button";

{/* MARKER-MAKE-KIT-INVOKED */}

type AppState = "landing" | "form" | "loading" | "result" | "my-trips";

const HERO_DESTINATIONS = [
  { city: "Kioto", country: "Japón", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=280&fit=crop&auto=format" },
  { city: "Santorini", country: "Grecia", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=280&fit=crop&auto=format" },
  { city: "Machu Picchu", country: "Perú", img: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=280&fit=crop&auto=format" },
];

export default function App() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [lastPrefs, setLastPrefs] = useState<TravelPreferences | null>(null);
  const [user, setUser] = useState<User | null>(() => getSession());
  const [showAuth, setShowAuth] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (prefs: TravelPreferences) => {
    setLastPrefs(prefs);
    setIsSaved(false);
    setError(null);
    setAppState("loading");
    try {
      const result = await generateItinerary(prefs);
      setItinerary(result);
      setAppState("result");
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "No se pudo generar el itinerario. Verifica que el backend esté corriendo.";
      setError(message);
      setAppState("form");
    }
  };

  const handleSave = async () => {
    if (!user) { setShowAuth(true); return; }
    if (itinerary && lastPrefs) {
      const result = await saveItinerary(user.id, itinerary, lastPrefs);
      if ("error" in result) {
        setError(result.error);
      } else {
        setIsSaved(true);
      }
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    if (appState === "my-trips") setAppState("landing");
  };

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setShowAuth(false);
    // If user came from saving an itinerary, auto-save now
    if (itinerary && appState === "result" && lastPrefs) {
      saveItinerary(u.id, itinerary, lastPrefs).then((result) => {
        if (!("error" in result)) setIsSaved(true);
      });
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button
            onClick={() => setAppState("landing")}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors shrink-0"
          >
            <Compass className="w-5 h-5 text-primary" />
            <span style={{ fontFamily: "'Lora', serif" }} className="italic">Wanderlust Planner</span>
          </button>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={() => setAppState("my-trips")}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all ${
                    appState === "my-trips"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mis viajes</span>
                </button>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:inline max-w-24 truncate">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowAuth(true)} className="gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                Iniciar sesión
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {/* Landing */}
          {appState === "landing" && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <section className="relative overflow-hidden bg-foreground text-background py-20 px-4">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&h=600&fit=crop&auto=format')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="relative max-w-3xl mx-auto text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-background/30 text-sm mb-6 text-background/80">
                    <Sparkles className="w-3.5 h-3.5" />
                    Itinerarios generados con IA personalizada
                  </div>
                  <h1
                    style={{ fontFamily: "'Lora', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 600, lineHeight: 1.15 }}
                    className="text-background mb-5"
                  >
                    Tu próximo viaje,<br />
                    <span className="italic" style={{ color: "#f59e0b" }}>perfectamente planeado</span>
                  </h1>
                  <p className="text-background/75 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                    Dinos a dónde quieres ir, cuánto tiempo tienes y qué te apasiona. Crearemos un itinerario a tu medida en segundos.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setAppState("form")}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#f59e0b", color: "#1a1612", fontWeight: 600 }}
                    >
                      <Globe className="w-4 h-4" />
                      Planear mi viaje
                    </button>
                    {!user && (
                      <button
                        onClick={() => setShowAuth(true)}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-background/30 text-background hover:bg-background/10 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        Crear cuenta
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <section className="max-w-5xl mx-auto px-4 py-16">
                <h2 className="text-center mb-2" style={{ fontFamily: "'Lora', serif" }}>Destinos populares</h2>
                <p className="text-center text-muted-foreground mb-10">Inspiración para tu próxima aventura</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {HERO_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.city}
                      onClick={() => setAppState("form")}
                      className="group relative rounded-2xl overflow-hidden text-left hover:shadow-lg transition-shadow"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <img src={dest.img} alt={dest.city} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
                      <div className="absolute bottom-4 left-4 text-white">
                        <p style={{ fontFamily: "'Lora', serif", fontSize: "1.25rem", fontWeight: 600 }}>{dest.city}</p>
                        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem" }}>{dest.country}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-card border-t border-border py-16 px-4">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-center mb-10" style={{ fontFamily: "'Lora', serif" }}>¿Cómo funciona?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { step: "01", title: "Comparte tus preferencias", desc: "Destino, duración, presupuesto, intereses y cualquier restricción especial." },
                      { step: "02", title: "Generamos tu itinerario", desc: "Nuestro sistema crea un plan personalizado, coherente y equilibrado para ti." },
                      { step: "03", title: "Guarda y comparte", desc: "Guarda tus itinerarios favoritos, revísalos cuando quieras y ajústalos a tu medida." },
                    ].map(({ step, title, desc }) => (
                      <div key={step} className="text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 font-mono text-sm" style={{ fontWeight: 600 }}>
                          {step}
                        </div>
                        <h4 className="mb-2">{title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* Form */}
          {appState === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto px-4 py-10"
            >
              <div className="mb-8">
                <h2 style={{ fontFamily: "'Lora', serif" }}>Personaliza tu viaje</h2>
                <p className="text-muted-foreground text-sm mt-1">Cuéntanos qué buscas y crearemos el itinerario perfecto para ti.</p>
              </div>
              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
              <TravelForm onGenerate={handleGenerate} loading={false} />
            </motion.div>
          )}

          {/* Loading */}
          {appState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center px-4 text-center"
              style={{ minHeight: "60vh" }}
            >
              <div className="relative w-20 h-20 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  style={{ borderTopColor: "transparent" }}
                />
                <Compass className="absolute inset-0 m-auto w-8 h-8 text-primary" />
              </div>
              <h3 style={{ fontFamily: "'Lora', serif" }} className="mb-2">Creando tu itinerario…</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Estamos seleccionando las mejores experiencias, equilibrando tu presupuesto y preparando cada detalle.
              </p>
              <div className="flex gap-1.5 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Result */}
          {appState === "result" && itinerary && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-2xl mx-auto px-4 py-10"
            >
              <div className="mb-6">
                <h2 style={{ fontFamily: "'Lora', serif" }}>Tu itinerario está listo</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Revisa cada día, consulta la info práctica y{" "}
                  {user ? "guárdalo en tu perfil." : "inicia sesión para guardarlo."}
                </p>
              </div>
              <ItineraryView
                itinerary={itinerary}
                onRegenerate={() => lastPrefs && handleGenerate(lastPrefs)}
                onModify={() => setAppState("form")}
                onSave={handleSave}
                isSaved={isSaved}
              />
            </motion.div>
          )}

          {/* My trips */}
          {appState === "my-trips" && user && (
            <motion.div
              key="my-trips"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MyItineraries user={user} onNewTrip={() => setAppState("form")} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-border py-8 px-4 text-center text-muted-foreground mt-8" style={{ fontSize: "0.75rem" }}>
        <p>Wanderlust Planner · Itinerarios personalizados con IA</p>
        <p className="mt-1">Los costos son estimaciones orientativas. Verifica precios actuales antes de viajar.</p>
      </footer>

      {/* Auth modal */}
      <AnimatePresence>
        {showAuth && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthModal onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
