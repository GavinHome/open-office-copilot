# Windows build script for office-chat
# This script handles the "too many open files" error on Windows
# Usage:
#   - To build all projects: .\build-windows.ps1
#   - To build a specific project: .\build-windows.ps1 <project-name>

# Set environment variables to increase Node.js memory limit
$env:NODE_OPTIONS = "--max-old-space-size=18192"

# Get project name from command line argument
$projectName = $args[0]

# Function to build a single project
function Build-Project {
    param (
        [string]$Name
    )

    Write-Host "Building project: $Name" -ForegroundColor Yellow

    # Force garbage collection before build
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    # Build the project with detailed error output
    Write-Host "Running: node node_modules/webpack/bin/webpack.js --config webpack.cdn.config.js --mode production --name $Name" -ForegroundColor Gray

    # Capture both standard output and error output
    $output = & node node_modules/webpack/bin/webpack.js --config webpack.cdn.config.js --mode production --name $Name 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to build $Name" -ForegroundColor Red

        # Look for specific error patterns
        $tooManyFilesError = $output | Select-String -Pattern "EMFILE: too many open files" -SimpleMatch
        if ($tooManyFilesError) {
            Write-Host "Error: Too many open files. This is a common issue on Windows." -ForegroundColor Red
            Write-Host "Try increasing your system's file handle limit or build a simpler project first." -ForegroundColor Yellow
        } else {
            # Display the last 20 lines of output which often contain the actual error
            Write-Host "Last 20 lines of build output:" -ForegroundColor Yellow
            $output | Select-Object -Last 20 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
        }

        # Option to save full log with ANSI escape sequences removed
        $logFile = "build-$Name-error.log"

        # Remove ANSI escape sequences before saving to file
        $cleanOutput = $output -replace "\u001b\[[0-9;]*[a-zA-Z]", "" -replace "\[[0-9]+m", ""

        # Save clean output to file
        $cleanOutput | Out-File -FilePath $logFile -Encoding utf8
        Write-Host "Full build log saved to: $logFile" -ForegroundColor Cyan

        return $false
    } else {
        Write-Host "Successfully built $Name" -ForegroundColor Green
        return $true
    }
}

# Function to get all projects
function Get-Projects {
    $srcPath = Join-Path $PSScriptRoot "src"
    $dirs = Get-ChildItem -Path $srcPath -Directory | Where-Object { -not $_.Name.StartsWith("_") -and -not $_.Name.StartsWith(".") }
    return $dirs.Name
}

# Main function
function Main {
    Write-Host "Office-Chat Windows Build Script" -ForegroundColor Cyan

    # If a project name is provided, build only that project
    if ($projectName) {
        $success = Build-Project -Name $projectName

        if ($success) {
            Write-Host "Build completed for $projectName" -ForegroundColor Green
        } else {
            Write-Host "Build failed for $projectName" -ForegroundColor Red
            Write-Host "Check the build-$projectName-error.log file for detailed error information" -ForegroundColor Yellow
            exit 1
        }
    }
    # Otherwise, build all projects
    else {
        $projects = Get-Projects
        Write-Host "Found projects: $($projects -join ', ')" -ForegroundColor Cyan
        Write-Host "Building all projects sequentially to avoid 'too many open files' error" -ForegroundColor Yellow

        $failedProjects = @()

        foreach ($project in $projects) {
            $success = Build-Project -Name $project

            if (-not $success) {
                $failedProjects += $project
            }

            # Wait for system to release resources
            Write-Host "Waiting for system to release resources..." -ForegroundColor Cyan
            Start-Sleep -Seconds 5
        }

        # Copy assets to web-server
        Write-Host "Copying assets to web-server..." -ForegroundColor Cyan
        $webServerPath = Join-Path $PSScriptRoot "..\web-server\public\office-chat"

        if (-not (Test-Path -Path $webServerPath)) {
            New-Item -Path $webServerPath -ItemType Directory -Force | Out-Null
        }

        $assetsPath = Join-Path $PSScriptRoot "dist\assets"
        if (Test-Path -Path $assetsPath) {
            Copy-Item -Path $assetsPath -Destination $webServerPath -Recurse -Force
        }

        # Report results
        if ($failedProjects.Count -eq 0) {
            Write-Host "All projects built successfully!" -ForegroundColor Green
        } else {
            Write-Host "The following projects failed to build: $($failedProjects -join ', ')" -ForegroundColor Red
            Write-Host "Check the build-*-error.log files for detailed error information" -ForegroundColor Yellow
            Write-Host "You may need to increase your system's file handle limit or build them individually." -ForegroundColor Yellow
            exit 1
        }
    }
}

# Run the main function
Main
