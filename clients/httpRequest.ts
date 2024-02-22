import axios, { AxiosRequestConfig } from 'axios';
import pc from 'picocolors';

interface Context {
    [key: string]: any;
}

interface Params {
    [key: string]: any;
}

interface HttpRequestParams {
    url: string;
    method: string;
    params?: any;
    headers?: any;
    context?: Context;
}



function replaceContextValues(value: string, context: Context): string {
    if (typeof value === 'string') {
        return value.replace(/\{context\.(\w+)\}/g, (match, key) => {
            if (context[key] !== undefined) {
                return context[key];
            }
            return match;
        });
    }
    return value;
}


export default async function httpRequest({ url, method, params, headers, context }: HttpRequestParams): Promise<any> {
    const processedUrl = replaceContextValues(url, context ?? {});

    const processedParams: Params = {};
    Object.keys(params || {}).forEach(key => {
        processedParams[key] = replaceContextValues(params[key], context ?? {});
    });


    const processedHeaders: Record<string, string> = {};
    if (headers && typeof headers === 'object' && !Array.isArray(headers)) {
        Object.keys(headers).forEach(key => {
            processedHeaders[key] = replaceContextValues(headers[key] as string, context ?? {});
        });
    }

    const config: AxiosRequestConfig = {
        url: processedUrl,
        method: method as any,
        headers: processedHeaders,
        ...(method.toUpperCase() === 'GET' ? { params: processedParams } : { data: processedParams }),
    };

    try {
        const response = await axios(config);
        return response;
    } catch (error: any) {
        console.error(`${pc.red('ERROR')} ${error.message}`);
        throw error.message;
    }
}
