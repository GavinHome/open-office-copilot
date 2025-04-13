@echo off
echo Increasing file handle limits...

REM Increase the file handle limit in the registry
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\kernel" /v "MaximumUserPort" /t REG_DWORD /d 65534 /f
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "TcpTimedWaitDelay" /t REG_DWORD /d 30 /f

echo File handle limits increased. Please restart your computer for changes to take effect.
pause
