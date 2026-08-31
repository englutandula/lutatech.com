# 🛡️ Web Application Security Audit & Hardening Standards (OWASP Compliance)

A comprehensive security audit report and production hardening guide for **Luta Tech (Next.js + FastAPI + MySQL)**.

---

## 🔍 Summary of Security Hardening Applied to This Codebase

| Area | Threat / Vulnerability Vector | Hardening Applied in Codebase |
| :--- | :--- | :--- |
| **Authentication** | JWT Signature Bypass / Token Forgery | **Eliminated unverified JWT decoding fallback**. All tokens must now pass cryptographic signature checks (FastAPI HS256 key or Google Firebase public keys). |
| **File Processing** | Decompression Bombs / Memory Exhaustion DoS | Added `Image.MAX_IMAGE_PIXELS = 50_000_000` in Pillow to reject malicious gigapixel images before loading into RAM. |
| **File Uploads** | Malicious File Uploads / Buffer Overflows | Added strict `MAX_FILE_SIZE = 25MB` and binary image verification (`Image.open().verify()`) across all endpoints. |
| **Data Access** | IDOR (Insecure Direct Object References) | Job retrieval and deletions strictly scoped to `user_id == current_user.id`. |
| **SQL Injection** | SQL Query Tampering | All database interactions use parameterized SQLAlchemy ORM models with zero raw string interpolation. |
| **Clickjacking** | UI Redressing / Iframe Hijacking | Added `X-Frame-Options: SAMEORIGIN` middleware. |
| **MIME Sniffing** | Malicious Content Execution | Added `X-Content-Type-Options: nosniff` header. |
| **CORS Policy** | Unauthorized Cross-Origin API Scraping | Replaced wildcard CORS with strict origin validation supporting `https://lutatech.com`. |
| **XSS** | Cross-Site Scripting | Client-side React 19 JSX auto-escapes all strings; zero `eval()` calls. |

---

## 📋 The 10 Security Standards for Production (OWASP Top 10)

### 1. Cryptographic Authentication & Token Safety (A01: Broken Access Control)
* [x] **Enforce Cryptographic Signatures**: Never decode JWTs with `verify_signature=False`.
* [x] **Random 256-bit Secret Key**: Use a cryptographically random secret in production (`openssl rand -hex 32`).
* [x] **Token Expiration**: Set reasonable expiration windows (e.g. 7 days with refresh flow).
* [x] **Password Hashing**: Use salted `bcrypt` with minimum work factor 12.

### 2. HTTP Defense-in-Depth Headers
Every response should include:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 3. File Upload Safety (A04: Insecure Design & DoS Protection)
* [x] **Enforce Max File Size**: Reject files over 25MB immediately before buffering to disk.
* [x] **Decompression Bomb Protection**: Limit maximum decompressed pixel dimensions.
* [x] **Sanitize File Extensions & Names**: Never use user-supplied file names directly in filesystem paths (prevents Path Traversal `../../etc/passwd`).

### 4. Cross-Origin Resource Sharing (CORS)
* [x] Whitelist explicit domains (`https://lutatech.com`, `https://www.lutatech.com`).
* [x] Never combine `allow_origins=["*"]` with `allow_credentials=True`.

### 5. Server & Deployment Level Hardening (Nginx / CloudFront / AWS)
* **Force HTTPS / TLS 1.3**: Redirect all HTTP traffic to HTTPS (`301 Moved Permanently`).
* **Rate Limiting**: Limit API requests to 60 req/min per IP to prevent brute-force attacks on `/api/auth/login`.
* **Firewall / WAF**: Use AWS WAF or Cloudflare to block automated botnets and layer 7 DDoS.
* **Keep Dependencies Patched**: Regularly run `npm audit` and `pip list --outdated`.

---

## 🛠️ Security Verification Commands

Run these commands to verify your security posture before launching:

```bash
# 1. Check Python backend dependencies for known vulnerabilities
pip install safety
safety check

# 2. Check Node.js dependencies for known vulnerabilities
cd frontend
npm audit

# 3. Generate a strong 32-byte production JWT secret
openssl rand -hex 32
```
