import React, { useState, useEffect } from 'react';

interface IpData {
    ip: string;
}

const useClientIp = () => {
    const [clientIp, setClientIp] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchIp = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://api.ipify.org?format=json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: IpData = await response.json();
                setClientIp(data.ip);
                setError(null);
            } catch (err: any) {
                setError(`Failed to fetch IP address: ${err.message}`);
                setClientIp(null);
            } finally {
                setLoading(false);
            }
        };

        fetchIp();
    }, []);

    return { clientIp, error, loading };
};

export default useClientIp;