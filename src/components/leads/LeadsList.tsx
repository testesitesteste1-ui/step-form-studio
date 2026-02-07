import { Lead, STATUS_LABELS, STATUS_COLORS, formatCurrency, getDaysSince } from "@/lib/leads-data";
import { Briefcase, Megaphone, Globe, UserPlus, Pencil, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const originIcons: Record<string, React.ElementType> = {
  getninjas: Briefcase, trafego_pago: Megaphone, site: Globe, indicacao: UserPlus,
};

interface Props {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

export default function LeadsList({ leads, onOpenLead, onDeleteLead }: Props) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Nome</TableHead>
            <TableHead className="hidden sm:table-cell">Empresa</TableHead>
            <TableHead className="hidden md:table-cell">Serviço</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Origem</TableHead>
            <TableHead className="hidden lg:table-cell">Dias</TableHead>
            <TableHead className="w-20">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map(lead => {
            const OriginIcon = originIcons[lead.origin] || Globe;
            return (
              <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/30" onClick={() => onOpenLead(lead)}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{lead.company}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-xs">{lead.services.join(', ')}</span>
                </TableCell>
                <TableCell className="font-semibold">{formatCurrency(lead.estimatedValue)}</TableCell>
                <TableCell>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", STATUS_COLORS[lead.status])}>
                    {STATUS_LABELS[lead.status]}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <OriginIcon className="w-4 h-4 text-muted-foreground" />
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{getDaysSince(lead.entryDate)}d</TableCell>
                <TableCell>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onOpenLead(lead)} className="p-1 rounded hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => onDeleteLead(lead.id)} className="p-1 rounded hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
