'use client';

import { getAll, update, getStats, UpdateContactPayload, ContactStats } from '@/api/contact';
import { Contact } from '@/models/contact.entity';
import { AuthContext } from '@/services/auth';
import { RefreshIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Search from '../search/search';
import Pagination from '../ui/table/pagination';
import CurrentDateTime from '../utils/current-datetime';
import '../test/test.css';

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
            <div className="hidden flex-col md:flex w-full mt-0">
                <div className="hidden flex-col w-full md:flex mt-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight ml-3">Gestión de Contacto</h2>
                        <div className="flex items-center space-x-2">
                            <div className="bg-white rounded-md px-2 pl-2 mb-0 pb-1">
                                <CurrentDateTime />
                            </div>
                        </div>
                    </div>
                </div>

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

                <div className="bg-white rounded-md w-full mt-3 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-semibold">Mensajes de Contacto</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestione los mensajes enviados desde la landing page.
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* Status filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos los estados</option>
                                <option value="unread">No leídos</option>
                                <option value="read">Leídos</option>
                                <option value="in_progress">En proceso</option>
                                <option value="resolved">Resueltos</option>
                                <option value="spam">Spam</option>
                            </select>
                            <Search
                                isOpen={false}
                                onClose={() => { }}
                                setData={(results: any) => setData(results)}
                                entity="contact"
                                setIsLoading={setIsLoading}
                            >
                                <RefreshIcon
                                    className="h-7 w-7 text-blue-600 cursor-pointer hover:text-green-500"
                                    onClick={() => { setCurrentPage(1); loadData(); loadStats(); }}
                                />
                            </Search>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="uppercase tracking-wider border-b-2">
                                <tr>
                                    <th className="px-3 py-2">Fecha</th>
                                    <th className="px-3 py-2">Nombre</th>
                                    <th className="px-3 py-2">Email</th>
                                    <th className="px-3 py-2">Asunto</th>
                                    <th className="px-3 py-2">Estado</th>
                                    <th className="px-3 py-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">
                                            {isLoading ? 'Cargando...' : 'No hay mensajes de contacto'}
                                        </td>
                                    </tr>
                                )}
                                {data.map((contact) => {
                                    const statusInfo = statusConfig[contact.status] || statusConfig.unread;
                                    return (
                                        <tr key={contact._id} className="hover:bg-blue-50 border-b cursor-pointer"
                                            onClick={() => openDetail(contact)}>
                                            <td className="px-3 py-2 text-xs text-gray-500">{formatDate(contact.createdAt)}</td>
                                            <td className="px-3 py-2 font-medium">{contact.name}</td>
                                            <td className="px-3 py-2 text-gray-600">{contact.email}</td>
                                            <td className="px-3 py-2 max-w-[200px] truncate">{contact.subject}</td>
                                            <td className="px-3 py-2">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openDetail(contact); }}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    title="Ver detalle"
                                                >
                                                    👁️
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalItems={total}
                        onPageChange={setCurrentPage}
                        setPageSize={setPageSize}
                    />
                </div>
            </div>

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
                                        {Object.entries(statusConfig).map(([key, config]) => (
                                            <button
                                                key={key}
                                                onClick={() => setEditStatus(key)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                    editStatus === key
                                                        ? `${config.color} border-current ring-2 ring-offset-1`
                                                        : 'text-gray-500 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {config.label}
                                            </button>
                                        ))}
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
