# Database Setup Guide

This guide will help you set up the Supabase database for the AI Chat Interface.

## Prerequisites

- Supabase account
- Supabase project created
- Environment variables configured in `.env.local`

## Step-by-Step Setup

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**

### 2. Run the Setup Script

1. Open the file `supabase/setup.sql` in your project
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** or press `Ctrl+Enter`

### 3. Verify Setup

After running the script, you should see:

```
Database setup completed successfully!
Tables created: user_profiles, conversations, messages
RLS policies enabled and configured
Indexes created for optimal performance
```

### 4. Verify Tables Created

1. Navigate to **Table Editor** in Supabase
2. You should see three new tables:
   - `user_profiles`
   - `conversations`
   - `messages`

### 5. Test the Application

1. Restart your development server if it's running
2. Go to http://localhost:3000
3. Sign up or log in
4. Try sending a message to test the chat functionality

## What the Setup Script Does

### Creates Tables

**user_profiles**
- Stores user information
- Links to Supabase auth.users
- Auto-created on user signup

**conversations**
- Stores chat conversations
- Tracks session_id, user_id, title
- Includes metadata and archive flag

**messages**
- Stores individual messages
- JSONB format for message content
- Links to conversations

### Enables Security

**Row Level Security (RLS)**
- Users can only access their own data
- Enforced at database level
- Prevents unauthorized access

### Creates Indexes

Performance indexes on:
- `conversations.user_id`
- `conversations.last_message_at`
- `messages.session_id`
- `messages.created_at`

### Sets Up Triggers

- Auto-creates user profile on signup
- Updates timestamps automatically

## Troubleshooting

### Error: "relation already exists"

This means the tables are already created. You can either:
1. Drop the existing tables first (⚠️ **WARNING: This deletes all data**)
2. Skip this step if tables already exist

To drop tables:
```sql
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
```

### Error: "permission denied"

Make sure you're logged in as the project owner in Supabase.

### Error: "foreign key constraint"

This usually means tables are being created out of order. Run the entire script at once, not piece by piece.

## Verification Checklist

After setup, verify:

- [ ] Tables exist in Table Editor
- [ ] RLS policies show in Authentication > Policies
- [ ] Can sign up a new user
- [ ] Can log in successfully
- [ ] Can send a chat message
- [ ] Message appears in messages table
- [ ] Conversation appears in conversations table

## Next Steps

1. **Test Authentication**: Sign up and log in
2. **Test Chat**: Send a message and verify N8N integration works
3. **Check Data**: Verify data appears in Supabase tables
4. **Deploy**: Once testing is complete, deploy to production

## Production Setup

For production deployment:

1. Use the same setup script in your production Supabase project
2. Verify RLS policies are enabled
3. Test with a production user account
4. Monitor logs for any errors

## Support

If you encounter issues:

1. Check Supabase logs: Dashboard > Logs
2. Verify environment variables are correct
3. Check browser console for errors
4. Review the troubleshooting section above
