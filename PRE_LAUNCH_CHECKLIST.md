# Pre-Launch Full Stack Checklist

This is an expanded and actionable checklist for deploying your Next.js Frontend and Laravel Backend architecture. Go through each item before officially announcing the website.

---

## 1. Frontend (Next.js)

- [ ] **Responsive UI:** Test layouts on mobile, tablet, and desktop sizes.
- [ ] **Cross-Browser Testing:** Test core features in Chrome, Safari, Firefox, and Edge.
- [ ] **Image Optimization:** Ensure `next/image` is used for all static and dynamic images to serve WebP/AVIF formats automatically.
- [ ] **Accessibility (a11y):** Ensure proper contrast, `aria-labels` on icon buttons, and logical keyboard navigation (tabbing).
- [ ] **Performance:** Run a Lighthouse audit. Aim for 90+ on Performance, Accessibility, Best Practices, and SEO.
- [ ] **Error Pages:** Ensure custom `404` (Not Found) and `500` (Server Error) pages are designed and working.
- [ ] **Cleanup:** Remove debug code, `console.log()` statements, and unused components.
- [ ] **Environment Variables:** Ensure all production API endpoints (`NEXT_PUBLIC_API_URL`) point to the live server.

## 2. Backend (Laravel)

- [ ] **Production Environment:** Ensure `.env` has `APP_ENV=production`.
- [ ] **Debug Mode Disabled:** Ensure `.env` has `APP_DEBUG=false` (Critical for security).
- [ ] **Optimization Caching:** Run `php artisan config:cache`, `php artisan route:cache`, and `php artisan view:cache`.
- [ ] **CORS Configuration:** Ensure `config/cors.php` restricts API access strictly to your Next.js frontend domain.
- [ ] **Validation:** Ensure all incoming requests are validated using FormRequests.
- [ ] **Rate Limiting:** Ensure API routes have throttling applied (e.g., `throttle:api`) to prevent brute force.
- [ ] **Error Tracking:** Set up an error tracking service (like Sentry, Bugsnag, or Flare) to catch backend exceptions silently.

## 3. Database (MySQL)

- [ ] **Migrations:** Ensure all production migrations have been run successfully (`php artisan migrate --force`).
- [ ] **Indexes:** Verify that frequently queried columns and foreign keys are indexed for performance.
- [ ] **Automated Backups:** Set up daily automated database backups (e.g., using `spatie/laravel-backup`).
- [ ] **Restore Testing:** **Crucial:** Download a backup and successfully restore it locally to prove the backup works.
- [ ] **Seeding:** Ensure any necessary production seeders (roles, default admin, settings) have been run.

## 4. Authentication Flow

- [ ] **Registration:** Test standard email/password signup flow.
- [ ] **Email Verification:** Ensure "Must Verify Email" flow works and prevents access to protected routes until verified.
- [ ] **Login / Logout:** Test session creation and destruction.
- [ ] **Forgot Password:** Ensure password reset emails send and the reset token works correctly.
- [ ] **Social Login (OAuth):** If using Google/GitHub login, ensure production callback URIs are set in their respective developer consoles.
- [ ] **Session Security:** Ensure tokens (Sanctum/Passport) or Cookies are configured as HTTPOnly and Secure in production.

## 5. Email Delivery

- [ ] **SMTP Configuration:** Ensure production SMTP credentials (e.g., Mailgun, SendGrid, Postmark) are active in `.env`.
- [ ] **Queue Emails:** Ensure emails are being sent via queues (e.g., `ShouldQueue`) so they don't slow down the user experience.
- [ ] **SPF, DKIM, DMARC:** Configure these DNS records for your sending domain to prevent emails from going to spam.
- [ ] **Deliverability Test:** Send a test email to tools like `mail-tester.com` to check your spam score.

## 6. Server Infrastructure

- [ ] **SSL/HTTPS:** Ensure the SSL certificate is fully active and HTTP redirects to HTTPS.
- [ ] **Cron Jobs:** Set up the Laravel scheduler entry in your server's crontab (`* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1`).
- [ ] **Queue Workers:** Configure Supervisor or Laravel Horizon to keep queue workers running (`php artisan queue:work`).
- [ ] **File Permissions:** Ensure the `storage` and `bootstrap/cache` directories are writable by the web server.

## 7. SEO & Analytics

- [ ] **Dynamic Sitemap:** Generate and test `sitemap.xml`.
- [ ] **robots.txt:** Ensure `robots.txt` allows indexing (remove any `Disallow: /` used during staging).
- [ ] **Meta & Open Graph Tags:** Test social previews (title, description, image) for Twitter, Facebook, and iMessage.
- [ ] **Google Search Console:** Submit your live sitemap to Google Search Console.
- [ ] **Analytics:** Implement Vercel Analytics, Google Analytics, or Plausible on the frontend.

## 8. Maintenance & Security Updates

- [ ] **Dependency Audit:** Run `npm audit` (frontend) and `composer audit` (backend) to check for known vulnerabilities.
- [ ] **Uptime Monitoring:** Set up a free service like UptimeRobot to ping your site every 5 minutes and alert you if it goes down.
- [ ] **Security Headers:** Implement strict Content Security Policies (CSP) and HTTP headers.

---

## 🏁 The Final Step: The "Three Person" Test

Before making the official announcement, test the entire flow by acting as three different user types.

### 1. The Visitor (Guest)

- [ ] Can browse the landing page, about, and public content.
- [ ] Trying to access a protected route (like `/dashboard`) redirects them to the login page.
- [ ] Contact forms submit correctly.
- [ ] Pages load fast.

### 2. The Registered User

- [ ] Can register an account and verify their email.
- [ ] Can log in successfully.
- [ ] Can use the core features of the application.
- [ ] Can update their profile settings and change their password.
- [ ] Can log out successfully.

### 3. The Administrator

- [ ] Cannot be accessed by standard users (test bypassing the admin gate).
- [ ] Can log into the admin panel securely.
- [ ] Can view analytics, manage users, and moderate content.
- [ ] Can trigger any manual system jobs if applicable.
