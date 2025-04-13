# Windows Build Instructions

This document provides instructions for building the office-chat project on Windows, especially when encountering the "too many open files" error.

## Problem

When running `npm run build:office` or `npm run build` in the office-chat directory on Windows, you may encounter the following error:

```
Error: EMFILE: too many open files, open '...'
```

This error occurs because the build process tries to open more files simultaneously than the Windows operating system allows.

## Solution

A PowerShell script `build-windows.ps1` has been created to handle this issue by:

1. Increasing Node.js memory limit
2. Building projects sequentially instead of in parallel
3. Adding pauses between builds to allow resources to be released
4. Forcing garbage collection between builds

## Usage

### Build All Projects

To build all projects sequentially:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-windows.ps1
```

### Build a Specific Project

To build a single project:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-windows.ps1 <project-name>
```

Replace `<project-name>` with one of the following:
- auth
- doc-commands
- doc-chat
- functions
- generate-slides
- jupyter
- latex
- python
- python-slide
- sheet-chat
- slide-chat
- vba

## Troubleshooting

If you still encounter "too many open files" errors:

1. Close other applications to free up system resources

2. Increase the Windows file handle limit (requires administrator privileges):
   ```powershell
   # Run PowerShell as Administrator
   reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\kernel" /v "MaximumUserPort" /t REG_DWORD /d 65534 /f
   reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "TcpTimedWaitDelay" /t REG_DWORD /d 30 /f
   # Restart your computer after making these changes
   ```

3. Try building with an even higher memory limit:
   ```powershell
   $env:NODE_OPTIONS = "--max-old-space-size=12288"
   powershell -ExecutionPolicy Bypass -File .\build-windows.ps1
   ```

4. If all else fails, consider building on a Linux or macOS system, which typically have higher file handle limits.

## Note for Mac/Linux Users

This script is specifically designed for Windows. On Mac or Linux systems, you can use the standard build command:

```bash
npm run build
```

These systems typically have higher file handle limits and don't encounter the same issues as Windows.
