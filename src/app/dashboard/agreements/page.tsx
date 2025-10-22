"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  CheckCircle,
  Clock,
  XCircle,
  Hourglass,
  Star,
  Sparkles,
  Crown,
  Users,
  Handshake,
  TrendingUp,
  Search,
  RefreshCw,
  Download,
  Eye
} from "lucide-react";
import Navigation from "@/components/dashboards/Navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Agreement {
  id: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  modelName: string;
  offerTitle: string;
  offerPrice: number;
  created_at: string;
}

const StarRating = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (rating: number) => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center space-x-2" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-8 w-8 cursor-pointer transition-all duration-200 hover:scale-110 ${
            rating >= star ? "text-amber-400 fill-amber-400" : "text-gray-300 hover:text-amber-200"
          }`}
          onClick={() => setRating(star)}
          aria-label={t('MerchantAgreements.rating.star', { count: star })}
        />
      ))}
    </div>
  );
};

const MerchantAgreementsPage = () => {
  const { t, i18n } = useTranslation();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [agreementToReview, setAgreementToReview] = useState<Agreement | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchAgreements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/agreements/my-agreements");
      setAgreements(response.data);
    } catch (error) {
      toast.error(t('MerchantAgreements.toast.fetchError'));
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAgreements();
  };

  const exportAgreements = () => {
    toast.info(t('MerchantAgreements.toast.exportPreparing'));
  };

  const handleOpenReviewModal = (agreement: Agreement) => {
    setAgreementToReview(agreement);
    setRating(0);
    setComment("");
  };

  const handleSubmitReviewAndComplete = async () => {
    if (!agreementToReview) return;
    if (rating === 0) {
      toast.error(t('MerchantAgreements.toast.ratingRequired'));
      return;
    }

    setSubmittingId(agreementToReview.id);

    const completePromise = api.put(`/agreements/${agreementToReview.id}/complete`);
    const reviewPromise = api.post(`/agreements/${agreementToReview.id}/review`, { rating, comment });

    toast.promise(Promise.all([completePromise, reviewPromise]), {
      loading: t('MerchantAgreements.toast.completing'),
      success: () => {
        fetchAgreements();
        setAgreementToReview(null);
        return t('MerchantAgreements.toast.completeSuccess');
      },
      error: (err: unknown) => {
        setSubmittingId(null);
        if (axios.isAxiosError(err)) {
          return err.response?.data?.message || t('MerchantAgreements.toast.completeError');
        }
        return t('MerchantAgreements.toast.unexpectedError');
      },
    });
  };

  const getStatusBadge = (status: Agreement["status"]) => {
    const statusConfig = {
      pending: {
        icon: <Hourglass className="h-3 w-3 ml-1" />,
        label: t('MerchantAgreements.status.pending'),
        className: "bg-amber-50 text-amber-700 border-amber-200",
      },
      accepted: {
        icon: <Clock className="h-3 w-3 ml-1" />,
        label: t('MerchantAgreements.status.accepted'),
        className: "bg-blue-100 text-blue-700 border-blue-200",
      },
      rejected: {
        icon: <XCircle className="h-3 w-3 ml-1" />,
        label: t('MerchantAgreements.status.rejected'),
        className: "bg-red-100 text-red-700 border-red-200",
      },
      completed: {
        icon: <CheckCircle className="h-3 w-3 ml-1" />,
        label: t('MerchantAgreements.status.completed'),
        className: "bg-green-100 text-green-700 border-green-200",
      },
    };

    const config = statusConfig[status];

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const filteredAgreements = agreements.filter(agreement =>
    agreement.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agreement.offerTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: agreements.length,
    pending: agreements.filter(a => a.status === 'pending').length,
    accepted: agreements.filter(a => a.status === 'accepted').length,
    completed: agreements.filter(a => a.status === 'completed').length,
    totalValue: agreements.reduce((sum, a) => sum + Number(a.offerPrice || 0), 0),
  };

  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700 font-medium">{t('MerchantAgreements.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      
      <Navigation />
      
      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Handshake className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Crown className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('MerchantAgreements.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('MerchantAgreements.subtitle')}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-rose-600 mb-1">{stats.total}</div>
            <div className="text-rose-700 text-sm">{t('MerchantAgreements.stats.total')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600 mb-1">{stats.pending}</div>
            <div className="text-amber-700 text-sm">{t('MerchantAgreements.stats.pending')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.accepted}</div>
            <div className="text-blue-700 text-sm">{t('MerchantAgreements.stats.accepted')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.completed}</div>
            <div className="text-green-700 text-sm">{t('MerchantAgreements.stats.completed')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {new Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(stats.totalValue)}
            </div>
            <div className="text-purple-700 text-sm">{t('MerchantAgreements.stats.totalValue')}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
                <Input
                  placeholder={t('MerchantAgreements.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={exportAgreements}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <Download className="w-4 h-4 ml-2" />
                {t('MerchantAgreements.export')}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                {t('common.refresh')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {filteredAgreements.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl text-center py-12">
            <CardContent>
              <div className="p-4 bg-rose-100 rounded-2xl inline-block mb-4">
                <Handshake className="w-12 h-12 text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold text-rose-800 mb-2">
                {t('MerchantAgreements.empty.title')}
              </h3>
              <p className="text-rose-600 mb-6">
                {searchTerm
                  ? t('MerchantAgreements.empty.filtered')
                  : t('MerchantAgreements.empty.noData')
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                >
                  {t('MerchantAgreements.empty.clearSearch')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Handshake className="w-6 h-6" />
                    {t('MerchantAgreements.table.title')}
                  </CardTitle>
                  <CardDescription className="text-pink-100">
                    {t('MerchantAgreements.table.description', { count: filteredAgreements.length })}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {t('MerchantAgreements.table.count', { count: filteredAgreements.length })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                    <TableHead className="text-rose-800 font-bold">{t('MerchantAgreements.table.headers.model')}</TableHead>
                    <TableHead className="text-rose-800 font-bold">{t('MerchantAgreements.table.headers.offer')}</TableHead>
                    <TableHead className="text-rose-800 font-bold">{t('MerchantAgreements.table.headers.status')}</TableHead>
                    <TableHead className="text-rose-800 font-bold">{t('MerchantAgreements.table.headers.value')}</TableHead>
                    <TableHead className="text-rose-800 font-bold text-left">{t('MerchantAgreements.table.headers.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgreements.map((agreement) => (
                    <TableRow key={agreement.id} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="font-medium text-rose-900">{agreement.modelName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-rose-700">{agreement.offerTitle}</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(agreement.status)}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-rose-600 text-lg">
                          {new Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(Number(agreement.offerPrice ?? 0))}
                        </div>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center gap-2">
                          {agreement.status === "accepted" && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenReviewModal(agreement)}
                              disabled={submittingId === agreement.id}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl"
                            >
                              {submittingId === agreement.id
                                ? t('MerchantAgreements.actions.completing')
                                : t('MerchantAgreements.actions.confirmCompletion')}
                            </Button>
                          )}
                          {agreement.status === "completed" && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 ml-1" />
                              {t('MerchantAgreements.status.completed')}
                            </Badge>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl"
                          >
                            <Eye className="w-4 h-4 ml-2" />
                            {t('MerchantAgreements.actions.details')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={!!agreementToReview} onOpenChange={() => setAgreementToReview(null)}>
          <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-800 text-2xl">
                <Star className="w-6 h-6 text-amber-500" />
                {t('MerchantAgreements.dialog.review.title')}
              </DialogTitle>
              <DialogDescription className="text-rose-600 text-lg">
                {t('MerchantAgreements.dialog.review.description', { name: agreementToReview?.modelName })}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-4 text-center">
                <Label htmlFor="rating" className="text-rose-800 font-medium text-lg block">
                  {t('MerchantAgreements.dialog.review.ratingLabel')}
                </Label>
                <StarRating rating={rating} setRating={setRating} />
                <div className="text-amber-600 text-sm">
                  {rating > 0 && t('MerchantAgreements.dialog.review.ratingValue', { count: rating })}
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="comment" className="text-rose-800 font-medium">
                  {t('MerchantAgreements.dialog.review.commentLabel')}
                </Label>
                <Textarea
                  id="comment"
                  placeholder={t('MerchantAgreements.dialog.review.commentPlaceholder')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="border-rose-200 focus:border-rose-400 rounded-xl min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setAgreementToReview(null)}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSubmitReviewAndComplete}
                disabled={submittingId === agreementToReview?.id || rating === 0}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl flex-1"
              >
                {submittingId === agreementToReview?.id
                  ? t('MerchantAgreements.dialog.review.confirming')
                  : t('MerchantAgreements.dialog.review.confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MerchantAgreementsPage;