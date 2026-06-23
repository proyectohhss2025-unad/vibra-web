import api from '@/api/axios-instance';

export const searchByQuery = async (query: string, entity: string) => {
    try {
        const searchTerm = query === '' ? 'all' : query;
        const response = await api.get(`/api/${entity}/search`, { params: { searchTerm } });
        return response.data || { data: [] };
    } catch (error) {
        console.error('Error en searchByQuery:', error);
        return { data: [] };
    }
}
