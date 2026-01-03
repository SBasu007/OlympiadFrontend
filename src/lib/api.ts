export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api/";

export async function apiFetch<T=any>(path:string, options: RequestInit = {}): Promise<T>{
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('auth_token') : null;
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  
  // For admin routes, use Bearer token from sessionStorage
  if(token) headers['Authorization'] = `Bearer ${token}`;
  
  // For student routes, use credentials (cookies)
  const isStudentRoute = path.includes('/student') || path.includes('auth/student');
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: isStudentRoute ? 'include' : 'same-origin',
  };
  
  const res = await fetch(`${API_BASE}${path}`, fetchOptions);
  
  if(res.status === 401){
    if(typeof window !== 'undefined'){
      // Only clear sessionStorage for admin routes
      if (!isStudentRoute) {
        sessionStorage.removeItem('auth_token');
        window.location.href = '/auth/admin';
      } else {
        // For student routes, redirect to login
        window.location.href = '/auth/login';
      }
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
