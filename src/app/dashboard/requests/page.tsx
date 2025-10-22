// app/dashboard/requests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AgreementRequest {
  id: number;
  merchantName: string;
  offerTitle: string;
  productName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
}

// دالة لترجمة حالة الطلب
const getStatusTranslation = (
  status: AgreementRequest['status'],
  t: (key: string) => string
): string => {
  switch (status) {
    case 'pending':
      return t('AgreementRequests.status.pending');
    case 'accepted':
      return t('AgreementRequests.status.accepted');
    case 'rejected':
      return t('AgreementRequests.status.rejected');
    case 'completed':
      return t('AgreementRequests.status.completed');
    default:
      return status;
  }
};

export default function AgreementRequestsPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<AgreementRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agreements/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: number, status: 'accepted' | 'rejected') => {
    try {
      await api.put(`/agreements/requests/${id}/status`, { status });
      const action = status === 'accepted' ? t('AgreementRequests.alerts.accepted') : t('AgreementRequests.alerts.rejected');
      alert(t('AgreementRequests.alerts.success', { action }));
      fetchRequests();
    } catch (error) {
      alert(t('AgreementRequests.alerts.error'));
    }
  };

  if (loading) {
    return <div className="p-8">{t('AgreementRequests.loading')}</div>;
  }

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{t('AgreementRequests.title')}</h1>
        <p className="text-gray-500">{t('AgreementRequests.subtitle')}</p>
      </header>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('AgreementRequests.merchantName')}</TableHead>
              <TableHead>{t('AgreementRequests.offerTitle')}</TableHead>
              <TableHead>{t('AgreementRequests.productName')}</TableHead>
              <TableHead>{t('AgreementRequests.status.label')}</TableHead>
              <TableHead>{t('AgreementRequests.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {t('AgreementRequests.noRequests')}
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.merchantName}</TableCell>
                  <TableCell>{req.offerTitle}</TableCell>
                  <TableCell>{req.productName}</TableCell>
                  <TableCell>
                    <Badge>{getStatusTranslation(req.status, t)}</Badge>
                  </TableCell>
                  <TableCell>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(req.id, 'accepted')}
                        >
                          {t('AgreementRequests.accept')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(req.id, 'rejected')}
                        >
                          {t('AgreementRequests.reject')}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}