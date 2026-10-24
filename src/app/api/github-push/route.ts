import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { sanitizeGitUrl, sanitizeGitBranch, sanitizeCommitMessage } from '@/lib/security';

const execAsync = promisify(exec);

// Find git executable
function resolveGitPath(): string {
  const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\ELCOT\\AppData\\Local';
  const ghDesktopBase = path.join(localAppData, 'GitHubDesktop');

  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ ghDesktopBase)) {
      const entries = fs.readdirSync(/*turbopackIgnore: true*/ ghDesktopBase);
      for (const entry of entries) {
        if (entry.startsWith('app-')) {
          const candidate = path.join(ghDesktopBase, entry, 'resources', 'app', 'git', 'cmd', 'git.exe');
          if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
            return `"${candidate}"`;
          }
        }
      }
    }
  } catch {
    // Fallback
  }

  return 'git';
}

// In-memory rate limiting for git operations (1 push per 8 seconds)
let lastPushTimestamp = 0;

export async function POST(request: Request) {
  const logs: string[] = [];

  const log = (msg: string) => {
    logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  };

  try {
    // 1. Rate Limiting Check
    const now = Date.now();
    if (now - lastPushTimestamp < 8000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit active: A Git synchronization is already running or was executed moments ago. Please wait 8 seconds.',
          logs,
        },
        { status: 429 }
      );
    }
    lastPushTimestamp = now;

    const body = await request.json();

    // 2. Security Validation & Sanitization
    const urlValidation = sanitizeGitUrl(body.remoteUrl);
    if (!urlValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: urlValidation.error || 'Invalid GitHub repository URL.',
          logs,
        },
        { status: 400 }
      );
    }

    const remoteUrl = urlValidation.sanitized;
    const branch = sanitizeGitBranch(body.branch);
    const commitMessage = sanitizeCommitMessage(body.commitMessage);

    const git = resolveGitPath();
    log(`Using Git: ${git}`);

    const projectRoot = process.cwd();
    const execOpts = {
      cwd: projectRoot,
      maxBuffer: 10 * 1024 * 1024,
      timeout: 45000,
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0',
        GCM_INTERACTIVE: 'never',
      },
    };

    // 3. Check if git repo is initialized
    const gitDir = path.join(projectRoot, '.git');
    if (!fs.existsSync(gitDir)) {
      log('Initializing fresh Git repository...');
      await execAsync(`${git} init -b ${branch}`, execOpts);
      log(`Git repository initialized on branch ${branch}`);
    } else {
      log('Git repository detected.');
    }

    // 4. Configure identity if not set
    try {
      await execAsync(`${git} config user.name`, execOpts);
    } catch {
      log('Setting default Git committer name...');
      await execAsync(`${git} config user.name "Salem Entrepreneurs Club"`, execOpts);
    }

    try {
      await execAsync(`${git} config user.email`, execOpts);
    } catch {
      log('Setting default Git committer email...');
      await execAsync(`${git} config user.email "admin@salementrepreneursclub.com"`, execOpts);
    }

    // 5. Configure remote origin safely
    let hasOrigin = false;
    try {
      const { stdout } = await execAsync(`${git} remote -v`, execOpts);
      if (stdout.includes('origin')) {
        hasOrigin = true;
      }
    } catch {
      hasOrigin = false;
    }

    if (hasOrigin) {
      log(`Updating remote origin to: ${remoteUrl}`);
      await execAsync(`${git} remote set-url origin "${remoteUrl}"`, execOpts);
    } else {
      log(`Adding remote origin: ${remoteUrl}`);
      await execAsync(`${git} remote add origin "${remoteUrl}"`, execOpts);
    }

    // 6. Ensure current branch is named correctly
    try {
      await execAsync(`${git} branch -M ${branch}`, execOpts);
      log(`Active branch set to ${branch}`);
    } catch (e: any) {
      log(`Branch set warning: ${e.message}`);
    }

    // 7. Stage all changes
    log('Staging files (git add .)...');
    await execAsync(`${git} add .`, execOpts);
    log('All modified and new files staged.');

    // 8. Commit changes safely
    log(`Committing changes: "${commitMessage}"...`);
    try {
      const safeCommitMsg = commitMessage.replace(/"/g, '\\"');
      const { stdout: commitOut } = await execAsync(`${git} commit -m "${safeCommitMsg}"`, execOpts);
      log(commitOut.trim());
    } catch (commitErr: any) {
      if (commitErr.stdout && commitErr.stdout.includes('nothing to commit')) {
        log('No new changes to commit (working tree clean).');
      } else {
        log(`Commit note: ${commitErr.message || commitErr}`);
      }
    }

    // 9. Push to GitHub
    log(`Pushing to GitHub (${remoteUrl} -> ${branch})...`);
    try {
      const { stdout: pushOut, stderr: pushErr } = await execAsync(
        `${git} push -u origin ${branch}`,
        execOpts
      );
      if (pushOut) log(pushOut.trim());
      if (pushErr) log(pushErr.trim());
      log('Push completed successfully!');

      return NextResponse.json({
        success: true,
        message: 'Project successfully updated and pushed to GitHub!',
        logs,
      });
    } catch (pushErr: any) {
      const errMsg = pushErr.stderr || pushErr.message || String(pushErr);
      log(`Push error: ${errMsg}`);

      return NextResponse.json(
        {
          success: false,
          error: `Git push failed: ${errMsg}`,
          hint: errMsg.includes('Authentication') || errMsg.includes('Permission denied')
            ? 'Authentication failed: If using HTTPS with a private repo or 2FA, please use a Personal Access Token in the URL: https://YOUR_TOKEN@github.com/username/repo.git'
            : 'Check if the repository exists on GitHub and you have write permissions.',
          logs,
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    log(`Unexpected error: ${err.message || String(err)}`);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to execute git push',
        logs,
      },
      { status: 500 }
    );
  }
}
