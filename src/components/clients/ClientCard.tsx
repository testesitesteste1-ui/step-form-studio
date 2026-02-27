import { motion } from "framer-motion";
import { Star, Lock, MessageCircle, Mail, ChevronRight, Target, Megaphone, MapPin, Globe, Zap, Calendar } from "lucide-react";
import { Client, CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS, ClientServiceType, SERVICE_TYPE_LABELS, getAvatarColor, getInitials, formatCurrency, getDaysSince } from "@/lib/clients-data";
import { cn } from "@/lib/utils";

interface Props {
  client: Client;
  onOpen: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
}

const SERVICE_ICONS: Record<ClientServiceType, React.ReactNode> = {
  trafego_pago: <Target className="w-3 h-3" />,
  social_media: <Megaphone className="w-3 h-3" />,
  google_meu_negocio: <MapPin className="w-3 h-3" />,
  sites: <Globe className="w-3 h-3" />,
  automacoes: <Zap className="w-3 h-3" />,
};

const SERVICE_BADGE_COLORS: Record<ClientServiceType, string> = {
  trafego_pago: 'bg-amber-500/15 text-amber-400',
  social_media: 'bg-pink-500/15 text-pink-400',
  google_meu_negocio: 'bg-blue-500/15 text-blue-400',
  sites: 'bg-cyan-500/15 text-cyan-400',
  automacoes: 'bg-violet-500/15 text-violet-400',
};

export default function ClientCard({ client, onOpen, onEdit, onToggleFavorite }: Props) {
  const totalValue = client.projects.reduce((sum, p) => sum + (p.value || 0), 0);
  const totalPaid = client.projects.reduce((sum, p) => sum + ((p.payments || []).reduce((s, pay) => s + pay.value, 0)), 0);
  const avatarColor = getAvatarColor(client.name);
  const services = client.services && client.services.length > 0 ? client.services : [];
  const activeProjects = client.projects.filter(p => p.status === 'ativo').length;
  const daysSinceContact = getDaysSince(client.lastContact);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onOpen}
      className={cn(
        "w-full rounded-xl border bg-card cursor-pointer overflow-hidden transition-all duration-200 group relative",
        client.private
          ? "border-destructive/40 hover:border-destructive/70"
          : "border-border/60 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
      )}
    >
      {/* Top accent line */}
      <div className={cn(
        "h-0.5 w-full",
        client.status === 'ativo' ? 'bg-emerald-500' :
        client.status === 'proposta' ? 'bg-blue-500' :
        client.status === 'pausado' ? 'bg-yellow-500' :
        client.status === 'finalizado' ? 'bg-primary' :
        'bg-red-500'
      )} />

      <div className="p-4">
        {/* Row 1: Avatar + Name + Actions */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn(
            "w-11 h-11 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shrink-0",
            avatarColor
          )}>
            {getInitials(client.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-foreground font-semibold text-sm truncate">{client.name}</h3>
              {client.private && <Lock className="w-3 h-3 text-destructive shrink-0" />}
            </div>
            <p className="text-muted-foreground text-xs truncate">{client.company || client.segment || '—'}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className="p-1 rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Star className={cn("w-3.5 h-3.5", client.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40")} />
            </button>
          </div>
        </div>

        {/* Row 2: Status + Last contact */}
        <div className="flex items-center justify-between mb-3">
          <span className={cn("text-[10px] px-2 py-0.5 rounded-md font-medium", CLIENT_STATUS_COLORS[client.status])}>
            {CLIENT_STATUS_LABELS[client.status]}
          </span>
          <span className={cn(
            "text-[10px] flex items-center gap-1",
            daysSinceContact > 30 ? "text-red-400" : daysSinceContact > 14 ? "text-yellow-400" : "text-muted-foreground"
          )}>
            <Calendar className="w-3 h-3" />
            {daysSinceContact === 0 ? 'Hoje' : `${daysSinceContact}d atrás`}
          </span>
        </div>

        {/* Row 3: Service badges */}
        {services.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {services.map(s => (
              <span key={s} className={cn("text-[9px] px-1.5 py-0.5 rounded-md font-medium inline-flex items-center gap-0.5", SERVICE_BADGE_COLORS[s])}>
                {SERVICE_ICONS[s]} {SERVICE_TYPE_LABELS[s]}
              </span>
            ))}
          </div>
        )}

        {/* Row 4: Financial summary + Projects */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div>
            <p className="text-foreground font-bold text-sm">{formatCurrency(totalValue)}</p>
            <p className="text-muted-foreground text-[9px]">
              {totalPaid > 0 ? `${formatCurrency(totalPaid)} pago` : 'sem pagamentos'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeProjects > 0 && (
              <span className="text-[10px] text-emerald-400 font-medium">
                {activeProjects} {activeProjects === 1 ? 'projeto' : 'projetos'}
              </span>
            )}
            {/* Quick actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {client.whatsapp && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`, '_blank');
                  }}
                  className="p-1 rounded-md hover:bg-emerald-500/20 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              )}
              {client.email && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`mailto:${client.email}`, '_blank');
                  }}
                  className="p-1 rounded-md hover:bg-blue-500/20 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                </button>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
