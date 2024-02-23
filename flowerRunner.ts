import { parseYaml } from './utilities/yamlParser';
import { parseJson } from './utilities/jsonParser';
import { performAssertion } from './utilities/assertions';
import httpRequest from './clients/httpRequest';
import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';


interface Context {
    [key: string]: any;
}

function parseFile(filePath: string) {
    const extension = filePath.split('.').pop()?.toLowerCase();

    if (extension === 'yaml' || extension === 'yml') {
        return parseYaml(filePath);
    } else if (extension === 'json') {
        return parseJson(filePath);
    } else {
        console.error(pc.red(`File extension ${extension} not supported`));
        return null;
    }
}

function getValueByPath(obj: any, pathString: string): any {
    return pathString.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : null, obj);
}

async function runTestFlowForFile(filePath: string): Promise<string> {
    const flow = parseFile(filePath)
    if (!flow) {
        return pc.red(`Failed to parse file: ${filePath}`);
    }
    const outputBuffer: string[] = [];
    const log = (message: string) => outputBuffer.push(message);

    for (const testName in flow) {
        const context: Context = {};
        log(`Running test: ${pc.cyan(testName)}`);
        const steps = flow[testName];

        for (const step of steps) {
            const { name, url, method, params, assertions, headers, saveToContext } = step;
            try {
                log(`   Running step: ${pc.cyan(name)}`);
                const response = await httpRequest({ url, method, params, headers, context });

                if (saveToContext) {
                    Object.keys(saveToContext).forEach((key: string) => {
                        const valuePath: string = saveToContext[key];
                        context[key] = getValueByPath(response, valuePath);
                    });
                }

                if (assertions) {
                    assertions.forEach((assertion: any, index: number) => {
                        const actualValue = getValueByPath(response, assertion.target);
                        try {
                            performAssertion(assertion, actualValue);
                            log(`       Assertion ${index + 1}: ${pc.green('Passed')}`);
                        } catch (error) {
                            const message = (error as Error).message;
                            log(`       Assertion ${index + 1}: ${pc.red('Failed')} - ${message || error}`);
                        }
                    });
                }
            } catch (error) {
                const message = (error as Error).message;
                log(pc.bgRed(`    Step "${name}" encountered an error: ${message || error}`));
            }
        }
    }
    return outputBuffer.join('\n');
}

async function runAllTestFlows(runInParallel: boolean) {
    const testsDir = './tests';
    const files = fs.readdirSync(testsDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json'));
    console.log(`\nRunning ${files.length} test flows...`);
    console.log('Parallel mode: ', runInParallel);
    let hasFailures = false;

    if (runInParallel) {
        const promises = files.map(file => runTestFlowForFile(path.join(testsDir, file)));
        const results = await Promise.all(promises);
        results.forEach((result, index) => {
            console.log(pc.bgYellow(`\n${files[index]}`));
            console.log(result);
            if (result.includes('Failed')) {
                hasFailures = true;
            }
        });
    } else {
        for (const file of files) {
            console.log(pc.bgYellow(`\nProcessing file: ${file}`));
            const result = await runTestFlowForFile(path.join(testsDir, file));
            console.log(result);
            if (result && result.includes('Failed')) {
                hasFailures = true;
            }
        }
    }

    if (hasFailures) {
        console.error(pc.bgRed('\nSome tests failed. Exiting with error code 1.'));
        process.exit(1);
    }
    console.log(pc.bgGreen('\nTest execution completed successfully.'));
}

const runInParallel = process.argv.includes('--parallel');
runAllTestFlows(runInParallel).catch(console.error);
