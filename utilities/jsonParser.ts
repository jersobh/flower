import * as fs from 'fs';

interface TestFlow {
    [testName: string]: Step[];
}

interface Step {
    name: string;
    url: string;
    method: string;
    params?: any;
    assertions?: Assertion[];
    headers?: Record<string, string> | string[];
    saveToContext?: Record<string, string>;
}

interface Assertion {
    type: string;
    target: string;
    expected: any;
}

export function parseJson(filePath: string) {
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContents) as TestFlow;
    } catch (e) {
        console.error(e);
        return null;
    }
}
