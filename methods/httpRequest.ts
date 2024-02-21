import axios, { AxiosRequestConfig } from 'axios';
import pc from 'picocolors';

interface HttpRequestParams {
    url: string;
    method: string;
    params?: any;
    headers?: any;
}

export default async function httpRequest({ url, method, params, headers }: HttpRequestParams): Promise<any> {
    const config: AxiosRequestConfig = {
        url,
        method: method as any,
        headers,
        ...(method.toUpperCase() === 'GET' ? { params } : { data: params }),
    };

    try {
        const response = await axios(config);
        return response;
    } catch (error: any) {
        console.error(`${pc.red('ERROR')} ${error.message}`);
        throw error.message;
    }
}
