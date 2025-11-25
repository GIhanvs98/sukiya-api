l# MongoDB Setup Guide for Windows

## Option 1: Install MongoDB Community Edition (Recommended)

### Step 1: Download MongoDB
1. Go to https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.0 or newer)
   - Platform: Windows
   - Package: MSI
3. Download the installer

### Step 2: Install MongoDB
1. Run the downloaded MSI installer
2. Choose "Complete" installation
3. **Important**: Check "Install MongoDB as a Service"
4. Select "Run service as Network Service user"
5. Check "Install MongoDB Compass" (optional GUI tool)
6. Click "Install"

### Step 3: Verify Installation
After installation, MongoDB should start automatically as a Windows service.

Verify it's running:
```powershell
Get-Service -Name MongoDB
```

### Step 4: Test Connection
```powershell
mongosh
```

If `mongosh` works, you're connected! Type `exit` to quit.

## Option 2: Use MongoDB via Docker (Alternative)

If you have Docker installed:

```powershell
# Start MongoDB as replica set (required for Prisma)
docker run -d -p 27017:27017 --name mongodb mongo:latest mongod --replSet rs0

# Initialize replica set
Start-Sleep -Seconds 5
docker exec -it mongodb mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

## Option 3: Use MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster
4. Get your connection string
5. Update `.env` file with the Atlas connection string

## ⚠️ IMPORTANT: Configure MongoDB as Replica Set (Required for Prisma)

**Prisma requires MongoDB to run as a replica set**, even for single-node development. Follow these steps:

### Quick Setup (Docker - Recommended for Development):

```powershell
# Stop existing MongoDB if running
docker stop mongodb 2>$null
docker rm mongodb 2>$null

# Start MongoDB as replica set
docker run -d -p 27017:27017 --name mongodb mongo:latest mongod --replSet rs0

# Wait a few seconds, then initialize replica set
Start-Sleep -Seconds 5
docker exec -it mongodb mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

### Manual Setup (Windows Service):

1. Stop MongoDB service:
```powershell
Stop-Service MongoDB
```

2. Edit MongoDB config file (usually at `C:\Program Files\MongoDB\Server\<version>\bin\mongod.cfg`):
```yaml
replication:
  replSetName: rs0
```

3. Start MongoDB service:
```powershell
Start-Service MongoDB
```

4. Initialize replica set:
```powershell
mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

5. Verify:
```powershell
mongosh --eval "rs.status()"
```

## Configure Backend

Once MongoDB is running as a replica set, update your `.env` file:

```env
DATABASE_URL="mongodb://localhost:27017/sukiyarestaurant?retryWrites=true&w=majority&replicaSet=rs0"
```

## Start MongoDB Service (if installed but not running)

```powershell
# Start MongoDB service
Start-Service MongoDB

# Check status
Get-Service MongoDB
```

## Troubleshooting

### MongoDB service not starting?
1. Open Services (services.msc)
2. Find "MongoDB" service
3. Right-click → Properties → Start

### Port 27017 already in use?
Check what's using the port:
```powershell
netstat -ano | findstr :27017
```

### Connection refused?
- Make sure MongoDB service is running
- Check firewall settings
- Verify the connection string in `.env`

