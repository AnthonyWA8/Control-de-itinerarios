  import { useState } from "react";
  import { Button } from "./ui/button";
  import { Input } from "./ui/input";
  import { Label } from "./ui/label";
  import { login, register, type User } from "./auth";
  import { Compass, Eye, EyeOff, X } from "lucide-react";

  interface Props {
    onSuccess: (user: User) => void;
    onClose: () => void;
  }

  export function AuthModal({ onSuccess, onClose }: Props) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      await new Promise((r) => setTimeout(r, 400));
      const result = mode === "login"
        ? await login(email, password)
        : await register(name, email, password);
      setLoading(false);
      if ("error" in result) { setError(result.error); return; }
      onSuccess(result.user);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm">
        <div className="bg-card rounded-2xl border border-border w-full max-w-sm shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Lora', serif" }} className="italic">
                Future Itinerary Planner by Future
              </span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            {/* Mode tabs */}
            <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-1.5 rounded-md text-sm transition-all ${
                    mode === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "login" ? "Iniciar sesión" : "Registrarse"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label>Nombre</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required className="bg-input-background" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Correo electrónico</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required className="bg-input-background" />
              </div>
              <div className="space-y-1.5">
                <Label>Contraseña</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="bg-input-background pr-10"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === "register" && <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>}
              </div>

              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Cargando…" : mode === "login" ? "Entrar" : "Crear cuenta"}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="text-primary hover:underline">
                {mode === "login" ? "Regístrate gratis" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
