# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **ai-rd@tsg-navigator.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for a fix.

## Scope

This project is a **demo / educational repository**. It is not intended for production use without additional security hardening.

### What's in scope

- Credential leaking (API keys, secrets in committed files)
- Webhook signature bypass
- SQL injection via Prisma queries
- XSS in rendered templates or email notifications
- CSRF in payment flows

### What's out of scope

- OPay / Stripe / Airwallex platform vulnerabilities (report to the respective provider)
- Denial of service against the local dev server
- Social engineering

## Credential Handling

- **OPay Stage credentials** in `.env.example` are **official public test keys** published by OPay for all developers. They are not secrets. See source references in the file.
- **Stripe and Airwallex credentials** are per-account and must never be committed. `.env` files are gitignored.
- All `.env.example` files contain only placeholders or public test values.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | ✅ Latest          |
| others  | ❌ Not supported   |
