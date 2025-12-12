'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Search, 
  Star, 
  Heart, 
  Filter, 
  Crown, 
  Sparkles, 
  TrendingUp, 
  Eye,
  MapPin,
  Shield,
  CheckCircle,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react';
import Navigation from '@/components/dashboards/Navigation';
import { withSubscription } from '@/components/auth/withSubscription';

interface Model {
  id: number;
  name: string;
  role_id: number;
  profile_picture_url?: string;
  bio?: string;
  stats?: { 
    followers?: string; 
    engagement?: string;
    completed_projects?: number;
    rating?: number;
  };
  location?: string;
  categories?: string[];
  social_links?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  is_verified?: boolean;
  is_featured?: boolean;
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const Label = ({ children, className, ...props }: LabelProps) => (
  <label 
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} 
    {...props}
  >
    {children}
  </label>
);

function BrowseModelsPage() {
  const { t } = useTranslation();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'followers'>('name');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await api.get('/browse/models');
        setModels(response.data);
      } catch (error) {
        console.error('Failed to fetch models', error);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const categories = useMemo(() => {
    const allCategories = models.flatMap(model => model.categories || []);
    return ['all', ...Array.from(new Set(allCategories))];
  }, [models]);

  const filteredModels = useMemo(() => {
    let filtered = models.filter(model =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.categories?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(model => 
        model.categories?.includes(selectedCategory)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.stats?.rating || 0) - (a.stats?.rating || 0);
        case 'followers':
          const aFollowers = parseInt(a.stats?.followers?.replace('K', '000') || '0');
          const bFollowers = parseInt(b.stats?.followers?.replace('K', '000') || '0');
          return bFollowers - aFollowers;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [models, searchTerm, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-gray-600">{t('BrowseModels.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-4 sm:p-6 overflow-hidden">
      {/* Decorative background blobs - constrained to avoid overflow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      
      <Navigation />
      
      <header className="mb-6 sm:mb-8 text-center">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-rose-100">
            <Users className="h-6 w-6 text-rose-600" />
          </div>
          <Sparkles className="h-5 w-5 text-rose-300" />
          <Crown className="h-5 w-5 text-rose-300" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {t('BrowseModels.title')}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
          {t('BrowseModels.subtitle')}
        </p>
      </header>

      <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200/50">
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 rtl:left-auto rtl:right-3" />
            <Input 
              placeholder={t('BrowseModels.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-10 pr-4 rtl:pl-4 rtl:pr-10 rounded-xl text-sm border border-gray-200 focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="space-y-3">
              <Label className="text-gray-800 font-medium flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4" />
                {t('BrowseModels.filters.category.label')}
              </Label>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 6).map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? t('BrowseModels.filters.category.all') : category}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-800 font-medium flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                {t('BrowseModels.filters.sort.label')}
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'name', label: t('BrowseModels.filters.sort.name') },
                  { value: 'rating', label: t('BrowseModels.filters.sort.rating') },
                  { value: 'followers', label: t('BrowseModels.filters.sort.followers') }
                ].map(option => (
                  <Badge
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      sortBy === option.value
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
                    }`}
                    onClick={() => setSortBy(option.value as 'name' | 'rating' | 'followers')}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
          <p className="text-gray-700">
            {t('BrowseModels.results.count', { count: filteredModels.length })}
          </p>
          <div className="flex items-center gap-2 text-gray-600">
            <Eye className="w-4 h-4" />
            <span>{t('BrowseModels.results.updated')}</span>
          </div>
        </div>
      </div>

      {filteredModels.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-sm rounded-2xl text-center py-10">
            <CardContent>
              <div className="p-3 bg-rose-100 rounded-xl inline-block mb-3">
                <Users className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('BrowseModels.empty.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('BrowseModels.empty.description')}
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl text-sm"
              >
                {t('BrowseModels.empty.reset')}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredModels.map((model) => (
              <Link key={model.id} href={`/dashboard/models/${model.id}`} className="min-w-0">
                <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-sm rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full flex flex-col">
                  {model.is_featured && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                        <Star className="w-2.5 h-2.5 ml-0.5" />
                        {t('BrowseModels.badges.featured')}
                      </Badge>
                    </div>
                  )}

                  {model.is_verified && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                        <Shield className="w-2.5 h-2.5 ml-0.5" />
                        {t('BrowseModels.badges.verified')}
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="relative h-40 sm:h-48 bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
                      <div className="relative">
                        <Avatar className="w-20 sm:w-24 h-20 sm:h-24 border-4 border-white shadow-md">
                          <AvatarImage src={model.profile_picture_url || ''} alt={model.name} />
                          <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold">
                            {model.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {model.is_verified && (
                          <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-blue-500 text-white p-1 rounded-full shadow">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
                      <div className="text-center mb-3">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 flex items-center justify-center gap-1.5">
                          {model.name}
                          {model.is_featured && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                        </h3>
                        <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200 px-2 py-0.5 rounded-full text-xs">
                          {model.role_id === 3 ? t('BrowseModels.role.model') : t('BrowseModels.role.influencer')}
                        </Badge>
                      </div>

                      <p className="text-gray-600 text-xs sm:text-sm text-center mb-3 line-clamp-2 flex-1">
                        {model.bio || t('BrowseModels.defaultBio')}
                      </p>

                      {model.location && (
                        <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs mb-3">
                          <MapPin className="w-3 h-3" />
                          <span>{model.location}</span>
                        </div>
                      )}

                      {model.categories && model.categories.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1 mb-3">
                          {model.categories.slice(0, 3).map((category, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded"
                            >
                              {category}
                            </Badge>
                          ))}
                          {model.categories.length > 3 && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded">
                              +{model.categories.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-200/50 pt-3 mt-auto">
                        <div>
                          <div className="flex items-center justify-center gap-1 text-gray-700 mb-0.5">
                            <Users className="w-3 h-3" />
                            <span className="font-bold text-sm">{model.stats?.followers || '0'}</span>
                          </div>
                          <div className="text-[10px] text-gray-500">{t('BrowseModels.stats.followers')}</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 text-gray-700 mb-0.5">
                            <Heart className="w-3 h-3" />
                            <span className="font-bold text-sm">{model.stats?.engagement || '0%'}</span>
                          </div>
                          <div className="text-[10px] text-gray-500">{t('BrowseModels.stats.engagement')}</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 text-gray-700 mb-0.5">
                            <Star className="w-3 h-3" />
                            <span className="font-bold text-sm">{model.stats?.rating || '0'}</span>
                          </div>
                          <div className="text-[10px] text-gray-500">{t('BrowseModels.stats.rating')}</div>
                        </div>
                      </div>

                      {model.social_links && (
                        <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-gray-200/50">
                          {model.social_links.instagram && (
                            <Instagram className="w-4 h-4 text-rose-500 hover:text-rose-600 cursor-pointer" />
                          )}
                          {model.social_links.twitter && (
                            <Twitter className="w-4 h-4 text-blue-400 hover:text-blue-500 cursor-pointer" />
                          )}
                          {model.social_links.facebook && (
                            <Facebook className="w-4 h-4 text-blue-600 hover:text-blue-700 cursor-pointer" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-gray-200/50 bg-gray-50/30">
                      <Button 
                        className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-lg text-sm h-9"
                      >
                        <Eye className="mr-2 w-3.5 h-3.5" />
                        {t('BrowseModels.actions.viewProfile')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default withSubscription(BrowseModelsPage);