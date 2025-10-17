export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api/";

export async function apiFetch<T=any>(path:string, options: RequestInit = {}): Promise<T>{
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('auth_token') : null;
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  if(token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if(res.status === 401){
    if(typeof window !== 'undefined'){
      sessionStorage.removeItem('auth_token');
      window.location.href = '/auth/admin';
    }
    throw new Error('Unauthorized');
  }
  let data:any = null;
  try { data = await res.json(); } catch{}
  if(!res.ok){
    throw new Error(data?.message || 'Request failed');
  }
  return data as T;
}
