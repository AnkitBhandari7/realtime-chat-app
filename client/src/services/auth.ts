
import api from '@/lib/api'; 

export async function register(name: string, email: string, password: string) {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data; // e.g., { user, token }
}