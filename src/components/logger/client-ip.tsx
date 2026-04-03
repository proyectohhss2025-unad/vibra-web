import useClientIp from '@/registry/new-york/hooks/use-client-ip';
import React from 'react';

const ClientIp: React.FC = () => {
    const { clientIp, error, loading } = useClientIp();

    if (loading) {
        return <p>Cargando IP...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (clientIp) {
        return <p>La IP del cliente es: {clientIp}</p>;
    }

    return <p>No se pudo obtener la IP</p>
};

export default ClientIp;