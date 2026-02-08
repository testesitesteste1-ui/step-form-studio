import { motion } from "framer-motion";
import { Star, DollarSign } from "lucide-react";
import { Client, CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS, CLIENT_STATUS_ICONS, CLIENT_SERVICE_LABELS, getAvatarColor, getInitials, formatCurrency } from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  client: Client;
  onOpen: () => void;
  onToggleFavorite: () => void;
}

export default function ClientCard({ client, onOpen, onToggleFavorite }: Props) {
  const totalValue = client.projects.reduce((sum, p) => sum + (p.value || 0), 0);
  const totalPaid = client.projects.reduce((sum, p) => sum + ((p.payments || []).reduce((s, pay) => s + pay.value, 0)), 0);
  const remaining = totalValue - totalPaid;
  const avatarColor = getAvatarColor(client.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[340px] rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="p-5 pb-3 relative">
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", CLIENT_STATUS_COLORS[client.status])}>
            {CLIENT_STATUS_ICONS[client.status]} {CLIENT_STATUS_LABELS[client.status]}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shrink-0", avatarColor)}>
            {getInitials(client.name)}
          </div>
          <div className="min-w-0">
            <h3 className="text-foreground font-semibold text-base truncate">{client.name}</h3>
            <p className="text-muted-foreground text-xs truncate">{client.company || client.segment || '—'}</p>
            {client.service && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                {CLIENT_SERVICE_LABELS[client.service]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mini Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 px-5 pb-4">
        <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
          <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-foreground font-bold text-xs">{formatCurrency(totalValue)}</p>
          <p className="text-muted-foreground text-[10px] mt-0.5">total</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
          <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-emerald-400 font-bold text-xs">{formatCurrency(totalPaid)}</p>
          <p className="text-muted-foreground text-[10px] mt-0.5">pago</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
          <DollarSign className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <p className={cn("font-bold text-xs", remaining > 0 ? "text-orange-400" : "text-emerald-400")}>{formatCurrency(Math.max(0, remaining))}</p>
          <p className="text-muted-foreground text-[10px] mt-0.5">falta</p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center gap-2">
        <Button onClick={onOpen} className="flex-1" size="sm">
          Ver Detalhes
        </Button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <Star className={cn("w-4 h-4", client.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
        </button>
      </div>
    </motion.div>
  );
}
