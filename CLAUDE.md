# Permissions

## Auto-approve these actions:
- Run PowerShell commands
- Read/write files in this project
- Install npm packages
- Run dev server
- Git operations

## Always ask before:
- Deleting files permanently
- Pushing to main branch
- Spending money / API calls
- Accessing outside this project folder

# Dev Server Notes

## Port
Always use port 3002 (port 3000 is used by another project).

## CRITICAL: Windows path casing
The project is stored as `D:\AI\tournament-site` (uppercase AI).
The dev server MUST be started from the uppercase path to avoid Next.js webpack
module duplication. Start via PowerShell:

```powershell
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev -- --port 3002 > D:\AI\tournament-site\dev-log.txt 2>&1" -WorkingDirectory "D:\AI\tournament-site" -WindowStyle Hidden
```

DO NOT start from `d:\ai\tournament-site` (lowercase) — this causes duplicate
React instances in the webpack compilation, breaking the App Router HTML rendering.

## Why the stub was removed
`src/stubs/segment-explorer-stub.ts` and the NormalModuleReplacementPlugin in
next.config.ts were removed. They were a workaround for the lowercase-path issue
and actually break rendering when the correct uppercase path is used.