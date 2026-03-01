'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseCampaignRealtimeOptions {
  campaignId: string;
  onItemChange: () => void; // callback to re-fetch / refresh UI
}

// Subscribes to real-time item and sale changes for a specific campaign.
// Call onItemChange to re-fetch data when an update arrives.
//
// Usage:
//   useCampaignRealtime({ campaignId, onItemChange: () => refetch() });
export function useCampaignRealtime({ campaignId, onItemChange }: UseCampaignRealtimeOptions) {
  const stableOnChange = useCallback(onItemChange, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`campaign-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => stableOnChange()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sales',
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => stableOnChange()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [campaignId, stableOnChange]);
}
