import { config } from '@/config/config';

const environment = process.env.NODE_ENV || 'development';
const baseURL = config[environment].apiDashboard;

export interface BlockedIpData {
  _id: string;
  ip: string;
  attemptCount: number;
  blockedAt: string;
  releasedAt: string | null;
  releasedBy: string | null;
  relapseCount: number;
  blockedBy: string;
  metadata: IpMetadata | null;
  createdAt: string;
  updatedAt: string;
}

export interface IpMetadata {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
}

export interface BlockedIpListResponse {
  data: BlockedIpData[];
  total: number;
  page: number;
  pageSize: number;
}

export const getBlockedIps = async (
  page = 1,
  limit = 20,
  filter?: 'blocked' | 'released',
): Promise<BlockedIpListResponse> => {
  try {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (filter && filter !== 'blocked') params.set('filter', filter);

    const response = await fetch(`${baseURL}/api/blocked-ips?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      console.error('Error fetching blocked IPs:', response.status, response.statusText);
      return { data: [], total: 0, page: 1, pageSize: limit };
    }
    return await response.json();
  } catch {
    return { data: [], total: 0, page: 1, pageSize: limit };
  }
};

export const getBlockedIp = async (ip: string): Promise<BlockedIpData | null> => {
  try {
    const response = await fetch(`${baseURL}/api/blocked-ips/${encodeURIComponent(ip)}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

export const refreshIpInfo = async (ip: string): Promise<BlockedIpData | null> => {
  try {
    const response = await fetch(
      `${baseURL}/api/blocked-ips/${encodeURIComponent(ip)}/info`,
      { headers: { 'Content-Type': 'application/json' } },
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

export const releaseIp = async (ip: string): Promise<{ success: boolean; message: string } | null> => {
  try {
    const response = await fetch(
      `${baseURL}/api/blocked-ips/${encodeURIComponent(ip)}/release`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

export const deleteBlockedIp = async (ip: string): Promise<{ success: boolean; message: string } | null> => {
  try {
    const response = await fetch(
      `${baseURL}/api/blocked-ips/${encodeURIComponent(ip)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};
