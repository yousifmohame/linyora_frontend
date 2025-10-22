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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700 text-lg font-medium">{t('BrowseModels.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      
      <Navigation />
      
      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Users className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Crown className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('BrowseModels.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('BrowseModels.subtitle')}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-rose-200">
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-rose-400" />
            <Input 
              placeholder={t('BrowseModels.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 pr-12 pl-4 rounded-2xl text-lg border-rose-200 focus:border-rose-400 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-rose-800 font-medium flex items-center gap-2">
                <Filter className="w-5 h-5" />
                {t('BrowseModels.filters.category.label')}
              </Label>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 6).map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
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
              <Label className="text-rose-800 font-medium flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
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
                    className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
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
        <div className="flex items-center justify-between">
          <p className="text-rose-700 text-lg">
            {t('BrowseModels.results.count', { count: filteredModels.length })}
          </p>
          <div className="flex items-center gap-2 text-rose-600">
            <Eye className="w-5 h-5" />
            <span>{t('BrowseModels.results.updated')}</span>
          </div>
        </div>
      </div>

      {filteredModels.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden text-center py-16 max-w-2xl mx-auto">
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-rose-100 to-pink-100 rounded-3xl flex items-center justify-center">
                <Users className="w-10 h-10 text-rose-400" />
              </div>
            </div>
            <h3 className="font-bold text-2xl text-rose-800 mb-2">{t('BrowseModels.empty.title')}</h3>
            <p className="text-rose-600 mb-6 max-w-md mx-auto">
              {t('BrowseModels.empty.description')}
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-bold"
            >
              {t('BrowseModels.empty.reset')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {filteredModels.map((model) => (
              <Link key={model.id} href={`/dashboard/models/${model.id}`}>
                <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full group">
                  {model.is_featured && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        <Star className="w-3 h-3 ml-1" />
                        {t('BrowseModels.badges.featured')}
                      </Badge>
                    </div>
                  )}

                  {model.is_verified && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        <Shield className="w-3 h-3 ml-1" />
                        {t('BrowseModels.badges.verified')}
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                      <div className="relative group">
                        <Avatar className="w-28 h-28 border-4 border-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
                          <AvatarImage src={model.profile_picture_url || ''} alt={model.name} />
                          <AvatarFallback className="text-3xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold">
                            {model.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {model.is_verified && (
                          <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 flex-1">
                      <div className="text-center mb-4">
                        <h3 className="font-bold text-xl text-rose-800 mb-2 flex items-center justify-center gap-2">
                          {model.name}
                          {model.is_featured && <Sparkles className="w-5 h-5 text-amber-500" />}
                        </h3>
                        
                        <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200 px-3 py-1 rounded-full text-sm">
                          {model.role_id === 3 ? t('BrowseModels.role.model') : t('BrowseModels.role.influencer')}
                        </Badge>
                      </div>

                      <p className="text-rose-700 text-sm leading-relaxed text-center mb-4 line-clamp-2 h-12">
                        {model.bio || t('BrowseModels.defaultBio')}
                      </p>

                      {model.location && (
                        <div className="flex items-center justify-center gap-2 text-rose-600 text-sm mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{model.location}</span>
                        </div>
                      )}

                      {model.categories && model.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mb-4">
                          {model.categories.slice(0, 3).map((category, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-lg"
                            >
                              {category}
                            </Badge>
                          ))}
                          {model.categories.length > 3 && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg">
                              +{model.categories.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4 text-center border-t border-rose-100 pt-4">
                        <div>
                          <div className="flex items-center justify-center gap-1 text-rose-600 mb-1">
                            <Users className="w-4 h-4" />
                            <span className="font-bold text-lg">{model.stats?.followers || '0'}</span>
                          </div>
                          <div className="text-xs text-rose-500">{t('BrowseModels.stats.followers')}</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                            <Heart className="w-4 h-4" />
                            <span className="font-bold text-lg">{model.stats?.engagement || '0%'}</span>
                          </div>
                          <div className="text-xs text-purple-500">{t('BrowseModels.stats.engagement')}</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                            <Star className="w-4 h-4" />
                            <span className="font-bold text-lg">{model.stats?.rating || '0'}</span>
                          </div>
                          <div className="text-xs text-amber-500">{t('BrowseModels.stats.rating')}</div>
                        </div>
                      </div>

                      {model.social_links && (
                        <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-rose-100">
                          {model.social_links.instagram && (
                            <Instagram className="w-5 h-5 text-rose-500 hover:text-rose-600 cursor-pointer" />
                          )}
                          {model.social_links.twitter && (
                            <Twitter className="w-5 h-5 text-blue-400 hover:text-blue-500 cursor-pointer" />
                          )}
                          {model.social_links.facebook && (
                            <Facebook className="w-5 h-5 text-blue-600 hover:text-blue-700 cursor-pointer" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-rose-100 bg-rose-50/50">
                      <Button 
                        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium py-3 transition-all duration-300 group-hover:shadow-lg"
                      >
                        {t('BrowseModels.actions.viewProfile')}
                        <Eye className="mr-2 w-4 h-4" />
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