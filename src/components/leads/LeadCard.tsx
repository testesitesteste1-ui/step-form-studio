import { useState } from "react";
import { Lead, SERVICE_COLORS, formatCurrency, getDaysSince } from "@/lib/leads-data";
import { Briefcase, Megaphone, Globe, UserPlus, MessageCircle, Mail, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const originIcons: Record<string, React.ElementType> = {
  getninjas: Briefcase,
  trafego_pago: Megaphone,
  site: Globe,
  indicacao: UserPlus,
};

interface Props {
  lead: Lead;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export default function LeadCard({ lead, onClick, onDelete }: Props) {
  const [hovered, setHovered] = useState(false);
  const OriginIcon = originIcons[lead.origin] || Globe;
  const days = getDaysSince(lead.entryDate);
  const isOverdue = lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/40 transition-colors relative group"
    >
      <div className="flex items-start gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
          {lead.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
          <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
        </div>
        <OriginIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {lead.services.map(s => (
          <span key={s} className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", SERVICE_COLORS[s])}>
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{formatCurrency(lead.estimatedValue)}</span>
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full",
          isOverdue ? "bg-red-500/20 text-red-400" : "bg-muted text-muted-foreground"
        )}>
          {days}d
        </span>
      </div>

      {/* Hover actions */}
      {hovered && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border rounded-b-lg flex items-center justify-center gap-1 py-1.5"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => window.open(`https://wa.me/${lead.whatsapp}`, '_blank')}
            className="p-1.5 rounded-md hover:bg-emerald-500/10 text-emerald-400"
            title="WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
            className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-400"
            title="Email"
          >
            <Mail className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClick}
            className="p-1.5 rounded-md hover:bg-primary/10 text-primary"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(lead.id)}
            className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400"
            title="Deletar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
