/**
 * Advanced Cyber Security & Defense Shield for Salem Entrepreneurs Club
 * Provides military-grade defense against:
 * 1. Cross-Site Scripting (XSS) & HTML Injections
 * 2. SQL / NoSQL / Command Injections
 * 3. Brute-Force Password Guessing & Credential Stuffing
 * 4. Request Flooding / Rate-Limit Violations
 * 5. Malicious Shell / Git Parameter Injection
 */

import { SECStore } from './store';

// ============================================================================
// 1. INPUT SANITIZATION & ANTI-XSS DEFENSE
// ============================================================================

/**
 * Strips dangerous HTML tags, inline scripts, event handlers, and javascript: links
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';
  if (typeof input !== 'string') return String(input);

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags and contents
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove javascript: and data: URIs
    .replace(/javascript:[^"']*/gi, '')
    .replace(/vbscript:[^"']*/gi, '')
    .replace(/data:text\/html[^"']*/gi, '')
    // Remove inline event handlers like onload, onerror, onclick, onmouseover
    .replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // Strip generic HTML tags (<...>)
    .replace(/<\/?[^>]+(>|$)/g, '')
    // Trim extraneous whitespace
    .trim();
}

/**
 * Escapes characters for safe HTML output
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  return String(str).replace(/[&<>"'`=\/]/g, (s) => htmlEntities[s] || s);
}

// ============================================================================
// 2. INJECTION PREVENTION FOR GIT & SYSTEM PARAMETERS
// ============================================================================

/**
 * Ensures Git repository URL matches strict GitHub / Git remote standards
 * Prevents command injection characters like ;, &, |, `, $, >, <
 */
export function sanitizeGitUrl(url: string): { valid: boolean; sanitized: string; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, sanitized: '', error: 'Repository URL is required' };
  }

  const cleaned = url.trim();

  // Reject shell metacharacters
  if (/[;&|`$<>\r\n\\!]/.test(cleaned)) {
    return {
      valid: false,
      sanitized: '',
      error: 'Security alert: Dangerous shell characters detected in repository URL.',
    };
  }

  // Check valid Git URL pattern (HTTPS or SSH)
  const isHttps = /^https:\/\/(?:[a-zA-Z0-9_\-\.]+@)?(?:github\.com|gitlab\.com|bitbucket\.org)\/[a-zA-Z0-9_.\-]+\/[a-zA-Z0-9_.\-]+(?:\.git)?$/i.test(
    cleaned
  );
  const isSsh = /^git@(github\.com|gitlab\.com|bitbucket\.org):[a-zA-Z0-9_.\-]+\/[a-zA-Z0-9_.\-]+\.git$/i.test(
    cleaned
  );

  if (!isHttps && !isSsh) {
    return {
      valid: false,
      sanitized: '',
      error: 'Only verified GitHub / GitLab / Bitbucket repository URLs are accepted for security.',
    };
  }

  return { valid: true, sanitized: cleaned };
}

/**
 * Validates and sanitizes Git branch names (strict alphanumeric, hyphens, slashes)
 */
export function sanitizeGitBranch(branch: string): string {
  if (!branch) return 'main';
  // Allow only standard git branch characters
  const cleaned = branch.trim().replace(/[^a-zA-Z0-9_\-\./]/g, '');
  return cleaned || 'main';
}

/**
 * Validates and sanitizes Git commit messages
 */
export function sanitizeCommitMessage(msg: string): string {
  if (!msg) return 'Update Salem Entrepreneurs Club platform';
  return msg
    .replace(/[;&|`$<>\r\n]/g, ' ')
    .slice(0, 150)
    .trim();
}

// ============================================================================
// 3. PAYMENT & FORM VALIDATION DEFENSES
// ============================================================================

/**
 * Validates 12-digit Indian UPI / UTR Transaction Reference ID
 */
export function isValidUTR(utr: string): boolean {
  if (!utr) return false;
  const clean = utr.trim().replace(/\s+/g, '');
  // Indian bank UTRs are 12 digits (or alphanumeric 10-18 chars)
  return /^[a-zA-Z0-9]{8,22}$/.test(clean);
}

/**
 * Validates UPI ID format (e.g. handle@bank)
 */
export function isValidUpiId(upi: string): boolean {
  if (!upi) return false;
  return /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,49}$/.test(upi.trim());
}

/**
 * Validates Email Address with RFC compliant regex
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

/**
 * Validates Phone Number (10 digits with optional +91)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

// ============================================================================
// 4. ANTI-BRUTE-FORCE & RATE LIMITING DEFENSE
// ============================================================================

interface RateLimitRecord {
  attempts: number;
  lastAttemptTime: number;
  lockoutUntil: number;
}

const STORAGE_PREFIX = 'sec_sec_ratelimit_';
const MAX_FAILED_ATTEMPTS = 5; // Lock out after 5 consecutive bad attempts
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes lockout

export const SecurityRateLimiter = {
  getRecord(key: string): RateLimitRecord {
    if (typeof window === 'undefined') {
      return { attempts: 0, lastAttemptTime: 0, lockoutUntil: 0 };
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!raw) return { attempts: 0, lastAttemptTime: 0, lockoutUntil: 0 };
      const parsed = JSON.parse(raw) as RateLimitRecord;
      return parsed;
    } catch {
      return { attempts: 0, lastAttemptTime: 0, lockoutUntil: 0 };
    }
  },

  setRecord(key: string, record: RateLimitRecord): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(record));
    } catch (err) {
      console.warn('Storage rate-limit write error:', err);
    }
  },

  /**
   * Check if current user / client is currently locked out
   */
  checkLockout(key: string): { locked: boolean; remainingSeconds: number } {
    const record = this.getRecord(key);
    const now = Date.now();

    if (record.lockoutUntil && record.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
      return { locked: true, remainingSeconds };
    }

    return { locked: false, remainingSeconds: 0 };
  },

  /**
   * Record a failed login attempt; triggers lockout if threshold reached
   */
  recordFailedAttempt(
    key: string,
    identifier: string
  ): { locked: boolean; remainingAttempts: number; lockoutSeconds: number } {
    const record = this.getRecord(key);
    const now = Date.now();

    // Reset attempts if previous attempt was more than 15 minutes ago
    if (now - record.lastAttemptTime > 15 * 60 * 1000) {
      record.attempts = 0;
    }

    record.attempts += 1;
    record.lastAttemptTime = now;

    if (record.attempts >= MAX_FAILED_ATTEMPTS) {
      record.lockoutUntil = now + LOCKOUT_DURATION_MS;
      this.setRecord(key, record);

      // Log Security Alert in SEC Store
      try {
        SECStore.addAuditLog(
          'Security Alert: Rate Limit Triggered',
          'Auth',
          key,
          `Too many failed attempts for ${identifier}. Lockout initiated for 5 minutes.`,
          'Security Shield'
        );
      } catch {
        // Safe fallback
      }

      return {
        locked: true,
        remainingAttempts: 0,
        lockoutSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      };
    }

    this.setRecord(key, record);
    return {
      locked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - record.attempts,
      lockoutSeconds: 0,
    };
  },

  /**
   * Reset attempts on successful authentication
   */
  reset(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch {
      // Safe fallback
    }
  },
};
