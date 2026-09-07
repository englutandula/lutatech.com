# Developer Website Security & Anti-Hacking Master Guide
### *The Production Blueprint for Preventing Breaches, Securing Sensitive Data, and Hardening Web Applications*

> **Audience:** Full-Stack Developers, Backend Engineers, DevOps, and Technical Architects  
> **Applicability:** Universal — Covers Web Application Security (Laravel, Node.js, Next.js, React, PHP, Python) and Server Infrastructure (Linux, LiteSpeed, Nginx, Apache, Cloudflare).  
> **Standard:** Aligned with **OWASP Top 10 (2025/2026)**, CWE Top 25, and CIS Server Benchmarks.

---

## Table of Contents
1. [Core Security Principle: Defense in Depth](#1-core-security-principle-defense-in-depth)
2. [Pillar 1: Protecting Secrets, Credentials & Environment Data](#2-pillar-1-protecting-secrets-credentials--environment-data)
   - [2.1 The Fatal `APP_DEBUG=true` Vulnerability](#21-the-fatal-app_debugtrue-vulnerability)
   - [2.2 Web Server Blocking of Sensitive Files (`.env`, `.git`, `.sql`)](#22-web-server-blocking-of-sensitive-files-env-git-sql)
   - [2.3 Database Credential Isolation & Database Port Lockdown](#23-database-credential-isolation--database-port-lockdown)
3. [Pillar 2: Authentication & Session Security (Preventing Account Takeover)](#3-pillar-2-authentication--session-security-preventing-account-takeover)
   - [3.1 Password Hashing Standards (Argon2id & Bcrypt)](#31-password-hashing-standards-argon2id--bcrypt)
   - [3.2 Rate Limiting & Brute-Force Defense](#32-rate-limiting--brute-force-defense)
   - [3.3 Multi-Factor Authentication (MFA / 2FA) for Admin & Staff](#33-multi-factor-authentication-mfa--2fa-for-admin--staff)
   - [3.4 Session Cookie Hardening (`HttpOnly`, `Secure`, `SameSite`)](#34-session-cookie-hardening-httponly-secure-samesite)
4. [Pillar 3: Access Control & Preventing Broken Object Level Authorization (IDOR)](#4-pillar-3-access-control--preventing-broken-object-level-authorization-idor)
   - [4.1 Understanding IDOR (Insecure Direct Object References)](#41-understanding-idor-insecure-direct-object-references)
   - [4.2 Secure Authorization Patterns (Gates, Policies & Scopes)](#42-secure-authorization-patterns-gates-policies--scopes)
5. [Pillar 4: Input Validation, Injection Defense & Mass Assignment](#5-pillar-4-input-validation-injection-defense--mass-assignment)
   - [5.1 SQL Injection (SQLi) Prevention](#51-sql-injection-sqli-prevention)
   - [5.2 Cross-Site Scripting (XSS) Prevention](#52-cross-site-scripting-xss-prevention)
   - [5.3 Mass Assignment Vulnerability Defense](#53-mass-assignment-vulnerability-defense)
   - [5.4 Command Injection & Shell Execution Defense](#54-command-injection--shell-execution-defense)
6. [Pillar 5: File Upload Security (Preventing Remote Code Execution / Web Shells)](#6-pillar-5-file-upload-security-preventing-remote-code-execution--web-shells)
   - [6.1 The 5 Golden Rules of Secure File Uploads](#61-the-5-golden-rules-of-secure-file-uploads)
   - [6.2 Server-Side Upload Directory Lockdown](#62-server-side-upload-directory-lockdown)
7. [Pillar 6: CSRF, CORS & API Protection](#7-pillar-6-csrf-cors--api-protection)
   - [6.1 Cross-Site Request Forgery (CSRF) Hardening](#61-cross-site-request-forgery-csrf-hardening)
   - [6.2 Strict CORS (Cross-Origin Resource Sharing) Policies](#62-strict-cors-cross-origin-resource-sharing-policies)
   - [6.3 Webhook Signature Verification (Stripe, PayPal, Crypto)](#63-webhook-signature-verification-stripe-paypal-crypto)
8. [Pillar 7: Server, OS & Network Infrastructure Hardening](#8-pillar-7-server-os--network-infrastructure-hardening)
   - [8.1 Linux Firewall (UFW) & Port Clamping](#81-linux-firewall-ufw--port-clamping)
   - [8.2 SSH Hardening (Keys Only, Disable Root)](#82-ssh-hardening-keys-only-disable-root)
   - [8.3 Disabling Directory Browsing & Server Banners](#83-disabling-directory-browsing--server-banners)
   - [8.4 Automated Backups & Disaster Recovery](#84-automated-backups--disaster-recovery)
9. [25-Point Developer Pre-Deployment Security Audit Checklist](#9-25-point-developer-pre-deployment-security-audit-checklist)

---

## 1. Core Security Principle: Defense in Depth

Never rely on a single layer of security. If an attacker bypasses the frontend validation, the backend must stop them. If an attacker bypasses the backend, the database permissions must stop them. If an attacker exploits the web server, the operating system user permissions must prevent access to the rest of the server.

```
                         THE DEFENSE-IN-DEPTH SHIELD
     ┌──────────────────────────────────────────────────────────────┐
     │ 1. Edge Layer: Cloudflare WAF, DDoS mitigation, Bot filter   │
     ├──────────────────────────────────────────────────────────────┤
     │ 2. Web Server: Nginx/LiteSpeed headers, file access blocks   │
     ├──────────────────────────────────────────────────────────────┤
     │ 3. App Layer: Strict routing, CSRF, Session hardening, Auth  │
     ├──────────────────────────────────────────────────────────────┤
     │ 4. Code Layer: Parameterized SQL, Input validation, Escaping │
     ├──────────────────────────────────────────────────────────────┤
     │ 5. Data Layer: Encryption at rest, Column masking, Least priv│
     └──────────────────────────────────────────────────────────────┘
```

---

## 2. Pillar 1: Protecting Secrets, Credentials & Environment Data

The fastest way websites get hacked is not through complex zero-day exploits; it is through **exposed environment files, debug stack traces, and hardcoded credentials**.

### 2.1 The Fatal `APP_DEBUG=true` Vulnerability
- **The Threat:** When an unhandled exception occurs with `APP_DEBUG=true` enabled in production, the framework dumps an interactive debug page (e.g., Laravel Ignition, Django Debug, Express error).
- **The Catastrophe:** This debug page displays the entire contents of your `.env` file in plain text, exposing your:
  - Database password and host
  - Application encryption key (`APP_KEY`)
  - AWS / S3 access keys
  - Stripe secret API keys
  - SMTP mail passwords
- **The Mandatory Production Setting:**
  ```env
  APP_ENV=production
  APP_DEBUG=false
  ```
  *Always verify this on your live server. In production, users should only see a generic 500 error page, while full stack traces are written to private server logs (`storage/logs/laravel.log`).*

### 2.2 Web Server Blocking of Sensitive Files (`.env`, `.git`, `.sql`)
Automated vulnerability bots scan millions of websites daily requesting:
- `https://example.com/.env`
- `https://example.com/.git/HEAD`
- `https://example.com/backup.sql`
- `https://example.com/dump.sql`
- `https://example.com/composer.json`

If your web server document root is improperly mapped, these files can be downloaded directly.

#### Apache / LiteSpeed (`public/.htaccess`):
```apache
# 1. Block access to hidden dot-files (.env, .git, .aws, .ssh)
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

# 2. Block access to sensitive packages, database dumps, logs, and configs
<FilesMatch "(composer\.(json|lock)|package\.(json|lock)|\.sql|\.sqlite|\.log|\.bak|\.conf|\.env)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

#### Nginx (`nginx.conf`):
```nginx
# Deny all hidden files except .well-known (required for SSL renewal)
location ~ /\.(?!well-known).* {
    deny all;
    access_log off;
    log_not_found off;
}

# Deny sensitive project files
location ~* (composer\.(json|lock)|package\.(json|lock)|\.sql|\.sqlite|\.log|\.env|\.bak)$ {
    deny all;
    access_log off;
    log_not_found off;
}
```

### 2.3 Database Credential Isolation & Database Port Lockdown
1. **Never Expose Port 3306 (MySQL) or 5432 (PostgreSQL) to the Public Internet:**
   - Your database should listen on `127.0.0.1` (localhost) or an isolated internal private VPC network.
   - External connections should only occur via an encrypted SSH tunnel.
2. **Principle of Least Privilege for Database Users:**
   - Your application's database user should **only** have `SELECT`, `INSERT`, `UPDATE`, `DELETE` permissions on that specific database.
   - Never use `root` or `postgres` superusers for application database connections.
   - The application database user must **never** have permissions to `GRANT`, `DROP DATABASE`, or access the `mysql` system tables.

---

## 3. Pillar 2: Authentication & Session Security (Preventing Account Takeover)

### 3.1 Password Hashing Standards (Argon2id & Bcrypt)
- **Never store plain text passwords or use legacy hashes (MD5, SHA1, SHA256).**
- **Approved Hashing Algorithms:**
  - **Argon2id:** Winner of the Password Hashing Competition; resistant to GPU and ASIC brute-force attacks.
  - **Bcrypt:** Minimum cost/work factor of **12** (10 is legacy).
- **Laravel Configuration (`config/hashing.php`):**
  ```php
  'driver' => 'bcrypt',
  'bcrypt' => [
      'rounds' => env('BCRYPT_ROUNDS', 12),
  ],
  ```

### 3.2 Rate Limiting & Brute-Force Defense
Attackers use automated password dictionary lists to execute brute-force attacks against `/login` and password reset forms.

- **Enforce Throttle Middleware on all Auth Endpoints:**
  ```php
  // Laravel Route Rate Limiting
  Route::post('/login', [AuthController::class, 'login'])
      ->middleware('throttle:5,1'); // Max 5 attempts per minute per IP
  
  Route::post('/forgot-password', [AuthController::class, 'sendResetLink'])
      ->middleware('throttle:3,1'); // Max 3 requests per minute per IP
  ```
- **Progressive Delay & Lockout:** If an IP or email fails 5 consecutive times, lock the account for 15 minutes and send a security notification to the user's email.

### 3.3 Multi-Factor Authentication (MFA / 2FA) for Admin & Staff
All staff, admin, and high-privilege accounts must enforce Time-based One-Time Passwords (TOTP) using authenticator apps (Google Authenticator, Authy, 1Password):
- Never rely solely on SMS 2FA (vulnerable to SIM-swapping attacks).
- Require 2FA verification before permitting sensitive actions (changing passwords, viewing customer billing data, issuing refunds, exporting user data).

### 3.4 Session Cookie Hardening (`HttpOnly`, `Secure`, `SameSite`)
Session hijacking occurs when an attacker steals a user's session cookie and impersonates them.

#### Configure Your Session Cookies (`config/session.php` or `php.ini`):
```php
// config/session.php
'secure' => env('SESSION_SECURE_COOKIE', true), // Transmit ONLY over HTTPS
'http_only' => true,                             // Inaccessible to JavaScript (stops XSS cookie theft)
'same_site' => 'lax',                            // Defends against Cross-Site Request Forgery
'lifetime' => 120,                               // Session expires after 120 minutes of inactivity
'expire_on_close' => true,                       // Closes session when user closes browser
```

#### Session Regeneration on Login:
Always regenerate the session ID upon authentication to eliminate **Session Fixation attacks**:
```php
// In Login Controller
if (Auth::attempt($credentials)) {
    $request->session()->regenerate(); // Generates brand new session token
    return redirect()->intended('/dashboard');
}
```

---

## 4. Pillar 3: Access Control & Preventing Broken Object Level Authorization (IDOR)

### 4.1 Understanding IDOR (Insecure Direct Object References)
**IDOR is one of the most common critical vulnerabilities on the web.** It occurs when an application exposes a direct database ID in a request, but fails to check whether the logged-in user actually owns that resource.

#### The Vulnerability (BAD CODE):
```php
// Vulnerable Controller:
public function downloadInvoice($id) {
    // Attackers simply change $id=101 to $id=102, $id=103 to steal other users' invoices!
    $invoice = Invoice::findOrFail($id);
    return response()->download($invoice->pdf_path);
}
```

### 4.2 Secure Authorization Patterns (Gates, Policies & Scopes)
Never query directly by primary key without scoping to the authenticated user:

#### The Solution (SECURE CODE):

**Method A: Relationship Scoping (Automatic Ownership):**
```php
public function downloadInvoice($id) {
    // Queries ONLY invoices belonging to the currently authenticated user
    $invoice = auth()->user()->invoices()->findOrFail($id);
    return response()->download($invoice->pdf_path);
}
```

**Method B: Authorization Policies (Laravel Gate/Policy):**
```php
public function show(Order $order) {
    // Calls OrderPolicy::view(User $user, Order $order)
    $this->authorize('view', $order); 
    
    return view('orders.show', compact('order'));
}
```

**Inside `OrderPolicy.php`:**
```php
public function view(User $user, Order $order): bool
{
    return $user->id === $order->user_id || $user->is_admin;
}
```

---

## 5. Pillar 4: Input Validation, Injection Defense & Mass Assignment

### 5.1 SQL Injection (SQLi) Prevention
SQL injection occurs when unvalidated user input is directly concatenated into a raw database query.

#### Lethal Vulnerability (NEVER DO THIS):
```php
// NEVER concatenate input into raw SQL!
$users = DB::select("SELECT * FROM users WHERE email = '" . $request->input('email') . "'");
// Attacker input: admin@example.com' OR '1'='1
```

#### Secure Standard: Parameterized Queries & ORM:
```php
// 1. Eloquent ORM (Automatically Parameterized)
$users = User::where('email', $request->input('email'))->first();

// 2. Raw Query with Bindings
$users = DB::select("SELECT * FROM users WHERE email = :email", [
    'email' => $request->input('email')
]);
```

### 5.2 Cross-Site Scripting (XSS) Prevention
XSS occurs when malicious JavaScript is injected into your database and executed in other users' browsers (stealing cookies, session tokens, or modifying page content).

1. **Automatic Context Escaping:**
   - In Blade templates, always use `{{ $userInput }}` (which runs `htmlspecialchars()` automatically).
   - Never use `{!! $userInput !!}` for user-supplied data unless it is sanitized through a dedicated HTML purifier.
2. **React / Next.js / Vue:**
   - React JSX escapes strings automatically by default.
   - **Never use `dangerouslySetInnerHTML`** or `v-html` with user-supplied strings without running it through **DOMPurify**:
     ```javascript
     import DOMPurify from 'dompurify';
     <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userBio) }} />
     ```

### 5.3 Mass Assignment Vulnerability Defense
Mass Assignment occurs when an attacker passes unauthorized fields in an HTTP POST request (e.g., adding `is_admin=1` or `balance=99999` to a profile update form).

#### Lethal Vulnerability:
```php
// Dangerous Model configuration:
class User extends Model {
    protected $guarded = []; // Allows ANY field in the HTTP request to be saved to DB!
}

// Dangerous Controller:
User::create($request->all()); // Attacker sends {"name": "Bob", "is_admin": true}
```

#### Secure Standard:
1. Explicitly declare `$fillable` fields in all models:
   ```php
   class User extends Model {
       protected $fillable = ['name', 'email', 'avatar']; // is_admin is excluded
   }
   ```
2. Validate using typed Form Requests:
   ```php
   $validated = $request->validated();
   $user->update($validated);
   ```

### 5.4 Command Injection & Shell Execution Defense
- **Never pass unsanitized user input into server execution commands** (`exec()`, `system()`, `shell_exec()`, `passthru()`, `proc_open()`).
- If executing shell binaries is required, use `escapeshellarg()` and `escapeshellcmd()`, or use framework-native wrappers like Symfony `Process`:
  ```php
  use Symfony\Component\Process\Process;
  
  // Safe execution with discrete arguments (no shell interpolation):
  $process = new Process(['convert', $inputPath, '-resize', '800x600', $outputPath]);
  $process->run();
  ```

---

## 6. Pillar 5: File Upload Security (Preventing Remote Code Execution / Web Shells)

File upload forms are the **#1 vector for Remote Code Execution (RCE)**. If an attacker can upload a `.php`, `.phtml`, `.py`, or `.sh` script and trigger its execution via the web server, they gain full shell control of your server.

### 6.1 The 5 Golden Rules of Secure File Uploads

#### Rule 1: Validate File Extensions via Strict Whitelist
Never use blacklists. Whitelist only explicitly needed extensions:
```php
$request->validate([
    'avatar' => 'required|file|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max
]);
```

#### Rule 2: Validate Server-Side MIME Types (Magic Bytes)
Do not trust the client's `Content-Type` header (attackers easily spoof it). Validate the file's binary signature:
```php
$mime = mime_content_type($uploadedFile->getRealPath());
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

if (!in_array($mime, $allowedMimes, true)) {
    throw new \Exception('Invalid file binary signature.');
}
```

#### Rule 3: Re-encode / Strip EXIF Data from Images
Malicious PHP code can be embedded inside the EXIF metadata of a valid JPEG.
- Pass uploaded images through an image processing library (e.g., Intervention Image, sharp, or Imagick) to re-render the pixels and strip all metadata before saving.

#### Rule 4: Rename All Uploaded Files to Random Hashes
Never use the original filename (prevents Directory Traversal attacks like `../../var/www/shell.php`):
```php
$safeFilename = Str::uuid() . '.' . $uploadedFile->getClientOriginalExtension();
$path = $uploadedFile->storeAs('avatars', $safeFilename, 'public');
```

#### Rule 5: Store Files Outside the Public Web Root (or Private Cloud Storage)
Store sensitive uploads (PDF contracts, invoices, identity documents) in private cloud buckets (AWS S3, Cloudflare R2) with private ACLs, serving them only via authenticated, temporary signed URLs.

### 6.2 Server-Side Upload Directory Lockdown
Even if a malicious file is somehow uploaded into a public directory, **the web server must be strictly forbidden from executing it.**

#### Apache / LiteSpeed (Place `.htaccess` inside `/public/storage/` and `/storage/app/public/`):
```apache
# 1. Disable all script interpreters in this directory
RemoveHandler .php .phtml .php3 .php4 .php5 .php7 .php8 .phps .cgi .pl .asp .aspx .shtml
RemoveType .php .phtml .php3 .php4 .php5 .php7 .php8 .phps .cgi .pl .asp .aspx .shtml
php_flag engine off

# 2. Deny access to any executable file types
<FilesMatch "\.(php|php[0-9]|phtml|pl|py|jsp|asp|htm|shtml|sh|cgi|bash)$">
    Order Deny,Allow
    Deny from all
</FilesMatch>
```

#### Nginx (`nginx.conf`):
```nginx
# Block execution of any script inside upload directories
location ~* ^/(storage|uploads)/.*\.(php|phtml|sh|py|cgi)$ {
    deny all;
    access_log off;
    log_not_found off;
}
```

---

## 7. Pillar 6: CSRF, CORS & API Protection

### 7.1 Cross-Site Request Forgery (CSRF) Hardening
CSRF occurs when a malicious site tricks an authenticated user's browser into executing an unauthorized state-changing request (e.g., transferring funds or changing an email address).

- **Blade Templates:** Always include `@csrf` inside every HTML `<form>`:
  ```html
  <form method="POST" action="/profile/email">
      @csrf
      <input type="email" name="email">
      <button type="submit">Update</button>
  </form>
  ```
- **SPA / Inertia / React / Vue:** Verify that the frontend passes the `X-XSRF-TOKEN` header on every state-changing request (automatically handled by Axios / Inertia via cookies).

### 7.2 Strict CORS (Cross-Origin Resource Sharing) Policies
Never use wildcard CORS (`Access-Control-Allow-Origin: *`) on endpoints that handle authentication or user data.

#### Secure CORS Configuration (`config/cors.php`):
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
    'allowed_origins' => [
        'https://lutamarkets.com',
        'https://app.lutamarkets.com', // Strict whitelist only
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Content-Type', 'X-Requested-With', 'Authorization', 'X-XSRF-TOKEN'],
    'exposed_headers' => [],
    'max_age' => 86400,
    'supports_credentials' => true, // Allows cookies
];
```

### 7.3 Webhook Signature Verification (Stripe, PayPal, Telegram)
When receiving payment or external data webhooks, **never trust incoming POST payloads without verifying the cryptographic signature**. Attackers forge fake payment webhook events to activate accounts for free.

```php
// Secure Stripe Webhook Example
public function handleWebhook(Request $request)
{
    $payload = $request->getContent();
    $sigHeader = $request->header('Stripe-Signature');
    $endpointSecret = config('services.stripe.webhook_secret');

    try {
        $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
    } catch (\UnexpectedValueException $e) {
        // Invalid payload
        return response('Invalid payload', 400);
    } catch (\Stripe\Exception\SignatureVerificationException $e) {
        // Invalid signature (FORGED REQUEST DETECTED!)
        return response('Invalid signature', 400);
    }

    // Process event safely...
    return response('Success', 200);
}
```

---

## 8. Pillar 7: Server, OS & Network Infrastructure Hardening

A secure application running on an insecure server will still be breached. Apply these infrastructure standards on all Linux production hosts.

### 8.1 Linux Firewall (UFW) & Port Clamping
Expose **only** the minimum required ports to the public internet:

```bash
# 1. Default deny all incoming traffic
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Allow SSH (prefer custom port e.g. 2222)
sudo ufw allow 22/tcp

# 3. Allow Web Traffic (HTTP and HTTPS)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 4. Enable firewall
sudo ufw enable
```
*Port 3306 (MySQL), Port 5432 (PostgreSQL), and Port 6379 (Redis) must NEVER be opened in UFW.*

### 8.2 SSH Hardening (Keys Only, Disable Root)
Edit `/etc/ssh/sshd_config` on your production server:

```ini
# 1. Disable Root Login
PermitRootLogin no

# 2. Disable Password Authentication (Enforce SSH Keys Only)
PasswordAuthentication no
PubkeyAuthentication yes

# 3. Maximum Authentication Attempts
MaxAuthTries 3

# 4. Disable Empty Passwords
PermitEmptyPasswords no
```
Restart SSH after testing: `sudo systemctl restart sshd`.

### 8.3 Disabling Directory Browsing & Server Banners
Attackers use server response banners to identify specific software versions with known CVE exploits.

#### 1. Turn Off Server Tokens:
- **Apache / LiteSpeed (`httpd.conf` / `.htaccess`):**
  ```apache
  ServerSignature Off
  ServerTokens Prod
  Options -Indexes
  ```
- **Nginx (`nginx.conf`):**
  ```nginx
  server_tokens off;
  autoindex off;
  ```
- **PHP (`php.ini`):**
  ```ini
  expose_php = Off
  ```

### 8.4 Automated Backups & Disaster Recovery
- **The 3-2-1 Backup Strategy:** 3 copies of data, across 2 different media types, with 1 copy stored in an entirely different cloud provider / offsite location.
- **Automated Database Dumps:** Schedule encrypted database backups daily (`mysqldump` piped to GPG encryption and uploaded to an isolated AWS S3 / Cloudflare R2 bucket with object locking / immutability enabled).
- **Test Restores Quarterly:** A backup that has never been restored is not a verified backup.

---

## 9. 25-Point Developer Pre-Deployment Security Audit Checklist

Before releasing any web application to production, run through this verification checklist:

### Secrets & Environment:
- [ ] `APP_DEBUG=false` in production `.env`.
- [ ] `.env`, `.git`, `.sql`, and `.log` files return HTTP 403 Forbidden or 404 when requested via browser.
- [ ] No hardcoded passwords, private keys, or API tokens committed in Git history.
- [ ] Database is bound to `127.0.0.1` and not accessible from the public internet.

### Authentication & Sessions:
- [ ] Passwords hashed using Argon2id or Bcrypt (rounds ≥ 12).
- [ ] Auth endpoints (`/login`, `/register`, `/forgot-password`) have rate-limiting throttles active.
- [ ] Admin dashboard requires Multi-Factor Authentication (2FA).
- [ ] Session cookies configured with `Secure`, `HttpOnly`, and `SameSite=Lax`.
- [ ] Session IDs regenerate immediately upon login and logout.

### Authorization & Data Access:
- [ ] All database queries accessing user-specific records check ownership (`auth()->user()->id === $record->user_id`).
- [ ] Admin routes are strictly protected by middleware role checks.
- [ ] All redirect URLs are validated against a strict domain whitelist (no Open Redirects).

### Input Validation & Injections:
- [ ] All database queries use Eloquent ORM or parameterized prepared statements (zero raw SQL string concatenation).
- [ ] All HTML outputs escape user input (`{{ }}`); no raw `{!! !!}` or `dangerouslySetInnerHTML` on unpurified data.
- [ ] All Eloquent models have explicit `$fillable` definitions (no unguarded `$guarded = []`).
- [ ] No user inputs passed directly into shell commands (`exec`, `system`).

### Upload Security:
- [ ] File uploads validate extensions against a strict whitelist.
- [ ] File uploads validate binary MIME types (magic bytes).
- [ ] Uploaded files are renamed to random UUIDs/hashes upon storage.
- [ ] Execution of `.php`, `.phtml`, and script files is disabled in public upload directories via `.htaccess` / Nginx.

### Headers & Transport:
- [ ] HTTPS enforced across 100% of routes with 301 redirects.
- [ ] `HSTS` header enabled (`Strict-Transport-Security`).
- [ ] `X-Content-Type-Options: nosniff` header active.
- [ ] `X-Frame-Options: SAMEORIGIN` header active.
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` active.
- [ ] All incoming payment/third-party webhooks cryptographically verify signatures.

---

*This guide serves as the definitive application security baseline for engineering teams building resilient, breach-proof web platforms.*
