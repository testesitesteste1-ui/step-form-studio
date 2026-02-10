import { motion } from "framer-motion";
import { Star, DollarSign, Pencil, Lock } from "lucide-react";
import { Client, CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS, CLIENT_STATUS_ICONS, SERVICE_TYPE_LABELS, SERVICE_TYPE_ICONS, SERVICE_TYPE_COLORS, ClientServiceType, getAvatarColor, getInitials, formatCurrency } from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  client: Client;
  onOpen: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
}

export default function ClientCard({ client, onOpen, onEdit, onToggleFavorite }: Props) {
  const totalValue = client.projects.reduce((sum, p) => sum + (p.value || 0), 0);
  const totalPaid = client.projects.reduce((sum, p) => sum + ((p.payments || []).reduce((s, pay) => s + pay.value, 0)), 0);
  const remaining = totalValue - totalPaid;
  const avatarColor = getAvatarColor(client.name);

  const services = client.services && client.services.length > 0 ? client.services : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full max-w-[340px] rounded-xl border-2 bg-card overflow-hidden hover:shadow-lg transition-all duration-300 group",
        client.private
          ? "border-destructive/60 hover:border-destructive hover:shadow-destructive/10"
          : "border-border hover:border-primary/40 hover:shadow-primary/5"
      )}
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
          </div>
        </div>
      </div>

      {/* Service badges */}
      {services.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {services.map(s => (
            <span key={s} className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium inline-flex items-center gap-1", SERVICE_TYPE_COLORS[s])}>
              {SERVICE_TYPE_ICONS[s]} {SERVICE_TYPE_LABELS[s]}
            </span>
          ))}
        </div>
      )}

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
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          title="Editar cliente"
        >
          <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
        </button>
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
