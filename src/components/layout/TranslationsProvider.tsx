// src/components/layout/TranslationsProvider.tsx
'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n'; // استيراد ملف الإعدادات مباشرة
import { useEffect } from 'react';

export default function TranslationsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        const lang = i18n.language;
        if (document.documentElement.lang !== lang) {
            document.documentElement.lang = lang;
            document.documentElement.dir = i18n.dir(lang);
        }
    }, []);
    
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
