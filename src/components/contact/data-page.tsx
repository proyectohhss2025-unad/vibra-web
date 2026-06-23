'use client';

import { getAll, update, getStats, UpdateContactPayload, ContactStats } from '@/api/contact';
import { Contact } from '@/models/contact.entity';
import { AuthContext } from '@/services/auth';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';
import ListPageLayout from '@/components/ui/list-page-layout';

const statusConfig: Record<string, { label: string; color: string }> = {
    unread: { label: 'No leído', color: 'text-red-600 bg-red-50' },
    read: { label: 'Leído', color: 'text-blue-600 bg-blue-50' },
    in_progress: { label: 'En proceso', color: 'text-yellow-600 bg-yellow-50' },
    resolved: { label: 'Resuelto', color: 'text-green-600 bg-green-50' },
    spam: { label: 'Spam', color: 'text-gray-500 bg-gray-100' },
};

const ContactDataPage: React.FC = () => {
    const { token } = useContext(AuthContext);
    const router = useRouter();

    const [data, setData] = useState<Contact[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState<ContactStats>({ total: 0, unread: 0, in_progress: 0, resolved: 0, spam: 0 });

    // Detail modal state
    const [detailModal, setDetailModal] = useState<{ show: boolean; contact: Contact | null }>({
        show: false,
        contact: null,
    });
    const [editStatus, setEditStatus] = useState<string>('');
    const [editNotes, setEditNotes] = useState('');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await getAll(currentPage, pageSize, statusFilter);
            setData(response.data);
            setTotal(response.total);
        } catch (error) {
            console.error('Error loading contacts:', error);
            toast.error('Error al cargar los mensajes');
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const result = await getStats();
            setStats(result);
        } catch (error) {
            console.error('Error loading contact stats:', error);
        }
    };

    useEffect(() => { loadData(); loadStats(); }, [currentPage, pageSize, statusFilter]);

    useEffect(() => {
        if (!token) router.push('/layout');
    }, [token, router]);

    const openDetail = (contact: Contact) => {
        setDetailModal({ show: true, contact });
        setEditStatus(contact.status);
        setEditNotes(contact.notes || '');
    };

    const closeDetail = () => {
        setDetailModal({ show: false, contact: null });
        setEditStatus('');
        setEditNotes('');
    };

    const handleSaveDetail = async () => {
        if (!detailModal.contact?._id) return;
        try {
            const payload: UpdateContactPayload = {
                _id: detailModal.contact._id,
                status: editStatus as Contact['status'],
                notes: editNotes,
            };
            await update(payload);
            toast.success('Mensaje actualizado correctamente');
            closeDetail();
            loadData();
            loadStats();
        } catch (error) {
            toast.error('Error al actualizar el mensaje');
        }
    };

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            {/* Stats Bar */}
            <div className="grid grid-cols-5 gap-3 mt-4 px-1">
                {[
                    { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                    { label: 'No leídos', value: stats.unread, color: 'bg-red-50 text-red-700 border-red-200' },
                    { label: 'En proceso', value: stats.in_progress, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                    { label: 'Resueltos', value: stats.resolved, color: 'bg-green-50 text-green-700 border-green-200' },
                    { label: 'Spam', value: stats.spam, color: 'bg-gray-50 text-gray-700 border-gray-200' },
                ].map((stat) => (
                    <div key={stat.label} className={`rounded-lg border p-3 text-center ${stat.color}`}>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            <ListPageLayout
                title="Gestión de Contacto"
                subtitle="Gestione los mensajes enviados desde la landing page."
                data={data}
                total={total}
                currentPage={currentPage}
                pageSize={pageSize}
                isLoading={isLoading}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                onRefresh={() => { setCurrentPage(1); loadData(); loadStats(); }}
                searchEntity="contact"
                onSearchData={(results) => setData(results as Contact[])}
                onSearchLoading={setIsLoading}
                filter={
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="rounded-md border border-gray-300 px-3 py-[7px] text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="unread">No leídos</option>
                        <option value="read">Leídos</option>
                        <option value="in_progress">En proceso</option>
                        <option value="resolved">Resueltos</option>
                        <option value="spam">Spam</option>
                    </select>
                }
                emptyMessage="No hay mensajes de contacto"
                columns={[
                    { key: 'createdAt', label: 'Fecha', render: (c: Contact) => <span className="text-xs text-gray-500">{formatDate(c.createdAt)}</span> },
                    { key: 'name', label: 'Nombre', render: (c) => c.name, className: 'font-medium' },
                    { key: 'email', label: 'Email', render: (c) => <span className="text-gray-600">{c.email}</span> },
                    { key: 'subject', label: 'Asunto', render: (c) => <span className="max-w-[200px] truncate block">{c.subject}</span> },
                    {
                        key: 'status',
                        label: 'Estado',
                        render: (c) => {
                            const info = statusConfig[c.status] || statusConfig.unread;
                            return (
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
                                    {info.label}
                                </span>
                            );
                        },
                    },
                ]}
                rowKey={(c) => c._id!}
                actions={[
                    {
                        icon: <Eye className="w-4 h-4" />,
                        tooltip: 'Ver detalle',
                        onClick: openDetail,
                        color: 'text-blue-600',
                    },
                ]}
            />

            {/* Detail Modal */}
            {detailModal.show && detailModal.contact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Detalle del mensaje</h3>
                                <button onClick={closeDetail} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                            </div>

                            {/* Contact info */}
                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Nombre</p>
                                        <p className="text-sm font-medium text-gray-900">{detailModal.contact.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                                        <p className="text-sm font-medium text-gray-900">{detailModal.contact.email}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha</p>
                                    <p className="text-sm text-gray-900">{formatDate(detailModal.contact.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Asunto</p>
                                    <p className="text-sm font-medium text-gray-900">{detailModal.contact.subject}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Mensaje</p>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                                        {detailModal.contact.message}
                                    </div>
                                </div>
                            </div>

                            {/* Status editor */}
                            <div className="border-t pt-4 space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Estado</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(statusConfig).map(([key, config]) => {
                                            const [textColor, bgColor] = config.color.split(' ');
                                            const isSelected = editStatus === key;
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => setEditStatus(key)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                                                        isSelected
                                                            ? `${bgColor} ${textColor} border-transparent shadow-sm ring-2 ring-blue-400/40 ring-offset-1`
                                                            : 'text-gray-500 bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700'
                                                    }`}
                                                >
                                                    {config.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Notas internas</p>
                                    <textarea
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                        rows={3}
                                        placeholder="Agregar notas internas sobre este mensaje..."
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                                <button
                                    onClick={closeDetail}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveDetail}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ContactDataPage;
