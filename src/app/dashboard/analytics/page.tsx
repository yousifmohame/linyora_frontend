// app/dashboard/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// نستخدم مفتاحًا محايدًا للبيانات (مثل "sales") بدلًا من "المبيعات"
interface SalesData {
  name: string;
  sales: number; // مفتاح محايد للغة
}

interface RawSalesData {
  name: string;
  sales?: number | string;
  المبيعات?: number | string;
}

export default function AnalyticsPage() {
  const { t, i18n } = useTranslation();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get<RawSalesData[]>('/merchants/analytics/sales');

        const formattedData: SalesData[] = response.data.map(item => {
          const salesValue = item.sales ?? item.المبيعات ?? 0;
          return {
            name: item.name,
            sales: typeof salesValue === 'string'
              ? parseFloat(salesValue) || 0
              : salesValue,
          };
        });

        setSalesData(formattedData);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // تحديد عملة العرض واسم الحقل حسب اللغة
  const currency = i18n.language === 'ar' ? 'ريال' : 'SAR';
  const salesLabel = t('Analytics.sales');

  if (loading) {
    return <div className="p-8">{t('Analytics.loading')}</div>;
  }

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{t('Analytics.title')}</h1>
        <p className="text-gray-500">{t('Analytics.subtitle')}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('Analytics.dailySalesSummary')}</CardTitle>
          <CardDescription>{t('Analytics.salesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={salesData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} ${currency}`}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)} ${currency}`, salesLabel]}
                  labelStyle={{ color: 'black' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend />
                <Bar dataKey="sales" name={salesLabel} fill="#991b1b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}