@echo off
echo ===================================
echo Supabase Deployment Script
echo ===================================

echo.
echo [1/4] Linking to Supabase project...
call npx supabase link --project-ref rbpvdhwpcknuctaghyqo

echo.
echo [2/4] Pushing database migrations...
call npx supabase db push

echo.
echo [3/4] Deploying Edge Functions...
call npx supabase functions deploy tally-webhook --no-verify-jwt
call npx supabase functions deploy google-auth --no-verify-jwt
call npx supabase functions deploy google-callback --no-verify-jwt
call npx supabase functions deploy google-disconnect --no-verify-jwt
call npx supabase functions deploy calendar-availability --no-verify-jwt
call npx supabase functions deploy create-appointment --no-verify-jwt

echo.
echo [4/4] Setting secrets...
echo Setting Google OAuth secrets (replace placeholder values first)...
call npx supabase secrets set GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
call npx supabase secrets set GOOGLE_CLIENT_SECRET=your-google-client-secret
call npx supabase secrets set GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
call npx supabase secrets set GOOGLE_TOKEN_ENCRYPTION_KEY=your-32-byte-encryption-key-base64
call npx supabase secrets set TALLY_WEBHOOK_SECRET=your-tally-webhook-secret

echo.
echo ===================================
echo Done!
echo ===================================
pause
