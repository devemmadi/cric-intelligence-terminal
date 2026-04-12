/* eslint-disable */
import { useState, useEffect } from 'react';
import { API_BASE } from '../shared/constants';

const VAPID_PUBLIC_KEY = 'BAml74bkqnpyzeyipWyismh8pF3FxiUIJ-i7v5wFCDVKmbzyl22j7oH0PPsiN5xNXOyNhapD_B__XTOkiR_DNJg';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

export default function usePushNotifications() {
    const [permission, setPermission] = useState(() => (typeof Notification !== 'undefined' ? Notification.permission : 'default'));
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const isSupported = typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

    useEffect(() => {
        if (!isSupported) return;
        navigator.serviceWorker.ready.then(reg => {
            reg.pushManager.getSubscription().then(sub => {
                setIsSubscribed(!!sub);
                setPermission(Notification.permission);
            });
        }).catch(() => {});
    }, [isSupported]);

    const subscribe = async () => {
        if (!isSupported) { setError('Push not supported in this browser'); return; }
        setIsLoading(true);
        setError(null);
        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;
            const perm = await Notification.requestPermission();
            setPermission(perm);
            if (perm !== 'granted') { setIsLoading(false); return; }

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            await fetch(`${API_BASE}/push/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub.toJSON()),
            });

            setIsSubscribed(true);
            localStorage.setItem('ci_push_subscribed', '1');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribe = async () => {
        setIsLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await fetch(`${API_BASE}/push/unsubscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }
            setIsSubscribed(false);
            localStorage.removeItem('ci_push_subscribed');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return { isSupported, permission, isSubscribed, isLoading, error, subscribe, unsubscribe };
}
