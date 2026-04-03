import { config } from '@/config/config';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

export const getAllPolicies = async (page?: number, rows?: number) => {
    try {
        const params = new URLSearchParams();
        if (page) params.set('page', String(page));
        if (rows) params.set('limit', String(rows));
        const response = await fetch(`${configAPI.baseURL}/api/policies${params.size ? `?${params.toString()}` : ''}`);
        const data = await response.json();
        return {
            policies: data?.data ?? data ?? [],
            count: data?.total ?? data?.count ?? 0
        };
    } catch {
        return {
            policies: [],
            count: 0
        };
    }
};

export const getPolicyById = async (id: string) => {
    const response = await fetch(`${configAPI.baseURL}/api/policies/${id}`);
    return await response.json();
};

export const createPolicy = async (
    id: string,
    name: string,
    description: string,
    content: string,
    category: string,
    createdBy: string
) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${configAPI.baseURL}/api/policies/${id}` : `${configAPI.baseURL}/api/policies`;

    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            description,
            content,
            category,
            createdBy,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }),
    });

    return await response.json();
};

export const updatePolicyStatus = async (id: string, status: string) => {
    const response = await fetch(`${configAPI.baseURL}/api/policies/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            isActive: status === 'true',
            updatedAt: new Date()
        }),
    });

    return await response.json();
};

export const acceptPolicy = async (id: string, userId?: string) => {
    const response = await fetch(`${configAPI.baseURL}/api/policies/${id}/accept`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    });
    return await response.json();
};

export const acceptPoliciesBulk = async (policyIds: string[], userId?: string) => {
    const response = await fetch(`${configAPI.baseURL}/api/policies/accept-multiple`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ policyIds, userId }),
    });
    return await response.json();
};

export const getUserPendingPolicies = async (userId: string) => {
    const response = await fetch(`${configAPI.baseURL}/api/policies/user/${userId}/pending`);
    return await response.json();
};

export const checkUserPolicy = async (userId: string, policyId: string) => {
    const response = await fetch(`${configAPI.baseURL}/api/policies/user/${userId}/check/${policyId}`);
    return await response.json();
};
