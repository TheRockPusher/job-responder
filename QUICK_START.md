# Quick Start Guide

## Development

```bash
# Start development server
npm run dev

# Visit
http://localhost:3000
```

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Deploy to Vercel

```bash
# One command deployment
vercel --prod
```

## Common Tasks

### Reset Database (if needed)
1. Go to Supabase Dashboard
2. Run the cleanup script:

```sql
-- Delete all data (keeps tables)
DELETE FROM messages;
DELETE FROM conversations;

-- Or drop and recreate (from supabase/setup.sql)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
-- Then run supabase/setup.sql
```

### Check Logs
- **Browser**: Open DevTools Console (F12)
- **Server**: Check terminal where `npm run dev` is running
- **Supabase**: Dashboard → Logs

### Common Fixes

**Issue**: Messages not appearing
- Solution: Start a new conversation (click "New Chat")

**Issue**: Authentication failing
- Check: `.env.local` has correct Supabase credentials

**Issue**: 404 on conversations
- Check: Database tables exist in Supabase
- Check: No trailing whitespace in session_ids

## File Locations

- **Env variables**: `.env.local`
- **Database schema**: `supabase/setup.sql`
- **API config**: `config/api.ts`
- **Main chat**: `app/chat/page.tsx`
- **Full docs**: `README.md`

## Support

📖 Full documentation: `README.md`
🔧 Database setup: `DATABASE_SETUP.md`
📊 Project status: `PROJECT_STATUS.md`
