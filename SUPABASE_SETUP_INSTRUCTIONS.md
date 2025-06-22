# 🚀 **Supabase Setup Instructions**

## ✅ **Step 1: Get Database Connection String**

### **In Supabase Dashboard:**

1. Go to your **"supabase-olympix-flower"** project
2. Click **"Settings"** in the left sidebar
3. Click **"Database"**
4. Find **"Connection string"** section
5. Copy the **"URI"** connection string (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklm.supabase.co:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** with your actual project password

### **Your Connection String Should Look Like:**

```
postgresql://postgres:your_actual_password@db.abcdefghijklm.supabase.co:5432/postgres
```

---

## ✅ **Step 2: Add to Local Development**

### **Create/Update `.env` file in backend folder:**

```bash
cd backend
```

Create `.env` file:

```env
# Supabase Database Connection
DATABASE_URL=postgresql://postgres:your_actual_password@db.abcdefghijklm.supabase.co:5432/postgres

# Development settings
NODE_ENV=development
```

---

## ✅ **Step 3: Test Local Connection**

### **Start your backend:**

```bash
cd backend
npm run dev
```

### **Look for these logs:**

```
🗄️ Attempting PostgreSQL connection...
✅ PostgreSQL adapter initialized
🚀 Server running on port 3000
```

### **Test the connection:**

```bash
curl http://localhost:3000/api/v1/health
```

You should see:

```json
{
  "name": "Olympix API",
  "version": "1.0.0",
  "status": "healthy"
}
```

---

## ✅ **Step 4: Create Your First Event (Test)**

### **Test event creation:**

```bash
curl -X POST http://localhost:3000/api/v1/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "SportID": 1,
    "Name": "Supabase Test Event",
    "Date": "2025-07-01",
    "Time": "10:00",
    "Location": "Test Arena",
    "Status": "Scheduled"
  }'
```

### **Expected response:**

```json
{
  "success": true,
  "data": {
    "ID": 1,
    "SportID": 1,
    "Name": "Supabase Test Event",
    "Date": "2025-07-01",
    "Time": "10:00",
    "Location": "Test Arena",
    "Status": "Scheduled"
  },
  "message": "Event created successfully"
}
```

---

## ✅ **Step 5: Verify in Supabase Dashboard**

### **Check your data:**

1. Go to Supabase Dashboard
2. Click **"Table Editor"** in left sidebar
3. You should see a table called **"events"**
4. Click on it to see your test event stored as JSON

### **Example table structure:**

| id  | data                                                 | created_at          |
| --- | ---------------------------------------------------- | ------------------- |
| 1   | {"ID":1,"SportID":1,"Name":"Supabase Test Event"...} | 2025-06-22 14:40:00 |

---

## ✅ **Step 6: Deploy to Vercel**

### **Add Environment Variable in Vercel:**

1. Go to **Vercel Dashboard**
2. Select your **"olympix-app-final"** project
3. Go to **"Settings"** → **"Environment Variables"**
4. Add new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:your_password@db.abcdefghijklm.supabase.co:5432/postgres`
   - **Environments**: Check **"Production"**, **"Preview"**, **"Development"**

### **Deploy:**

```bash
git add .
git commit -m "Connected to Supabase database"
git push origin main
```

### **Verify production:**

After deployment, test your production API:

```bash
curl https://your-vercel-app.vercel.app/api/v1/health
```

---

## ✅ **Step 7: Migration (Copy existing data)**

### **If you want to copy your existing JSON data to Supabase:**

```bash
# In your backend terminal, create a migration script:
cd backend
node -e "
const { StorageManagerService } = require('./dist/services/storage-manager.service.js');
StorageManagerService.migrateFromFilesToDatabase().then(() => {
  console.log('Migration completed!');
  process.exit(0);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
"
```

This will copy all your existing events, teams, sports data to Supabase.

---

## 🎯 **What You Should See**

### **Development Logs:**

```
🗄️ Attempting PostgreSQL connection...
✅ PostgreSQL adapter initialized
✅ Table Events ready
✅ Table Sports ready
✅ Table Teams ready
🚀 Server running on port 3000
📊 Storage Configuration:
   Environment: development
   Adapter: PostgreSQL
   Info: Production-grade PostgreSQL database - persistent and scalable
```

### **In Supabase Dashboard:**

- Tables: `events`, `sports`, `teams`, `players`, `medals`
- Each table has: `id`, `data` (JSONB), `created_at`, `updated_at`
- Your events stored as JSON in the `data` column

---

## 🔧 **Troubleshooting**

### **If connection fails:**

1. **Check password** - Make sure you replaced `[YOUR-PASSWORD]` with actual password
2. **Check URL** - Copy exact connection string from Supabase dashboard
3. **Check network** - Supabase requires internet connection

### **If tables don't appear:**

1. Create an event first (tables are created automatically)
2. Check Supabase → Table Editor
3. Tables appear after first data write

### **If data doesn't persist:**

1. Check environment variables in Vercel
2. Make sure `DATABASE_URL` is set correctly
3. Check Vercel deployment logs

---

## ✅ **Success Checklist**

- [ ] ✅ Supabase project created ("supabase-olympix-flower")
- [ ] ✅ Connection string copied and password replaced
- [ ] ✅ `.env` file created with `DATABASE_URL`
- [ ] ✅ Local backend connects to Supabase
- [ ] ✅ Test event created successfully
- [ ] ✅ Event visible in Supabase Table Editor
- [ ] ✅ Environment variable added to Vercel
- [ ] ✅ Production deployment successful
- [ ] ✅ Production events persist permanently

**🎉 Your Olympics app now has permanent, persistent storage!**

**No more data loss - events will survive all server restarts!**
