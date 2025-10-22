// frontend/src/app/dashboard/admin/verifications/[id]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface UserDetails {
    name: string;
    email: string;
    identity_number: string;
    identity_image_url: string;
    business_name?: string;
    business_license_url?: string;
    social_links?: Record<string, string>; // ✨ إضافة
    stats?: { followers?: string };      // ✨ إضافة
}

interface BankDetails {
    account_number: string;
    iban: string;
    iban_certificate_url: string;
}

export default function VerificationDetailsPage() {
    const { t } = useTranslation();
    const { id: userId } = useParams();
    const router = useRouter();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [bank, setBank] = useState<BankDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isReviewing, setIsReviewing] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchDetails = useCallback(async () => {
        try {
            const response = await api.get(`/admin/verifications/${userId}`);
            setUser(response.data.user);
            setBank(response.data.bank);
        } catch (error) {
            toast.error(t('VerificationDetails.toast.fetchError.title'), {
                description: t('VerificationDetails.toast.fetchError.description')
            });
        } finally {
            setLoading(false);
        }
    }, [userId, t]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleReview = async (status: 'approved' | 'rejected') => {
        if (status === 'rejected' && !rejectionReason.trim()) {
            toast.error(t('VerificationDetails.toast.rejectionReasonRequired.title'), {
                description: t('VerificationDetails.toast.rejectionReasonRequired.description')
            });
            return;
        }

        setIsReviewing(true);
        try {
            await api.put(`/admin/verifications/${userId}`, {
                status,
                rejection_reason: rejectionReason
            });
            toast.success(t('VerificationDetails.toast.reviewSuccess.title'), {
                description: t('VerificationDetails.toast.reviewSuccess.description', {
                    action: status === 'approved' 
                        ? t('common.approved') 
                        : t('common.rejected')
                })
            });
            router.push('/dashboard/admin/verifications');
        } catch (error) {
            toast.error(t('VerificationDetails.toast.reviewError.title'), {
                description: t('VerificationDetails.toast.reviewError.description')
            });
        } finally {
            setIsReviewing(false);
            setIsRejectDialogOpen(false);
            if (status === 'rejected') setRejectionReason('');
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!user || !bank) {
        return (
            <div className="p-8 text-center">
                {t('VerificationDetails.notFound')}
            </div>
        );
    }

    return (
        <div className="p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold">
                    {t('VerificationDetails.title', { name: user.name })}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Identity & Business Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('VerificationDetails.sections.identity.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p><strong>{t('VerificationDetails.fields.identityNumber')}:</strong> {user.identity_number}</p>
                        <p><strong>{t('VerificationDetails.fields.businessName')}:</strong> {user.business_name || t('common.notSpecified')}</p>
                        <div>
                            <p><strong>{t('VerificationDetails.fields.identityImage')}:</strong></p>
                            <a 
                                href={user.identity_image_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-500 hover:underline"
                            >
                                {t('VerificationDetails.actions.viewImage')}
                            </a>
                        </div>
                        {user.business_license_url && (
                            <div>
                                <p><strong>{t('VerificationDetails.fields.businessLicense')}:</strong></p>
                                <a 
                                    href={user.business_license_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-500 hover:underline"
                                >
                                    {t('VerificationDetails.actions.viewDocument')}
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bank Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('VerificationDetails.sections.bank.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p><strong>{t('VerificationDetails.fields.accountNumber')}:</strong> {bank.account_number}</p>
                        <p><strong>{t('VerificationDetails.fields.iban')}:</strong> {bank.iban}</p>
                        <div>
                            <p><strong>{t('VerificationDetails.fields.ibanCertificate')}:</strong></p>
                            <a 
                                href={bank.iban_certificate_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-500 hover:underline"
                            >
                                {t('VerificationDetails.actions.viewCertificate')}
                            </a>
                        </div>
                    </CardContent>
                </Card>
                {/* ✨ Social Media & Stats Card (New) ✨ */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('VerificationDetails.socialMedia')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p><strong>{t('VerificationDetails.followers')}:</strong> {user.stats?.followers || t('common.notSpecified')}</p>
                        </div>
                        <div className="space-y-2">
                            <p><strong>{t('VerificationDetails.socialLinks')}:</strong></p>
                            {user.social_links && Object.keys(user.social_links).length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {Object.entries(user.social_links).map(([platform, link]) => (
                                        link && <li key={platform}>
                                            <span className="font-semibold capitalize">{platform}: </span>
                                            <a
                                                href={link.startsWith('http') ? link : `https://${link}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{t('common.notSpecified')}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
                <Button 
                    size="lg" 
                    onClick={() => handleReview('approved')} 
                    disabled={isReviewing}
                    className="bg-green-600 hover:bg-green-700"
                >
                    {isReviewing 
                        ? t('common.processing') 
                        : t('VerificationDetails.actions.approve')}
                </Button>
                <Button 
                    size="lg" 
                    variant="destructive" 
                    onClick={() => setIsRejectDialogOpen(true)} 
                    disabled={isReviewing}
                >
                    {t('VerificationDetails.actions.reject')}
                </Button>
            </div>

            {/* Rejection Reason Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('VerificationDetails.dialog.reject.title')}</DialogTitle>
                    </DialogHeader>
                    <Textarea
                        placeholder={t('VerificationDetails.dialog.reject.placeholder')}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        dir="auto"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={() => handleReview('rejected')}>
                            {t('VerificationDetails.dialog.reject.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}