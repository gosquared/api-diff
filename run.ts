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
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

function open_file(path: string) {
  const stream = createReadStream(path);

  return createInterface({
    input: stream,
    crlfDelay: Infinity
  });
}

function req(host: string, line: string, dest: string) {
  const opts = line.replace('{HOST}', host).split(' ');
  const args = [ '-s', ...opts ];
  return $`curl ${args} > ${dest}`;
}

console.log(argv)

const hostA = argv['host-a'];
const hostB = argv['host-b'];

if (!hostA || !hostB) {
  console.log('--host-a and --host-b are required');
  process.exit(1);
}

async function main() {
  const lines = open_file(argv._[1]);

  for await (const line of lines) {
    // e.g. line:
    //  -XGET -H 'Content-Type: application/json' {HOST}/profiles/1?project_id=1 -d '{}'
    console.log(line);

    await Promise.all([
      req(hostA, line, './a.result.json'),
      req(hostB, line, './b.result.json')
    ]);

    await $`npx json-diff --color ./a.result.json ./b.result.json`;

    const response = await question('Continue y/n? [y] ');

    if (response === 'n') process.exit(0);
  }
}

main();
