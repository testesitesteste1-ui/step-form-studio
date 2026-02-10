import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Target, Megaphone, MapPin, Globe, Zap, TrendingUp, BarChart3, Users, Eye, MousePointerClick, DollarSign } from "lucide-react";
import {
  Client, ClientServiceType, SERVICE_TYPE_LABELS, SERVICE_TYPE_ICONS, SERVICE_TYPE_COLORS,
  SocialMediaData, TrafegoPagoData, GoogleMeuNegocioData, SitesData, AutomacoesData,
  formatCurrency,
} from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  client: Client;
  onUpdate: (client: Client) => Promise<void>;
}

const SOCIAL_PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'YouTube', 'Twitter/X'];
const CONTENT_TYPES = ['Feed', 'Stories', 'Reels', 'Carrossel', 'Vídeos', 'Lives'];
const AD_PLATFORMS = ['Meta Ads', 'Google Ads', 'TikTok Ads', 'LinkedIn Ads', 'Pinterest Ads'];
const AD_OBJECTIVES = ['Vendas', 'Leads/Formulários', 'Tráfego', 'Reconhecimento', 'Engajamento', 'Instalação de App'];
const SITE_PLATFORMS = ['WordPress', 'Lovable', 'Custom', 'Wix', 'Shopify', 'Webflow'];
const SITE_STATUSES = [
  { value: 'em_desenvolvimento', label: 'Em Desenvolvimento' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'manutencao', label: 'Em Manutenção' },
];
const AUTOMATION_TOOLS = ['N8N', 'Make (Integromat)', 'Zapier', 'Custom/API', 'Power Automate'];
const AUTOMATION_INTEGRATIONS = ['WhatsApp', 'Email', 'CRM', 'ERP', 'Planilhas', 'Webhook', 'Banco de Dados'];

export default function ClientServicesTab({ client, onUpdate }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [serviceData, setServiceData] = useState(client.serviceData || {});

  const services = client.services || [];

  const updateServiceData = <T extends keyof typeof serviceData>(key: T, data: any) => {
    setServiceData(prev => ({ ...prev, [key]: { ...((prev as any)[key] || {}), ...data } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({ ...client, serviceData });
      toast({ title: "Serviços atualizados!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (serviceKey: string, field: string, item: string) => {
    const current = ((serviceData as any)[serviceKey]?.[field] || []) as string[];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    updateServiceData(serviceKey as any, { [field]: updated });
  };

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center mt-4">
        <Zap className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-foreground font-medium mb-1">Nenhum serviço ativo</p>
        <p className="text-muted-foreground text-sm">Adicione serviços na aba "Informações" para gerenciá-los aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Tráfego Pago */}
      {services.includes('trafego_pago') && (
        <ServiceSection service="trafego_pago" icon={<Target className="w-5 h-5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Investimento Mensal (R$)</Label>
              <Input
                type="number"
                value={serviceData.trafego_pago?.monthlyBudget || ''}
                onChange={e => updateServiceData('trafego_pago', { monthlyBudget: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 3000"
              />
            </div>
            <div>
              <Label>ROI Atual (%)</Label>
              <Input
                type="number"
                value={serviceData.trafego_pago?.currentROI || ''}
                onChange={e => updateServiceData('trafego_pago', { currentROI: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 350"
              />
            </div>
            <div>
              <Label>Nº de Campanhas Ativas</Label>
              <Input
                type="number"
                value={serviceData.trafego_pago?.campaigns || ''}
                onChange={e => updateServiceData('trafego_pago', { campaigns: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Objetivo Principal</Label>
              <Select
                value={serviceData.trafego_pago?.objectives || ''}
                onValueChange={v => updateServiceData('trafego_pago', { objectives: v })}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {AD_OBJECTIVES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3">
            <Label className="mb-2 block">Plataformas de Anúncios</Label>
            <div className="flex flex-wrap gap-2">
              {AD_PLATFORMS.map(p => {
                const active = (serviceData.trafego_pago?.platforms || []).includes(p);
                return (
                  <button key={p} type="button" onClick={() => toggleArrayItem('trafego_pago', 'platforms', p)}
                    className={cn("px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      active ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    )}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Ad Account IDs */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(serviceData.trafego_pago?.platforms || []).map((p: string) => (
              <div key={p}>
                <Label>ID Conta {p}</Label>
                <Input
                  value={(serviceData.trafego_pago?.adAccountIds || {})[p] || ''}
                  onChange={e => updateServiceData('trafego_pago', {
                    adAccountIds: { ...(serviceData.trafego_pago?.adAccountIds || {}), [p]: e.target.value }
                  })}
                  placeholder={`ID da conta ${p}`}
                />
              </div>
            ))}
          </div>
          {/* KPI Summary */}
          {(serviceData.trafego_pago?.monthlyBudget || 0) > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
                <DollarSign className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-amber-400 font-bold text-sm">{formatCurrency(serviceData.trafego_pago?.monthlyBudget || 0)}</p>
                <p className="text-muted-foreground text-[10px]">Investimento/mês</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-emerald-400 font-bold text-sm">{serviceData.trafego_pago?.currentROI || 0}%</p>
                <p className="text-muted-foreground text-[10px]">ROI</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                <BarChart3 className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-blue-400 font-bold text-sm">{serviceData.trafego_pago?.campaigns || 0}</p>
                <p className="text-muted-foreground text-[10px]">Campanhas</p>
              </div>
            </div>
          )}
          <div className="mt-3">
            <Label>Observações</Label>
            <Textarea
              value={serviceData.trafego_pago?.observations || ''}
              onChange={e => updateServiceData('trafego_pago', { observations: e.target.value })}
              rows={3} placeholder="Estratégias, metas, detalhes das campanhas..."
            />
          </div>
        </ServiceSection>
      )}

      {/* Social Media */}
      {services.includes('social_media') && (
        <ServiceSection service="social_media" icon={<Megaphone className="w-5 h-5" />}>
          <div>
            <Label className="mb-2 block">Plataformas Gerenciadas</Label>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_PLATFORMS.map(p => {
                const active = (serviceData.social_media?.platforms || []).includes(p);
                return (
                  <button key={p} type="button" onClick={() => toggleArrayItem('social_media', 'platforms', p)}
                    className={cn("px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      active ? "bg-pink-500/20 text-pink-400 border-pink-500/30" : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    )}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3">
            <Label className="mb-2 block">Tipos de Conteúdo</Label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map(c => {
                const active = (serviceData.social_media?.contentTypes || []).includes(c);
                return (
                  <button key={c} type="button" onClick={() => toggleArrayItem('social_media', 'contentTypes', c)}
                    className={cn("px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      active ? "bg-pink-500/20 text-pink-400 border-pink-500/30" : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    )}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Frequência de Postagem</Label>
              <Input
                value={serviceData.social_media?.postingFrequency || ''}
                onChange={e => updateServiceData('social_media', { postingFrequency: e.target.value })}
                placeholder="Ex: 3x por semana"
              />
            </div>
          </div>
          {/* Follower counts */}
          {(serviceData.social_media?.platforms || []).length > 0 && (
            <div className="mt-3">
              <Label className="mb-2 block">Seguidores por Plataforma</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(serviceData.social_media?.platforms || []).map((p: string) => (
                  <div key={p}>
                    <Label className="text-[10px] text-muted-foreground">{p}</Label>
                    <Input
                      type="number"
                      value={(serviceData.social_media?.followers || {})[p] || ''}
                      onChange={e => updateServiceData('social_media', {
                        followers: { ...(serviceData.social_media?.followers || {}), [p]: parseInt(e.target.value) || 0 }
                      })}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3">
            <Label>Observações</Label>
            <Textarea
              value={serviceData.social_media?.observations || ''}
              onChange={e => updateServiceData('social_media', { observations: e.target.value })}
              rows={3} placeholder="Estilo visual, tom de voz, referências..."
            />
          </div>
        </ServiceSection>
      )}

      {/* Google Meu Negócio */}
      {services.includes('google_meu_negocio') && (
        <ServiceSection service="google_meu_negocio" icon={<MapPin className="w-5 h-5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label>Nome do Negócio</Label>
              <Input
                value={serviceData.google_meu_negocio?.businessName || ''}
                onChange={e => updateServiceData('google_meu_negocio', { businessName: e.target.value })}
                placeholder="Nome no Google"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>URL do Perfil</Label>
              <Input
                value={serviceData.google_meu_negocio?.profileUrl || ''}
                onChange={e => updateServiceData('google_meu_negocio', { profileUrl: e.target.value })}
                placeholder="https://g.page/..."
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input
                value={serviceData.google_meu_negocio?.category || ''}
                onChange={e => updateServiceData('google_meu_negocio', { category: e.target.value })}
                placeholder="Ex: Restaurante, Loja..."
              />
            </div>
            <div>
              <Label>Posts por Mês</Label>
              <Input
                type="number"
                value={serviceData.google_meu_negocio?.postsPerMonth || ''}
                onChange={e => updateServiceData('google_meu_negocio', { postsPerMonth: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Nº de Avaliações</Label>
              <Input
                type="number"
                value={serviceData.google_meu_negocio?.reviewCount || ''}
                onChange={e => updateServiceData('google_meu_negocio', { reviewCount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Nota Média</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={serviceData.google_meu_negocio?.averageRating || ''}
                onChange={e => updateServiceData('google_meu_negocio', { averageRating: parseFloat(e.target.value) || 0 })}
                placeholder="4.5"
              />
            </div>
          </div>
          {/* Rating display */}
          {(serviceData.google_meu_negocio?.averageRating || 0) > 0 && (
            <div className="mt-4 flex items-center gap-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="text-center">
                <p className="text-blue-400 font-bold text-2xl">{serviceData.google_meu_negocio?.averageRating?.toFixed(1)}</p>
                <div className="flex gap-0.5 justify-center">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={s <= Math.round(serviceData.google_meu_negocio?.averageRating || 0) ? 'text-yellow-400' : 'text-muted-foreground/30'}>★</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">{serviceData.google_meu_negocio?.reviewCount || 0} avaliações</p>
                <p className="text-muted-foreground text-xs">{serviceData.google_meu_negocio?.postsPerMonth || 0} posts/mês</p>
              </div>
            </div>
          )}
          <div className="mt-3">
            <Label>Observações</Label>
            <Textarea
              value={serviceData.google_meu_negocio?.observations || ''}
              onChange={e => updateServiceData('google_meu_negocio', { observations: e.target.value })}
              rows={3} placeholder="Estratégia de reviews, fotos, horários..."
            />
          </div>
        </ServiceSection>
      )}

      {/* Sites */}
      {services.includes('sites') && (
        <ServiceSection service="sites" icon={<Globe className="w-5 h-5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Domínio</Label>
              <Input
                value={serviceData.sites?.domain || ''}
                onChange={e => updateServiceData('sites', { domain: e.target.value })}
                placeholder="www.exemplo.com.br"
              />
            </div>
            <div>
              <Label>Hospedagem</Label>
              <Input
                value={serviceData.sites?.hosting || ''}
                onChange={e => updateServiceData('sites', { hosting: e.target.value })}
                placeholder="Hostgator, Vercel..."
              />
            </div>
            <div>
              <Label>Plataforma</Label>
              <Select
                value={serviceData.sites?.platform || ''}
                onValueChange={v => updateServiceData('sites', { platform: v })}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {SITE_PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status do Site</Label>
              <Select
                value={serviceData.sites?.status || ''}
                onValueChange={v => updateServiceData('sites', { status: v })}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {SITE_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data de Lançamento</Label>
              <Input
                type="date"
                value={serviceData.sites?.launchDate || ''}
                onChange={e => updateServiceData('sites', { launchDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Nº de Páginas</Label>
              <Input
                type="number"
                value={serviceData.sites?.pages || ''}
                onChange={e => updateServiceData('sites', { pages: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={serviceData.sites?.hasSEO || false}
                onCheckedChange={v => updateServiceData('sites', { hasSEO: v })}
              />
              <Label className="text-xs">SEO Ativo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={serviceData.sites?.hasAnalytics || false}
                onCheckedChange={v => updateServiceData('sites', { hasAnalytics: v })}
              />
              <Label className="text-xs">Analytics Configurado</Label>
            </div>
          </div>
          <div className="mt-3">
            <Label>Observações</Label>
            <Textarea
              value={serviceData.sites?.observations || ''}
              onChange={e => updateServiceData('sites', { observations: e.target.value })}
              rows={3} placeholder="Funcionalidades, integrações, notas técnicas..."
            />
          </div>
        </ServiceSection>
      )}

      {/* Automações */}
      {services.includes('automacoes') && (
        <ServiceSection service="automacoes" icon={<Zap className="w-5 h-5" />}>
          <div>
            <Label className="mb-2 block">Ferramentas Utilizadas</Label>
            <div className="flex flex-wrap gap-2">
              {AUTOMATION_TOOLS.map(t => {
                const active = (serviceData.automacoes?.tools || []).includes(t);
                return (
                  <button key={t} type="button" onClick={() => toggleArrayItem('automacoes', 'tools', t)}
                    className={cn("px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      active ? "bg-violet-500/20 text-violet-400 border-violet-500/30" : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    )}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3">
            <Label className="mb-2 block">Integrações</Label>
            <div className="flex flex-wrap gap-2">
              {AUTOMATION_INTEGRATIONS.map(i => {
                const active = (serviceData.automacoes?.integrations || []).includes(i);
                return (
                  <button key={i} type="button" onClick={() => toggleArrayItem('automacoes', 'integrations', i)}
                    className={cn("px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      active ? "bg-violet-500/20 text-violet-400 border-violet-500/30" : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    )}>
                    {i}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Fluxos Ativos</Label>
              <Input
                type="number"
                value={serviceData.automacoes?.activeFlows || ''}
                onChange={e => updateServiceData('automacoes', { activeFlows: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="mt-3">
            <Label>Descrição dos Fluxos</Label>
            <Textarea
              value={serviceData.automacoes?.description || ''}
              onChange={e => updateServiceData('automacoes', { description: e.target.value })}
              rows={3} placeholder="Descreva as automações ativas e seus objetivos..."
            />
          </div>
          <div className="mt-3">
            <Label>Observações</Label>
            <Textarea
              value={serviceData.automacoes?.observations || ''}
              onChange={e => updateServiceData('automacoes', { observations: e.target.value })}
              rows={2} placeholder="Notas gerais sobre automações..."
            />
          </div>
        </ServiceSection>
      )}

      {/* Save Button */}
      <div className="sticky bottom-0 bg-background pt-3 pb-1">
        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Dados dos Serviços'}
        </Button>
      </div>
    </div>
  );
}

// Reusable section wrapper
function ServiceSection({ service, icon, children }: { service: ClientServiceType; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("border-2 rounded-xl p-4 sm:p-5", SERVICE_TYPE_COLORS[service].replace(/text-\S+/g, ''))}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className={cn("p-2 rounded-lg", SERVICE_TYPE_COLORS[service])}>
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-bold text-foreground">{SERVICE_TYPE_ICONS[service]} {SERVICE_TYPE_LABELS[service]}</h3>
        </div>
      </div>
      {children}
    </motion.section>
  );
}
