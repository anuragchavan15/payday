# MongoDB Connection String Fix

## The Problem
Your build is failing with this error:
```
MongoParseError: mongodb+srv URI cannot have port number
```

## The Issue
From your build log, your MongoDB URI appears to be:
```
mongodb+srv://blade1528:Anurag1528cluster0.awerszh.mongodb.net/payday?retryWrites=true&w=majority&ap
```

The problem is that **`mongodb+srv://` URIs cannot include port numbers**. The `+srv` protocol automatically handles DNS resolution and port assignment.

## The Solution

### 1. Correct MongoDB URI Format
Your MongoDB connection string should be:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### 2. Based on Your Error Log
From the error, it looks like your URI should be:
```
mongodb+srv://blade1528Anurag1528@cluster0.awerszh.mongodb.net/payday?retryWrites=true&w=majority
```

**Key changes needed:**
- Remove any port numbers (like `:27017`)
- Ensure proper format: `username:password@cluster.mongodb.net/database`
- Make sure the cluster name is correct

### 3. Environment Variable Setup

#### For Local Development:
Create a `.env.local` file in your project root:
```bash
MONGODB_URI=mongodb+srv://blade1528:Anurag1528@cluster0.awerszh.mongodb.net/payday?retryWrites=true&w=majority
```

#### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new environment variable:
   - **Name:** `MONGODB_URI`
   - **Value:** `mongodb+srv://blade1528:Anurag1528@cluster0.awerszh.mongodb.net/payday?retryWrites=true&w=majority`
   - **Environment:** Production, Preview, Development (select all)

### 4. Special Character Encoding
If your password contains special characters, you need to URL encode them:
- `@` becomes `%40`
- `:` becomes `%3A`
- `/` becomes `%2F`
- `?` becomes `%3F`
- `#` becomes `%23`
- `[` becomes `%5B`
- `]` becomes `%5D`

### 5. Verify Your MongoDB Atlas Settings
1. Go to MongoDB Atlas dashboard
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string and ensure it follows the correct format
5. Make sure your IP address is whitelisted in Network Access
6. Verify your database user has the correct permissions

## Quick Fix Steps:
1. Update your `MONGODB_URI` environment variable in Vercel
2. Remove any port numbers from the URI
3. Ensure the format is: `mongodb+srv://username:password@cluster.mongodb.net/database?options`
4. Redeploy your application

## Test the Connection
After fixing the URI, you can test the connection by visiting:
- `/api/test-connection` - Tests MongoDB connection
- `/api/mongodb-diagnostics` - Shows detailed connection info
