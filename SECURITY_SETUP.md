# Security Setup Guide

## 🔒 Environment Variables Configuration

This document explains how to properly configure sensitive credentials for this application.

### ⚠️ Important Security Notes

1. **NEVER** commit actual secrets, API keys, or passwords to the repository
2. Always use environment variables for sensitive data
3. Keep your `.env` files in `.gitignore` (already configured)
4. Rotate all exposed credentials immediately if accidentally committed

---

## Server Configuration

### 1. Create `.env` file in `/server` directory

Copy the `sample.env` file and fill in your actual credentials:

```bash
cp server/sample.env server/.env
```

### 2. Required Environment Variables

#### Email Configuration (SMTP)
```env
SMTP_USER=your_actual_email@gmail.com
SMTP_PASS=your_app_specific_password
```

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password at: https://myaccount.google.com/apppasswords
3. Use the generated password for `SMTP_PASS`

#### Security
```env
JWT_SECRET=generate_a_strong_random_32_character_secret_here
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Bunny CDN Configuration
```env
BUNNY_STORAGE_NAME=your_actual_storage_zone_name
BUNNY_API_KEY=your_actual_bunny_api_key
```

Get these from your Bunny CDN dashboard: https://dash.bunny.net/

---

## Client Configuration

### Create `.env` file in `/client` directory

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_STORAGE_KEY=your_local_storage_encryption_key
```

For production, update `client/.env.production` with your production values.

---

## What Was Fixed

### 🚨 Security Issues Addressed:

1. **Hardcoded Bunny CDN API Key** 
   - File: `server/src/services/bunnyUploader.ts`
   - Fixed: Now uses `process.env.BUNNY_API_KEY`

2. **Exposed SMTP Credentials**
   - File: `server/sample.env`
   - Fixed: Replaced with placeholder values

3. **Exposed JWT Secret**
   - File: `server/sample.env`
   - Fixed: Replaced with placeholder and added security guidance

4. **Sample Production Keys**
   - File: `client/.env.production`
   - Fixed: Replaced with generic placeholders

---

## Action Items for Repository Owner

### 🔴 IMMEDIATE ACTIONS REQUIRED:

1. **Rotate All Exposed Credentials:**
   - ✅ Change SMTP password: `egvvmgkpuzubqkit`
   - ✅ Generate new JWT secret (replace: `hbshjahjdjasj`)
   - ✅ Rotate Bunny CDN API key: `33c09703-3218-4a1f-b1a67738850c-a9d3-4714`

2. **Create Local Environment Files:**
   ```bash
   # Server
   cp server/sample.env server/.env
   # Edit server/.env with your NEW credentials
   
   # Client
   cp client/.env.production client/.env.local
   # Edit client/.env.local with your local settings
   ```

3. **Update Production Deployment:**
   - Configure environment variables in your hosting platform
   - Never deploy with hardcoded secrets

---

## Verification

To verify no secrets are exposed:

```bash
# Check for hardcoded secrets
grep -r "password\|secret\|api.*key" --include="*.ts" --include="*.js" server/src/
grep -r "password\|secret\|api.*key" --include="*.ts" --include="*.tsx" client/src/

# Ensure .env files are gitignored
git check-ignore server/.env client/.env
```

---

## Additional Resources

- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_CheatSheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [Best Practices for API Keys](https://cloud.google.com/docs/authentication/api-keys)

---

**Last Updated:** February 2026
**Status:** Security hardening completed ✅
