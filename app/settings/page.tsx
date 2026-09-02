'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from '@/lib/supabase/client';
import { Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading } = useCurrentUser();
  const [isConnected, setIsConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Check if user has Google connection
  useEffect(() => {
    const checkGoogleConnection = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('google_connections_safe')
        .select('*')
        .eq('employee_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setIsConnected(true);
        setGoogleEmail(data.google_email);
      } else {
        setIsConnected(false);
        setGoogleEmail(null);
      }
    };

    checkGoogleConnection();
  }, [user?.id]);

  // Handle connect
  const handleConnect = async () => {
    if (!user?.id) return;
    setIsConnecting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in first');
        return;
      }

      // Get auth URL from edge function
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/google-auth`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }

      const { authUrl } = await response.json();

      // Encode state with user info
      const state = btoa(JSON.stringify({
        userId: user.id,
        profileId: user.id,
      }));

      // Add state to URL
      const urlWithState = new URL(authUrl);
      urlWithState.searchParams.set('state', state);

      // Redirect to Google
      window.location.href = urlWithState.toString();
    } catch (error) {
      console.error('Connect error:', error);
      alert('Failed to connect Google account');
      setIsConnecting(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    if (!user?.id) return;
    if (!confirm('Disconnect Google account?')) return;

    setIsDisconnecting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in first');
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/google-disconnect`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      setIsConnected(false);
      setGoogleEmail(null);
    } catch (error) {
      console.error('Disconnect error:', error);
      alert('Failed to disconnect Google account');
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-2">Configure your account and integrations</p>
          </div>

          {/* Google Calendar Integration */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Google Calendar
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Sync your meetings with Google Calendar and get Google Meet links
                  </p>

                  {isConnected ? (
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700">
                        Connected as <strong>{googleEmail}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700">
                        Not connected
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {isConnected ? (
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                  >
                    {isDisconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting}
                  >
                    {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Connect Google
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* User Info */}
          {user && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Account Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-500">Name</label>
                  <p className="text-slate-900">{user.profile?.name || user.profile?.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Email</label>
                  <p className="text-slate-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Role</label>
                  <p className="text-slate-900 capitalize">{user.profile?.role}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
