# Troubleshooting Database Connection on Render

## UnknownHostException: dpg-xxxxx-a (connection attempt failed)

If you see **"The connection attempt failed"** and **"UnknownHostException: dpg-xxxxx-a"**, the app is using Render’s **internal** database URL. That hostname only resolves inside Render’s private network and can fail in some setups (e.g. region or DNS).

**Fix:** Use the **External** database URL so the host resolves (e.g. `dpg-xxx-a.oregon-postgres.render.com`).

1. In **Render Dashboard** → your **PostgreSQL** service → open **Connect** (top right).
2. Copy the **External** connection string (not Internal).
3. In your **Web Service** → **Environment** → add or set:
   - **EXTERNAL_DATABASE_URL** = that external URL (e.g. `postgresql://user:password@dpg-xxx-a.oregon-postgres.render.com:5432/dbname`).
4. Save and redeploy. The app will use `EXTERNAL_DATABASE_URL` when set and the DB host will resolve.

You can keep `DATABASE_URL` (from linking the DB) as-is; the code prefers `EXTERNAL_DATABASE_URL` when present.

---

## Other issue: App uses localhost instead of Render DB
App is trying to connect to `localhost:5432` instead of the Render database.

## Possible Causes

### 1. DATABASE_URL Not Set in Environment Variables
**Check:**
- Go to your Web Service → Environment tab
- Verify `DATABASE_URL` exists and has the correct value
- Value should be: `postgresql://driving_school_db_mkqx_user:rNdp3ePOqjqPRgOWqBlPvIpOIqcUNNFP@dpg-d54safje5dus73bqniq0-a/driving_school_db_mkqx`

### 2. Code Not Pushed Yet
**Fix:**
```bash
git add backend/src/main/java/com/example/drivingschool/config/DatabaseConfig.java
git add backend/src/main/resources/application-render.properties
git commit -m "Fix DATABASE_URL parsing for Render"
git push
```

### 3. Profile Not Active
**Verify:**
- Environment variable `SPRING_PROFILES_ACTIVE=render` is set
- Check logs for: "The following 1 profile is active: 'render'"

## Quick Fix Steps

### Step 1: Verify Environment Variables
In Render Dashboard → Your Web Service → Environment:
```
SPRING_PROFILES_ACTIVE=render
PORT=8080
FRONTEND_URL=https://driving-school-hub.netlify.app
# Use External URL if you get UnknownHostException for the DB host (see top of this doc)
EXTERNAL_DATABASE_URL=<paste External Database URL from PostgreSQL → Connect>
# DATABASE_URL is often auto-set when you link the DB (internal URL)
```
Get the exact **External** URL from your PostgreSQL service → Connect → **External** Database URL.

### Step 2: Commit and Push Code
```bash
git add .
git commit -m "Fix database connection for Render"
git push
```

### Step 3: Check Logs
After deployment, look for:
- "Parsed DATABASE_URL - Host: dpg-d54safje5dus73bqniq0-a" (success)
- OR "DATABASE_URL is empty or not set" (environment variable issue)

## Alternative: Use Individual Properties

If DATABASE_URL parsing still doesn't work, set individual properties:

```
DB_URL=jdbc:postgresql://dpg-d54safje5dus73bqniq0-a:5432/driving_school_db_mkqx
DB_USER=driving_school_db_mkqx_user
DB_PASSWORD=rNdp3ePOqjqPRgOWqBlPvIpOIqcUNNFP
```

## Debug Steps

1. **Check if DATABASE_URL is being read:**
   - Look for log messages from DatabaseConfig
   - Should see "Parsed DATABASE_URL" or error message

2. **Verify profile is active:**
   - Logs should show: "The following 1 profile is active: 'render'"

3. **Check environment variables:**
   - In Render, go to Environment tab
   - Verify all variables are set correctly
   - Make sure there are no typos

4. **Redeploy:**
   - After adding/changing environment variables, Render should auto-redeploy
   - Or manually trigger a deploy

