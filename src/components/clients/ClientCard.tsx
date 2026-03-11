import { motion } from "framer-motion";
import { Star, Lock, MessageCircle, Mail, ChevronRight, Building2, UserCheck, Calendar, MapPin } from "lucide-react";
import { Client, CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS, CLIENT_TYPE_LABELS, getAvatarColor, getInitials, formatCurrency, getDaysSince } from "@/lib/clients-data";
import { cn } from "@/lib/utils";

interface Props {
  client: Client;
  onOpen: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
}

export default function ClientCard({ client, onOpen, onEdit, onToggleFavorite }: Props) {
  const totalValue = client.projects.reduce((sum, p) => sum + (p.value || 0), 0);
  const avatarColor = getAvatarColor(client.name);
  const condCount = (client.condominios || []).length;
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
      {/* Top accent */}
      <div className={cn(
        "h-0.5 w-full",
        client.status === 'ativo' ? 'bg-emerald-500' :
        client.status === 'proposta' ? 'bg-blue-500' :
        client.status === 'pausado' ? 'bg-yellow-500' :
        client.status === 'finalizado' ? 'bg-primary' :
        'bg-red-500'
      )} />

      <div className="p-4">
        {/* Row 1: Avatar + Name */}
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
            <div className="flex items-center gap-1.5 mt-0.5">
              {client.type === 'administradora'
                ? <Building2 className="w-3 h-3 text-muted-foreground" />
                : <UserCheck className="w-3 h-3 text-muted-foreground" />
              }
              <p className="text-muted-foreground text-xs">{CLIENT_TYPE_LABELS[client.type]}</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="p-1 rounded-md hover:bg-secondary/80 transition-colors shrink-0"
          >
            <Star className={cn("w-3.5 h-3.5", client.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40")} />
          </button>
        </div>

        {/* Row 2: Status + Contact + Type info */}
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

        {/* Row 3: Condomínios count + Contact person */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {client.type === 'administradora' && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium inline-flex items-center gap-0.5 bg-amber-500/15 text-amber-400">
              <MapPin className="w-3 h-3" /> {condCount} condomínio{condCount !== 1 ? 's' : ''}
            </span>
          )}
          {client.contactName && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium bg-secondary text-muted-foreground">
              {client.type === 'sindico' ? '👤' : '📋'} {client.contactName}
            </span>
          )}
        </div>

        {/* Row 4: Financial + Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div>
            <p className="text-foreground font-bold text-sm">{formatCurrency(totalValue)}</p>
            <p className="text-muted-foreground text-[9px]">
              {activeProjects > 0 ? `${activeProjects} projeto${activeProjects > 1 ? 's' : ''} ativo${activeProjects > 1 ? 's' : ''}` : 'sem projetos'}
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {client.phone && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}`, '_blank');
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
