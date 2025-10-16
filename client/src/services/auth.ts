
import api from '@/lib/api'; // or '../lib/api' if you don't use the @ alias

export async function register(name: string, email: string, password: string) {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data; // e.g., { user, token }
}