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
zx dist/run.js reqs.txt \
  --host-a "https://api.gosquared.com" \
  --host-b "https://api-2.gosquared.com"
```


# Reference
```bash
npm i -D zx typescript @types/node json-diff
npx tsc --init --target es2018 --outDir dist --declaration true
```
