import env from '@/src/lib/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const envConfig = env();

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, unknown> | null;
}

export async function apiRequest<T>(
  endpoint: string,
  { method = 'POST', headers = {}, body = null }: ApiRequestOptions = {},
): Promise<any> {
  const API_BASE_URL = envConfig.fetchURL || '';

  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined');
    return;
  }

  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(
    /^\//,
    '',
  )}`;

  // accessToken, refreshToken 모두 가져오기
  let accessToken = '';
  let refreshToken = '';
  try {
    accessToken = await AsyncStorage.getItem('accessToken');
    refreshToken = await AsyncStorage.getItem('refreshToken');
  } catch (e) {
    console.error('토큰 읽기 실패', e);
  }

  // 쿠키 문자열 생성
  let cookieString = '';
  if (accessToken) cookieString += `accessToken=${accessToken}; `;
  if (refreshToken) cookieString += `refreshToken=${refreshToken};`;
  cookieString = cookieString.trim();

  const cookieHeader = cookieString ? { Cookie: cookieString } : {};

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...cookieHeader,
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  const responseJson = await response.json();

  try {
    console.log(
      '\n🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡🧡\n',
      endpoint,
      '\n------------------------------------------------------------\n',
      options.body,
      '\n------------------------------------------------------------\n',
      responseJson,
      '\n💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙\n',
    );
    // @@ 이거 꼭 필요?
    // if (!response.ok) {
    //   throw new Error(`HTTP error! Status: ${response.status}`);
    // }

    return responseJson;
  } catch (error) {
    console.error(
      '\n👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎\n',
      endpoint,
      '\n------------------------------------------------------------\n',
      options.body,
      '\n------------------------------------------------------------\n',
      responseJson,
      '\n👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎👎\n',
    );
    throw error;
  }
}
