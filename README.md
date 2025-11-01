# VIBE CODED front end for simple n8n

A production-ready AI chat interface built with Next.js 14+, Supabase, and N8N integration.

## Features

- **Authentication**: Email/password and Google OAuth via Supabase Auth
- **Real-time Chat**: AI-powered conversations with N8N backend integration
- **Conversation Management**: Persistent chat history with sidebar navigation
- **Markdown Support**: Rich text rendering for AI responses
- **Responsive Design**: Mobile-first design with collapsible sidebar
- **Dark Theme**: Modern dark blue/gray color scheme

## Tech Stack

- **Frontend**: Next.js 16.0.1 with App Router, React 19.2.0, TypeScript 5.9.3
- **Styling**: Tailwind CSS 3.4.18
- **Authentication & Database**: Supabase (Auth + PostgreSQL)
- **AI Backend**: N8N webhook at `https://n8n.0123111.xyz/webhook/invoke_agent`
- **Markdown**: react-markdown with GitHub Flavored Markdown support

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account
- N8N instance with webhook configured

## Quick Start

### 1. Clone and Install

```bash
cd job-responder
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n.0123111.xyz/webhook/invoke_agent
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script in `supabase/setup.sql`

This will create:
- `user_profiles` table
- `conversations` table
- `messages` table
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for auto-profile creation

### 4. Configure Supabase Auth

#### Email/Password Authentication

1. Go to Authentication > Providers in Supabase dashboard
2. Enable Email provider
3. Configure email templates if desired

#### Google OAuth (Optional)

1. Go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add authorized redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
job-responder/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              # Chat API endpoint (N8N proxy)
│   │   ├── conversations/route.ts      # Fetch conversations
│   │   └── conversations/[sessionId]/messages/route.ts
│   ├── auth/callback/route.ts          # OAuth callback handler
│   ├── chat/page.tsx                   # Main chat interface
│   ├── login/page.tsx                  # Login page
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Landing page (redirects)
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx           # Main chat container
│   │   ├── MessageList.tsx             # Message display
│   │   ├── MessageInput.tsx            # User input
│   │   └── Message.tsx                 # Individual message
│   ├── sidebar/
│   │   ├── Sidebar.tsx                 # Sidebar container
│   │   ├── ConversationList.tsx        # Conversation list
│   │   └── ConversationItem.tsx        # Single conversation
│   └── ErrorBoundary.tsx               # Error boundary
├── lib/
│   ├── api/
│   │   └── chat-client-n8n.ts          # N8N API client
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   └── server.ts                   # Server Supabase client
│   └── types/
│       ├── chat.ts                     # Chat types
│       └── database.ts                 # Database types
├── config/
│   └── api.ts                          # API configuration
├── supabase/
│   └── setup.sql                       # Database setup script
├── proxy.ts                            # Auth middleware (Next.js 16)
├── tailwind.config.ts                  # Tailwind configuration
└── next.config.js                      # Next.js configuration
```

## API Integration

### N8N Webhook Format

**Request to N8N:**
```json
{
  "query": "user's message",
  "user_id": "uuid from Supabase",
  "request_id": "unique UUID for this request",
  "session_id": "conversation UUID or empty string for new"
}
```

**Response from N8N:**
```json
{
  "Output": "AI response text",
  "session_id": "conversation UUID (for new conversations)",
  "title": "Auto-generated conversation title (for new conversations)"
}
```

## Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
    session_id VARCHAR PRIMARY KEY NOT NULL,
    user_id UUID NOT NULL,
    title VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    session_id VARCHAR NOT NULL,
    message JSONB NOT NULL,
    message_data TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Message Format:**
```json
{
  "content": "message text",
  "type": "human" | "ai"
}
```

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_N8N_WEBHOOK_URL`

5. **Update OAuth Redirect URLs in Supabase:**
   - Add your Vercel domain to authorized redirect URLs
   - Example: `https://your-app.vercel.app/auth/callback`

### Security Checklist

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Environment variables stored securely
- ✅ API routes protected with authentication
- ✅ HTTP-only cookies for session management
- ✅ CSRF protection via Supabase
- ✅ User data isolated via RLS policies

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## Testing Checklist

### Authentication
- [ ] User can sign up with email/password
- [ ] User can log in with email/password
- [ ] User can sign in with Google OAuth
- [ ] Invalid credentials show error message
- [ ] User stays logged in on page refresh
- [ ] User can log out successfully

### Chat Interface
- [ ] User can send a message
- [ ] Message appears in chat immediately
- [ ] AI response appears correctly
- [ ] Markdown renders properly (bold, italic, code, lists)
- [ ] Auto-scroll works
- [ ] Loading indicators show during processing
- [ ] Error messages display if API fails

### Conversation Management
- [ ] New conversation creates session_id
- [ ] Conversation appears in sidebar
- [ ] Clicking conversation loads messages
- [ ] Messages display in correct order
- [ ] New chat button clears current chat
- [ ] Sidebar collapses/expands on mobile

### Data Persistence
- [ ] Messages persist after page refresh
- [ ] Conversations persist after logout/login
- [ ] User can continue previous conversation

### Responsive Design
- [ ] Works on mobile (320px-768px)
- [ ] Works on tablet (768px-1024px)
- [ ] Works on desktop (1024px+)
- [ ] Sidebar overlay works on mobile

## Troubleshooting

### Issue: N8N Integration Not Working

**Check:**
1. Verify N8N webhook URL is correct in `.env.local`
2. Test N8N webhook directly with curl:
   ```bash
   curl -X POST https://n8n.0123111.xyz/webhook/invoke_agent \
     -H "Content-Type: application/json" \
     -d '{"query": "test", "user_id": "test", "request_id": "test", "session_id": ""}'
   ```
3. Check browser console for errors
4. Verify API route logs in terminal

### Issue: Authentication Failing

**Check:**
1. Verify Supabase URL and keys in `.env.local`
2. Check OAuth redirect URLs in Supabase dashboard
3. Clear browser cookies and try again
4. Check Supabase Auth logs

### Issue: Messages Not Persisting

**Check:**
1. Verify database tables exist (run `supabase/setup.sql`)
2. Check RLS policies allow user access
3. Verify user is authenticated
4. Check Supabase logs for errors

### Issue: Sidebar Not Responsive

**Check:**
1. Test on different screen sizes
2. Verify Tailwind breakpoints in code
3. Check z-index stacking
4. Test overlay functionality

## Architecture Decisions

### Why Non-Streaming?
The N8N backend returns a single JSON response rather than streaming, so we use a simple request-response pattern instead of Server-Sent Events (SSE).

### Why Dual Supabase Clients?
Next.js App Router requires different Supabase client configurations for browser and server components to properly handle cookies and SSR.

### Why proxy.ts instead of middleware.ts?
Next.js 16 deprecated the `middleware.ts` filename in favor of `proxy.ts` for route middleware.

## Contributing

This project follows KISS (Keep It Simple, Stupid) and YAGNI (You Aren't Gonna Need It) principles:
- Always choose the simplest solution
- Don't add features until they're needed
- Test assumptions before implementing
- Keep code readable and maintainable

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs
3. Check browser console for errors
4. Verify N8N webhook is accessible

## Next Steps

- [ ] Set up database in Supabase (run `supabase/setup.sql`)
- [ ] Configure OAuth providers
- [ ] Test authentication flow
- [ ] Test chat with N8N integration
- [ ] Deploy to production
- [ ] Set up monitoring/logging (optional)
- [ ] Add analytics (optional)
