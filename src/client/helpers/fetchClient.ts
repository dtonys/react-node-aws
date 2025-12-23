import { replaceState } from './routing';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

const fetchClient = {
  get: async <TResponse = unknown>(
    url: string,
    headers?: Record<string, string>,
  ): Promise<TResponse> => {
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...defaultHeaders, ...headers },
      credentials: 'include',
    });
    const data: TResponse = await response.json();
    if (!response.ok) {
      const err = new Error(`HTTP error! status: ${response.status}`);
      (err as any).status = response.status;
      (err as any).data = data;
      throw err;
    }
    return data;
  },

  post: async <TRequest = unknown, TResponse = unknown>(
    url: string,
    body?: TRequest,
    headers?: Record<string, string>,
  ): Promise<TResponse> => {
    const isFormData = body instanceof FormData;
    const response = await fetch(url, {
      method: 'POST',
      headers: isFormData ? { ...headers } : { ...defaultHeaders, ...headers },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });
    // Check for redirect response
    if (response.redirected) {
      replaceState(new URL(response.url).pathname);
      return {} as TResponse;
    }

    const data: TResponse = await response.json();
    if (!response.ok) {
      console.log('response not ok');
      const err = new Error(`HTTP error! status: ${response.status}`);
      (err as any).status = response.status;
      (err as any).data = data;
      console.log('response error');
      throw err;
    }
    console.log('response return data: ', data);
    return data;
  },

  put: async <TRequest = unknown, TResponse = unknown>(
    url: string,
    body?: TRequest,
    headers?: Record<string, string>,
  ): Promise<TResponse> => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { ...defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });
    const data: TResponse = await response.json();
    if (!response.ok) {
      const err = new Error(`HTTP error! status: ${response.status}`);
      (err as any).status = response.status;
      (err as any).data = data;
      throw err;
    }
    return data;
  },

  patch: async <TRequest = unknown, TResponse = unknown>(
    url: string,
    body?: TRequest,
    headers?: Record<string, string>,
  ): Promise<TResponse> => {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { ...defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });
    const data: TResponse = await response.json();
    if (!response.ok) {
      const err = new Error(`HTTP error! status: ${response.status}`);
      (err as any).status = response.status;
      (err as any).data = data;
      throw err;
    }
    return data;
  },

  delete: async <TRequest = unknown, TResponse = unknown>(
    url: string,
    body?: TRequest,
    headers?: Record<string, string>,
  ): Promise<TResponse> => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { ...defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });
    const data: TResponse = await response.json();
    if (!response.ok) {
      const err = new Error(`HTTP error! status: ${response.status}`);
      (err as any).status = response.status;
      (err as any).data = data;
      throw err;
    }
    return data;
  },
};

export default fetchClient;
