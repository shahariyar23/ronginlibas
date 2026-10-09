# Vercel-এ API deploy করার নির্দেশনা

এই NestJS API-টির entry point `src/main.ts` এবং build script `package.json`-এ আছে। Vercel NestJS-কে serverless Function হিসেবে deploy করে, তাই এখানে আলাদা `vercel.json`, rewrite rule, বা custom serverless adapter দরকার নেই। Vercel-এর Project Settings-এ `server`-কে Root Directory হিসেবে নির্বাচন করুন। Backend-এ NestJS 11 ব্যবহার করা হয়েছে, যাতে CommonJS `@nestjs/throttler` ও Nest-এর module format সামঞ্জস্যপূর্ণ থাকে।

## ১. আগে যা প্রস্তুত করবেন

- GitHub/GitLab/Bitbucket-এ এই repository push করুন।
- Vercel-এ deploy করা যায় এমন একটি PostgreSQL database প্রস্তুত রাখুন। Database-টি Vercel Function থেকে network-accessible হতে হবে। Database provider-এর serverless/pooled connection URL থাকলে runtime-এর জন্য সেটি ব্যবহার করুন।
- Production-এর জন্য দুটি আলাদা, শক্তিশালী JWT secret তৈরি করুন। উদাহরণ:

  ```bash
  openssl rand -base64 48
  openssl rand -base64 48
  ```

  প্রতিটি secret কমপক্ষে 32 অক্ষরের হতে হবে। Access এবং refresh secret একে অন্যের থেকে আলাদা রাখুন।

## ২. Git repository-র সঙ্গে Vercel Project যুক্ত করুন

1. Vercel Dashboard-এ **Add New → Project** নির্বাচন করুন এবং আপনার GitHub/GitLab/Bitbucket account সংযুক্ত করুন।
2. এই repository-টি import করুন। `web` বা `admin` frontend project নয়—backend deploy করার জন্য একই repository-তে থাকা `server` folder ব্যবহার হবে।
3. **Root Directory**-তে `server` নির্বাচন করুন।
4. Vercel NestJS framework স্বয়ংক্রিয়ভাবে চিনতে পারলে সেটি নির্বাচন করা থাকবে। **Build Command**, **Install Command**, এবং **Output Directory** override করবেন না; Vercel-কে `package.json` ও `src/main.ts` থেকে সেটিং নির্ধারণ করতে দিন।
5. **Production Branch** হিসেবে আপনার live site-এর branch (সাধারণত `main`) রাখুন। এই branch-এ push করলে Production deployment হবে; অন্য branch বা pull request-এ Preview deployment হবে।
6. Node.js version হিসেবে **24.x** নির্বাচন করুন। `server/package.json`-এর `engines.node`-ও Vercel deployment-কে Node.js 24-এ চালাতে সেট করা আছে; Project Settings-এ ভিন্ন version থাকলেও package-এর এই setting সেটিকে override করবে।
7. Project তৈরি করার আগে পরের ধাপের Production environment variables যোগ করুন।

## ৩. Environment variables সেট করুন

Project → **Settings → Environment Variables**-এ নিচের মানগুলো **Production** environment-এর জন্য যোগ করুন:

| নাম | কী দিতে হবে |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | PostgreSQL provider-এর runtime connection URL; pooled/serverless URL থাকলে সেটি |
| `JWT_ACCESS_SECRET` | উপরে তৈরি প্রথম গোপন secret |
| `JWT_REFRESH_SECRET` | উপরে তৈরি দ্বিতীয় গোপন secret |
| `WEB_FRONTEND_URL` | Storefront-এর সম্পূর্ণ origin, যেমন `https://ronginlibas.com` |
| `ADMIN_FRONTEND_URL` | Admin frontend-এর সম্পূর্ণ origin, যেমন `https://admin.example.com` |

Origin-এ শেষে `/` দেবেন না। Frontend-এর আসল deployed domain ব্যবহার করুন; placeholder domain কপি করবেন না। API-এর CORS allowlist এই দুই environment variable এবং production-এ `https://ronginlibas.com`/`https://www.ronginlibas.com` থেকে তৈরি হয়।

প্রয়োজন অনুসারে আরও যোগ করুন:

- Product image upload-এর জন্য `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`।
- Password-reset email পাঠাতে `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`; TLS ব্যবহারের নিয়ম অনুযায়ী `SMTP_SECURE`।
- `JWT_ACCESS_EXPIRES_IN` ও `JWT_REFRESH_EXPIRES_IN`-এর default যথাক্রমে `15m` ও `7d`। পরিবর্তন দরকার না হলে যোগ করার প্রয়োজন নেই।

`PORT` সাধারণত Vercel নিজে পরিচালনা করে—এটি Vercel-এ নির্দিষ্ট করে দেবেন না। Payment provider-এর environment variable যোগ করলেই payment চালু হবে না; এই repository-তে provider adapter এখনো সংযুক্ত নয়।

**Preview environment:** Preview deployment-এ production database ব্যবহার করবেন না। আলাদা staging database ও আলাদা JWT secret ব্যবহার করুন। Preview frontend থেকে API কল করলে `WEB_FRONTEND_URL`/`ADMIN_FRONTEND_URL`-এ সেই frontend-এর origin দিন; preview domain বদলালে CORS-এর এই মানও বদলাতে হবে। Vercel-এ environment variable যোগ বা বদলালে পরের deployment-এ নতুন মান প্রয়োগ হবে।

## ৪. প্রথম production deployment-এর আগে database migration

বিদ্যমান database হলে আগে backup নিন। Production database-এর migration Vercel-এর build-এর মধ্যে চালাবেন না; build/preview চলার সময় production schema পরিবর্তন হওয়া উচিত নয়।

স্থানীয় terminal-এ Vercel CLI ইনস্টল ও project link করুন:

```bash
npm install --global vercel
cd server
vercel link
```

সঠিক Vercel account/team ও project নির্বাচন করুন। তারপর repository-র সর্বশেষ migration production database-এ প্রয়োগ করুন:

```bash
vercel env run -e production -- npx prisma migrate deploy
```

এই command linked Vercel project-এর Production environment variables ব্যবহার করে, সেগুলো কোনো `.env` file-এ লেখে না। চালানোর আগে নিশ্চিত করুন `DATABASE_URL` production database-এই নির্দেশ করছে এবং database backup আছে। Migration সফল না হলে deploy চালিয়ে যাবেন না; error ও connection string-এর pooled/direct সংক্রান্ত database provider-এর নির্দেশনা যাচাই করুন। `prisma migrate reset` production database-এ কখনো চালাবেন না।

## ৫. Git push দিয়ে deploy করুন

Vercel project তৈরি ও configure করার পর code পরিবর্তন Git-এ commit করে remote repository-তে push করুন। উদাহরণ:

```bash
git add server/VERCEL.md server/README.md
git commit -m "Configure backend deployment on Vercel"
git push origin main
```

আপনার production branch `main` না হলে `main`-এর জায়গায় সেই branch-এর নাম দিন। Vercel Git integration push-টি শনাক্ত করে deployment নিজে চালাবে—সার্ভার deploy করতে `vercel` বা `vercel --prod` চালানোর প্রয়োজন নেই। Project-এর **Deployments** tab-এ build status/log দেখুন। Production branch-এর push live deployment তৈরি করে; অন্য branch-এর push Preview URL তৈরি করে।

পরবর্তী backend code update-এ সংশ্লিষ্ট পরিবর্তিত ফাইলগুলো stage করে push করুন। যেমন, শুধু `src/main.ts` বদলালে:

```bash
git add server/src/main.ts
git commit -m "Describe your backend change"
git push origin main
```

শুধু আপনার কাজের ফাইল stage করুন; `git add server/` পুরো server folder-এর অন্য পরিবর্তনও stage করতে পারে। Commit করার আগে `git status` দেখে নিন যাতে `.env` বা অন্য secret file commit না হয়।

Database-এ নতুন Prisma migration যোগ হলে সেটি Production database-এ deploy-এর আগে একবার চালাতে হবে। আগের ধাপের `vercel env run -e production -- npx prisma migrate deploy` command-টি শুধু migration-এর জন্য; application deploy তবুও Git push দিয়েই হবে। Migration-সহ code push করার আগে migration command সফল হয়েছে কি না নিশ্চিত করুন।

## ৬. Deploy verify করুন

Vercel deployment URL ব্যবহার করে browser-এ এই endpoints খুলুন:

- Health check: `https://<your-api-domain>/api/v1/health`
- Swagger API documentation: `https://<your-api-domain>/api/docs`

Health response-এ `"status": "ok"` এবং `"environment": "production"` আছে কি না দেখুন। তারপর storefront/admin থেকে একটি API request পরীক্ষা করুন। Health check ব্যর্থ হলে Project → **Deployments → সর্বশেষ deployment → Build Logs/Runtime Logs** দেখুন; সাধারণ কারণ হলো missing env var, ভুল frontend origin, database network/SSL/connection সমস্যা, অথবা migration বাদ পড়া।

## ৭. Frontend-এ API URL আপডেট করুন

Storefront এবং admin frontend-এর API base URL হিসেবে deployed backend origin ব্যবহার করুন এবং API prefix `/api/v1` রাখুন। যেমন:

```text
https://<your-api-domain>/api/v1
```

যে frontend environment variable দিয়ে API URL নির্ধারিত হয় সেটি সংশ্লিষ্ট frontend project-এর **Environment Variables**-এ পরিবর্তন করে frontend-ও redeploy করুন। API-র CORS configuration-এ storefront/admin-এর সঠিক domain আছে কি না নিশ্চিত করুন।

## পরবর্তী code deploy-এ migration

নতুন migration যোগ হলে backup ও review করার পর production deploy-এর আগে একই command চালান:

```bash
cd server
vercel env run -e production -- npx prisma migrate deploy
```

এরপর Git push বা `vercel --prod` দিয়ে নতুন application version deploy করুন।
