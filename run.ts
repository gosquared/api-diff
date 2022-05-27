#!/usr/bin/env zx

/**
 *  zx dist/run.js --host-a test.com --host-b test2.com reqs.txt
    {
      _: [ 'dist/run.js', 'reqs.txt' ],
      'host-a': 'test.com',
      'host-b': 'test2.com'
    }
*/

import {$, argv, question} from 'zx'
import { createReadStream, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { execSync } from 'child_process';

if (argv.help) {
  console.log(`
  # apply to every request
  export CURL_ARGS='-s'
  # host a only
  export HOST_A_ARGS='-H "Authorization: bearer 1234"'
  # host b only
  export HOST_B_ARGS='-H "Authorization: bearer 5678"'

  npx api-diff reqs.txt --host-a test.com --host-b test2.com
  `);
  process.exit();
}

function open_file(path: string) {
  const stream = createReadStream(path);

  return createInterface({
    input: stream,
    crlfDelay: Infinity
  });
}

function jsonFormat(str: string) {
  return JSON.stringify(JSON.parse(str), null, 2);
}

function req(host: string, line: string, dest: string, extraCurlArgs: string = '') {
  let args = line.replace('{HOST}', host);

  if (extraCurlArgs) args += ` ${extraCurlArgs}`;

  const cmd = `curl ${args}`;
  console.log(cmd)
  const result = execSync(cmd, { encoding: 'utf8' });
  const formatted = jsonFormat(result);
  writeFileSync(dest, formatted);
}

// argv._: [ '.bin/api-diff', 'reqs.txt' ]
console.log(argv)

const hostA = argv['host-a'];
const hostB = argv['host-b'];

const curlArgs = process.env.CURL_ARGS || '';
const hostAArgs = process.env.HOST_A_ARGS || '';
const hostBArgs = process.env.HOST_B_ARGS || '';

console.log({
  curlArgs,
  hostAArgs,
  hostBArgs
});

if (!hostA || !hostB) {
  console.log('--host-a and --host-b are required');
  process.exit(1);
}

async function handleLine(line: string): Promise<void> {
  // e.g. line:
    //  -XGET -H 'Content-Type: application/json' {HOST}/profiles/1?project_id=1 -d '{}'
    console.log(line);

    let hostACurlArgs = '';
    let hostBCurlArgs = '';

    if (curlArgs) {
      hostACurlArgs = `${curlArgs} ${hostAArgs}`;
      hostBCurlArgs = `${curlArgs} ${hostBArgs}`;
    }

    req(hostA, line, './a.result.json', hostACurlArgs),
    req(hostB, line, './b.result.json', hostBCurlArgs)

    await $`npx json-diff --color ./a.result.json ./b.result.json`;

    const response = await question('Continue c, retry r, quit q [c] ');

    if (response === 'r') return handleLine(line);
    if (response === 'q') process.exit(0);
}

async function main() {
  const lines = open_file(argv._[1]);

  for await (const line of lines) {
    await handleLine(line);
  }
}

main();
