import { parseYaml } from './utilities/yamlParser';
import { performAssertion } from './utilities/assertions';
import httpRequest from './clients/httpRequest';
import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';


function getValueByPath(obj: any, pathString: string): any {
    return pathString.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : null, obj);
}

async function runTestFlowForFile(filePath: string) {
    const flow = parseYaml(filePath);
    if (!flow) {
        console.error(pc.red(`Failed to parse YAML file: ${filePath}`));
        return;
    }

    for (const testName in flow) {
        console.log(`Running test: ${pc.cyan(testName)}`);
        const steps = flow[testName];
        const context: Record<string, any> = {};

        for (const step of steps) {
            const { name, url, method, params, assertions, headers, saveToContext } = step;

            try {
                console.log(`   Running step: ${pc.cyan(name)}`);

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
                            console.log(`       Assertion ${index + 1}: ${pc.green('Passed')}`);
                        } catch (error) {
                            console.error(`       Assertion ${index + 1}: ${pc.red('Failed')} - ${error}`);
                        }
                    });
                }

            } catch (error) {
                console.error(pc.bgRed(`    Step "${name}" encountered an error: ${error}`));
            }
        }
    }
}

async function runAllTestFlows() {
    const testsDir = './tests';
    const files = fs.readdirSync(testsDir);

    for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
            console.log(pc.bgYellow(`\nProcessing file: ${file}`));
            await runTestFlowForFile(path.join(testsDir, file));
        }
    }
}

runAllTestFlows().catch(console.error);
