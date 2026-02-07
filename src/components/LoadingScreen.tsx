import logo from "@/assets/logo.png";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <img
        src={logo}
        alt="NeuraSys"
        className="w-28 h-28 object-contain animate-logo-pulse"
      />
      <div className="w-48 h-1 rounded-full overflow-hidden bg-muted">
        <div className="h-full rounded-full animate-shimmer w-full" />
      </div>
    </div>
  );
}
