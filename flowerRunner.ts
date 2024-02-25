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

async function parseFile(filePath: string) {
    const extension = filePath.split('.').pop()?.toLowerCase();

    if (extension === 'yaml' || extension === 'yml') {
        return await parseYaml(filePath);
    } else if (extension === 'json') {
        return await parseJson(filePath);
    } else {
        console.error(pc.red(`File extension ${extension} not supported`));
        return null;
    }
}

function getValueByPath(obj: any, pathString: string): any {
    return pathString.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : null, obj);
}

function elapsedTime(start: [number, number]): string {
    const [secs, nanosecs] = process.hrtime(start);
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    const milliseconds = Math.round(nanosecs / 1e6);
    
    let timeString = '';
    if (hours > 0) timeString += `${hours}h `;
    if (hours > 0 || minutes > 0) timeString += `${minutes}m `;
    timeString += `${seconds}s ${milliseconds}ms`;

    return timeString.trim();
}


async function runTestFlowForFile(filePath: string): Promise<string> {
    const flowStartTime = process.hrtime();
    const flow = await parseFile(filePath);
    if (!flow) {
        return pc.red(`Failed to parse file: ${filePath}`);
    }
    const outputBuffer: string[] = [];
    const log = (message: string) => outputBuffer.push(message);

    for (const testName in flow) {
        const context: Context = {};
        log(`Running test: ${pc.cyan(testName)}\n`);
        const steps = flow[testName];

        for (const step of steps) {
            const stepStartTime = process.hrtime();
            const { name, url, method, params, assertions, headers, saveToContext } = step;
            try {
                log(pc.bold(`   Running step: ${pc.cyan(name)}`));
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
            } finally {
                log(pc.bold(`   Completed in ${elapsedTime(stepStartTime)}\n`));
            }
        }
    }
    log(pc.cyan(`Test flow completed in ${elapsedTime(flowStartTime)}\n`));
    return outputBuffer.join('\n');
}

async function runAllTestFlows(runInParallel: boolean) {
    const overallStartTime = process.hrtime();
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

    const totalElapsedTime = elapsedTime(overallStartTime);
    console.log(`Total execution time: ${totalElapsedTime}`);

    if (hasFailures) {
        console.error(pc.bgRed('\nSome tests failed. Exiting with error code 1.'));
        process.exit(1);
    } else {
        console.log(pc.bgGreen('\nTest execution completed successfully.'));
    }
}

const runInParallel = process.argv.includes('--parallel');
runAllTestFlows(runInParallel).catch(console.error);
