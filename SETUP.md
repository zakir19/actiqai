# Environment Setup Guide

## Quick Setup Steps

### 1. Create `.env.local` file

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

### 2. Get Your API Keys

#### A. Gemini API Key (Required)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and add to `.env.local`:
   ```env
   GEMINI_API_KEY=AIza...your_key_here
   ```

#### B. Stream.io Keys (Required for Video Calls)
1. Sign up at [GetStream.io](https://getstream.io/)
2. Create a new app
3. Go to Dashboard → Your App → Settings
4. Copy API Key and Secret:
   ```env
   STREAM_API_KEY=your_api_key
   STREAM_SECRET=your_secret_key
   ```

#### C. Inngest Keys (Required for Background Jobs)
1. Sign up at [Inngest](https://www.inngest.com/)
2. Create a new project
3. Go to Settings → Keys
4. Copy Event Key and Signing Key:
   ```env
   INNGEST_EVENT_KEY=your_event_key
   INNGEST_SIGNING_KEY=signingkey_live_...
   ```

#### D. Database (Neon PostgreSQL)
1. Sign up at [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string:
   ```env
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

#### E. Better Auth Secret
Generate a random secret key:
```bash
openssl rand -base64 32
```
Or use any random string:
```env
BETTER_AUTH_SECRET=your_random_32_char_string
```

### 3. Configure Webhooks (For Production)

#### Setup ngrok for webhooks:
```bash
# Terminal 1 - Start dev server
npm run dev

# Terminal 2 - Start ngrok tunnel
npm run dev:webhook
```

Copy your ngrok URL and update `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok-free.dev
```

#### Configure Stream.io Webhook:
1. Go to Stream.io Dashboard → Your App → Webhooks
2. Add webhook URL: `https://your-ngrok-url.ngrok-free.dev/api/webhook`
3. Select events:
   - `call.session_started`
   - `call.session_ended`
   - `call.session_participant_left`
   - `call.transcription_ready`
   - `call.recording_ready`

### 4. Setup Database

Push database schema:
```bash
npm run db:push
```

### 5. Run the Application

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Access the app at: http://localhost:3000

## Complete `.env.local` Example

```env
# Database
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Gemini AI
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Stream.io
STREAM_API_KEY=xxxxxxxxxxxxx
STREAM_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Inngest
INNGEST_EVENT_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
INNGEST_SIGNING_KEY=signkey_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Better Auth
BETTER_AUTH_SECRET=your_random_secret_minimum_32_characters_long
BETTER_AUTH_URL=http://localhost:3000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
# For production with ngrok:
# NEXT_PUBLIC_APP_URL=https://your-custom-url.ngrok-free.dev
```

## Troubleshooting

### Error: "Event key not found"
- Make sure `INNGEST_EVENT_KEY` is set in `.env.local`
- Restart your dev server after adding the key

### Error: "Gemini API key not found"
- Add `GEMINI_API_KEY` to `.env.local`
- Verify the key is valid at Google AI Studio

### Error: "Stream.io connection failed"
- Check `STREAM_API_KEY` and `STREAM_SECRET` are correct
- Verify your Stream.io account is active

### Webhooks not working
- Make sure ngrok is running: `npm run dev:webhook`
- Configure the webhook URL in Stream.io Dashboard
- Check ngrok URL matches `NEXT_PUBLIC_APP_URL`

## Development vs Production

### Development (Local)
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
```

### Production (with ngrok)
```env
NEXT_PUBLIC_APP_URL=https://your-url.ngrok-free.dev
BETTER_AUTH_URL=https://your-url.ngrok-free.dev
```

## Security Notes

⚠️ **Never commit `.env.local` to git!**

The `.gitignore` file should include:
```
.env
.env.local
.env*.local
```

## Need Help?

- Gemini API: https://ai.google.dev/
- Stream.io: https://getstream.io/video/docs/
- Inngest: https://www.inngest.com/docs
- Neon: https://neon.tech/docs
