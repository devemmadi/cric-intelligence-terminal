/* eslint-disable */
import React from 'react';
import usePushNotifications from '../hooks/usePushNotifications';

export default function NotifyButton() {
    const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

    if (!isSupported) return null;

    if (isSubscribed) {
        return (
            <button onClick={unsubscribe} disabled={isLoading} title="Turn off match notifications"
                style={{ background: 'rgba(0,184,148,0.15)', border: '1px solid #00B894', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: '#00B894', fontSize: 11, fontWeight: 700, fontFamily: 'Inter, system-ui', display: 'flex', alignItems: 'center', gap: 4 }}>
                🔔 On
            </button>
        );
    }

    return (
        <button onClick={subscribe} disabled={isLoading || permission === 'denied'}
            title={permission === 'denied' ? 'Enable notifications in browser settings' : 'Get notified 30 mins before each match'}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, padding: '4px 10px', cursor: permission === 'denied' ? 'not-allowed' : 'pointer', color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 500, fontFamily: 'Inter, system-ui', display: 'flex', alignItems: 'center', gap: 4, opacity: permission === 'denied' ? 0.45 : 1 }}>
            {isLoading ? '...' : '🔔 Notify me'}
        </button>
    );
}
