'use client';

import {
  getBlockedIps,
  releaseIp,
  refreshIpInfo,
  BlockedIpData,
  IpMetadata,
} from '@/api/ip-security';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Eye, ShieldCheck, RefreshCw } from 'lucide-react';
import ListPageLayout from '@/components/ui/list-page-layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/registry/new-york/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/registry/new-york/ui/alert-dialog';
import { Badge } from '@/registry/new-york/ui/badge';
import { Button } from '@/registry/new-york/ui/button';

// ─── Type helpers ────────────────────────────────────────────────────────
const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode) return '';
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(
    ...code.split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
};

const formatDate = (dateStr: string | Date): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── Component ───────────────────────────────────────────────────────────
const BlockedIpsDataPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<BlockedIpData[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<'blocked' | 'released' | undefined>(undefined);

  // Detail modal
  const [detailModal, setDetailModal] = useState<{ show: boolean; item: BlockedIpData | null }>({
    show: false,
    item: null,
  });

  // Release confirm dialog
  const [releaseConfirm, setReleaseConfirm] = useState<{ show: boolean; item: BlockedIpData | null }>({
    show: false,
    item: null,
  });

  // ─── Data loading ─────────────────────────────────────────────────────
  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getBlockedIps(currentPage, pageSize, statusFilter);
      setData(response.data || []);
      setTotal(response.total || 0);
    } catch {
      toast.error('Error al cargar IPs bloqueadas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, statusFilter]);

  // ─── Actions ──────────────────────────────────────────────────────────
  const handleViewDetail = (item: BlockedIpData) => {
    setDetailModal({ show: true, item });
  };

  const handleReleaseClick = (item: BlockedIpData) => {
    setReleaseConfirm({ show: true, item });
  };

  const handleReleaseConfirm = async () => {
    if (!releaseConfirm.item) return;
    try {
      const result = await releaseIp(releaseConfirm.item.ip);
      if (result?.success) {
        toast.success(`IP ${releaseConfirm.item.ip} liberada exitosamente`);
      } else {
        toast.error('Error al liberar la IP');
      }
      setReleaseConfirm({ show: false, item: null });
      loadData();
    } catch {
      toast.error('Error al liberar la IP');
      setReleaseConfirm({ show: false, item: null });
    }
  };

  const handleRefreshInfo = async (item: BlockedIpData) => {
    try {
      const result = await refreshIpInfo(item.ip);
      if (result) {
        toast.success(`Metadata de ${item.ip} actualizada`);
        loadData();
      } else {
        toast.error('Error al consultar ip-api.com');
      }
    } catch {
      toast.error('Error al refrescar metadata');
    }
  };

  // ─── Filter component ─────────────────────────────────────────────────
  const filterComponent = (
    <div className="flex items-center gap-2">
      <select
        value={statusFilter || 'all'}
        onChange={(e) => {
          const val = e.target.value;
          setStatusFilter(val === 'all' ? undefined : (val as 'blocked' | 'released'));
          setCurrentPage(1);
        }}
        className="rounded-md border border-gray-300 px-3 py-[7px] text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">Todas</option>
        <option value="blocked">🔴 Bloqueadas</option>
        <option value="released">🟢 Liberadas</option>
      </select>
      <button
        type="button"
        onClick={() => { setCurrentPage(1); loadData(); }}
        title="Refrescar lista"
        className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-[7px] text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-blue-600 hover:border-blue-400 transition-all duration-150"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <>
      <ListPageLayout
        title="Seguridad IP"
        subtitle="Gestión de IPs bloqueadas por actividad sospechosa. Las IPs se bloquean automáticamente al exceder el límite de requests."
        data={data}
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onRefresh={() => { setCurrentPage(1); loadData(); }}
        filter={filterComponent}
        emptyMessage="No hay IPs bloqueadas en este momento"
        columns={[
          {
            key: 'ip',
            label: 'IP',
            render: (item) => (
              <span className="font-mono font-medium text-sm">{item.ip}</span>
            ),
            className: 'min-w-[150px]',
          },
          {
            key: 'country',
            label: 'País',
            render: (item) => {
              const meta = item.metadata;
              if (!meta?.country) return <span className="text-gray-400">—</span>;
              return (
                <span className="whitespace-nowrap">
                  {getFlagEmoji(meta.countryCode)} {meta.country}
                </span>
              );
            },
            className: 'min-w-[120px]',
          },
          {
            key: 'city',
            label: 'Ubicación',
            render: (item) => {
              const meta = item.metadata;
              if (!meta?.city && !meta?.region) return <span className="text-gray-400">—</span>;
              return <span className="block truncate max-w-[160px]" title={[meta.city, meta.region].filter(Boolean).join(', ')}>{[meta.city, meta.region].filter(Boolean).join(', ')}</span>;
            },
            className: 'min-w-[130px]',
          },
          {
            key: 'isp',
            label: 'ISP',
            render: (item) => {
              const isp = item.metadata?.isp;
              return isp ? <span className="block truncate max-w-[200px]" title={isp}>{isp}</span> : <span className="text-gray-400">—</span>;
            },
            className: 'min-w-[150px]',
          },
          {
            key: 'attemptCount',
            label: 'Int.',
            render: (item) => (
              <span className="font-mono text-sm">{item.attemptCount}</span>
            ),
            className: 'w-20 text-center',
          },
          {
            key: 'blockedAt',
            label: 'Inicio',
            render: (item) => (
              <span className="text-sm text-gray-600">{formatDate(item.blockedAt)}</span>
            ),
            className: 'min-w-[190px]',
          },
          {
            key: 'status',
            label: 'Est.',
            render: (item) =>
              item.releasedAt ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-1.5 py-0">
                  Libre
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs px-1.5 py-0">Bloq.</Badge>
              ),
            className: 'w-16 text-center',
          },
          {
            key: 'relapseCount',
            label: 'Reinc.',
            render: (item) => (
              <span className="font-mono text-sm text-center block">{item.relapseCount}</span>
            ),
            className: 'w-14 text-center',
          },
        ]}
        rowKey={(item) => item.ip}
        actions={[
          {
            icon: <Eye className="w-4 h-4" />,
            tooltip: 'Ver detalle',
            onClick: handleViewDetail,
            color: 'text-blue-600',
          },
          {
            icon: <RefreshCw className="w-4 h-4" />,
            tooltip: 'Actualizar metadata IP',
            onClick: handleRefreshInfo,
            color: 'text-gray-500',
            show: (item) => !!item.metadata,
          },
          {
            icon: <ShieldCheck className="w-4 h-4" />,
            tooltip: 'Liberar IP',
            onClick: handleReleaseClick,
            color: 'text-green-600',
            show: (item) => !item.releasedAt,
          },
        ]}
      />

      {/* ─── Detail Modal ─────────────────────────────────────────────── */}
      <Dialog open={detailModal.show} onOpenChange={(open) => !open && setDetailModal({ show: false, item: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de IP: {detailModal.item?.ip}</DialogTitle>
          </DialogHeader>
          {detailModal.item && <DetailContent item={detailModal.item} />}
        </DialogContent>
      </Dialog>

      {/* ─── Release Confirm Dialog ───────────────────────────────────── */}
      <AlertDialog open={releaseConfirm.show} onOpenChange={(open) => !open && setReleaseConfirm({ show: false, item: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Liberar IP?</AlertDialogTitle>
            <AlertDialogDescription>
              La IP <strong>{releaseConfirm.item?.ip}</strong> será liberada y podrá hacer
              requests nuevamente. Si reincide, será bloqueada automáticamente de nuevo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReleaseConfirm}>
              Liberar IP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ─── Detail Content Component ─────────────────────────────────────────────
const DetailContent: React.FC<{ item: BlockedIpData }> = ({ item }) => {
  const m = item.metadata;

  return (
    <div className="space-y-4">
      {/* IP info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoRow label="IP" value={item.ip} mono />
        <InfoRow label="Bloqueado por" value={item.blockedBy === 'auto' ? 'Automático' : 'Manual'} />
        <InfoRow label="Bloqueada desde" value={formatDate(item.blockedAt)} />
        <InfoRow label="Intentos acumulados" value={String(item.attemptCount)} />
        <InfoRow label="Liberada" value={item.releasedAt ? formatDate(item.releasedAt) : 'No'} />
        <InfoRow label="Liberada por" value={item.releasedBy || '—'} />
        <InfoRow label="Reincidencias" value={String(item.relapseCount)} />
        <InfoRow label="Creada" value={formatDate(item.createdAt)} />
      </div>

      {/* Separator */}
      <hr className="border-gray-200" />

      {/* Geolocation metadata */}
      <h4 className="font-medium text-sm text-gray-700">Geolocalización (ip-api.com)</h4>
      {m ? (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoRow label="País" value={`${getFlagEmoji(m.countryCode)} ${m.country}`} />
          <InfoRow label="Código país" value={m.countryCode} />
          <InfoRow label="Región" value={m.region} />
          <InfoRow label="Ciudad" value={m.city} />
          <InfoRow label="Código postal" value={m.zip} />
          <InfoRow label="Coordenadas" value={`${m.lat}, ${m.lon}`} />
          <InfoRow label="Zona horaria" value={m.timezone} />
          <InfoRow label="ISP" value={m.isp} />
          <InfoRow label="Organización" value={m.org} />
          <InfoRow label="AS (Sistema Autónomo)" value={m.as} />
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">
          No disponible. La consulta a ip-api.com falló al momento del bloqueo.
        </p>
      )}

      {/* Relapse history */}
      {item.relapseCount > 0 && (
        <>
          <hr className="border-gray-200" />
          <h4 className="font-medium text-sm text-gray-700">Historial de reincidencias</h4>
          <p className="text-sm text-gray-500">
            Esta IP ha reincidido {item.relapseCount} vez/veces después de ser liberada.
          </p>
        </>
      )}
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
    <span className={mono ? 'font-mono text-sm' : 'text-sm'}>{value || '—'}</span>
  </div>
);

export default BlockedIpsDataPage;
