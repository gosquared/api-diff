# Setup
Install node 16

```bash
nvm install 16
```

Install deps

```bash
npm i
npm i -g zx
```

# Usage
Use node 16
```bash
nvm use 16
```

Build

```bash
npm run watch
```

Set up your requests in reqs.txt. See `reqs.example.txt`

Requests are curl arguments, fed right into `curl`

Run:
```bash
# apply to every request
export CURL_ARGS='-s'
# host a only
export HOST_A_ARGS='-H "Authorization: bearer 1234"'
# host b only
export HOST_B_ARGS='-H "Authorization: bearer 5678"'

zx dist/run.js reqs.txt \
  --host-a "https://api.gosquared.com" \
  --host-b "https://api-2.gosquared.com"
```

# Reference
```bash
npm i -D zx typescript @types/node json-diff
npx tsc --init --target es2018 --outDir dist --declaration true
```
