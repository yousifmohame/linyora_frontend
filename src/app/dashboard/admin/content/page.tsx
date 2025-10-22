"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AdminNav from '@/components/dashboards/AdminNav';
import { 
  Edit3, 
  Eye, 
  EyeOff, 
  Save, 
  Loader2, 
  FileText,
  Palette,
  Sparkles,
  Crown,
  Search,
  RefreshCw,
  Download,
  Users,
  Globe,
  Shield,
  HelpCircle,
  Mail
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface ContentItem {
  id: number;
  section_key: string;
  title: string;
  content?: string;
  is_visible: boolean;
}

const ContentManagementPage = () => {
  const { t } = useTranslation();
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContentList();
  }, []);

  const fetchContentList = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/content');
      setContentList(response.data);
      if (response.data.length > 0) {
        fetchContentDetails(response.data[0].section_key);
      }
    } catch (error) {
      toast.error(t('ContentManagement.toast.fetchListError'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContentDetails = async (key: string) => {
    try {
      const response = await axios.get(`/content/${key}`);
      const fullContent: ContentItem = {
        ...contentList.find(c => c.section_key === key)!,
        content: response.data.content,
      };
      setSelectedContent(fullContent);
    } catch (error) {
      toast.error(t('ContentManagement.toast.fetchDetailsError'));
    }
  };

  const handleUpdate = async () => {
    if (!selectedContent) return;
    try {
      setIsUpdating(true);
      await axios.put(`/content/${selectedContent.section_key}`, {
        title: selectedContent.title,
        content: selectedContent.content,
        is_visible: selectedContent.is_visible,
      });
      toast.success(t('ContentManagement.toast.updateSuccess'));
      fetchContentList();
    } catch (error) {
      toast.error(t('ContentManagement.toast.updateError'));
    } finally {
      setIsUpdating(false);
    }
  };

  const getSectionIcon = (sectionKey: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      about: <Users className="h-4 w-4" />,
      terms: <Shield className="h-4 w-4" />,
      privacy: <Globe className="h-4 w-4" />,
      help: <HelpCircle className="h-4 w-4" />,
      contact: <Mail className="h-4 w-4" />,
    };
    return iconMap[sectionKey] || <FileText className="h-4 w-4" />;
  };

  const getSectionBadge = (sectionKey: string) => {
    const badgeMap: { [key: string]: { label: string; className: string } } = {
      about: { label: t('ContentManagement.sections.about'), className: "bg-blue-100 text-blue-700 border-blue-200" },
      terms: { label: t('ContentManagement.sections.terms'), className: "bg-orange-100 text-orange-700 border-orange-200" },
      privacy: { label: t('ContentManagement.sections.privacy'), className: "bg-green-100 text-green-700 border-green-200" },
      help: { label: t('ContentManagement.sections.help'), className: "bg-purple-100 text-purple-700 border-purple-200" },
      contact: { label: t('ContentManagement.sections.contact'), className: "bg-pink-100 text-pink-700 border-pink-200" },
    };
    return badgeMap[sectionKey] || { label: sectionKey, className: "bg-gray-100 text-gray-700 border-gray-200" };
  };

  const filteredContentList = contentList.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.section_key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: contentList.length,
    visible: contentList.filter(item => item.is_visible).length,
    hidden: contentList.filter(item => !item.is_visible).length,
  };

  const exportContent = () => {
    toast.info(t('ContentManagement.toast.exportPreparing'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-rose-700 font-medium">{t('ContentManagement.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-6 sm:p-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      
      <AdminNav />
      
      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Palette className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Crown className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('ContentManagement.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('ContentManagement.subtitle')}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-rose-600 mb-1">{stats.total}</div>
            <div className="text-rose-700 text-sm">{t('ContentManagement.stats.total')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.visible}</div>
            <div className="text-green-700 text-sm">{t('ContentManagement.stats.visible')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600 mb-1">{stats.hidden}</div>
            <div className="text-amber-700 text-sm">{t('ContentManagement.stats.hidden')}</div>
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
                  placeholder={t('ContentManagement.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={exportContent}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <Download className="w-4 h-4 ml-2" />
                {t('ContentManagement.export')}
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchContentList}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                {t('common.refresh')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <FileText className="w-6 h-6" />
                      {t('ContentManagement.sidebar.title')}
                    </CardTitle>
                    <CardDescription className="text-pink-100">
                      {t('ContentManagement.sidebar.description', { count: filteredContentList.length })}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {filteredContentList.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  {filteredContentList.map((item) => {
                    const badgeInfo = getSectionBadge(item.section_key);
                    return (
                      <div
                        key={item.id}
                        onClick={() => fetchContentDetails(item.section_key)}
                        className={`p-4 border-b border-rose-100 transition-all duration-300 cursor-pointer ${
                          selectedContent?.id === item.id 
                            ? 'bg-gradient-to-r from-rose-50 to-pink-50' 
                            : 'bg-white hover:bg-rose-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${
                              selectedContent?.id === item.id 
                                ? 'bg-rose-500 text-white' 
                                : 'bg-rose-100 text-rose-600'
                            }`}>
                              {getSectionIcon(item.section_key)}
                            </div>
                            <span className={`font-medium ${
                              selectedContent?.id === item.id ? 'text-rose-800' : 'text-gray-700'
                            }`}>
                              {item.title}
                            </span>
                          </div>
                          <Badge variant="outline" className={badgeInfo.className}>
                            {badgeInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-rose-600 font-mono text-xs bg-rose-50 px-2 py-1 rounded">
                            {item.section_key}
                          </span>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                            item.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {item.is_visible ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                            <span className="text-xs">
                              {item.is_visible ? t('common.visible') : t('common.hidden')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredContentList.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-rose-300 mx-auto mb-4" />
                      <h3 className="font-bold text-xl text-rose-800 mb-2">
                        {t('ContentManagement.sidebar.empty.title')}
                      </h3>
                      <p className="text-rose-600">
                        {searchTerm
                          ? t('ContentManagement.sidebar.empty.filtered')
                          : t('ContentManagement.sidebar.empty.noData')
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedContent ? (
              <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden h-full">
                <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Edit3 className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{t('ContentManagement.editor.title')}</CardTitle>
                        <CardDescription className="text-pink-100">
                          {selectedContent.title}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {getSectionBadge(selectedContent.section_key).label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-rose-800 font-medium text-lg">
                      {t('ContentManagement.editor.fields.title')}
                    </Label>
                    <Input
                      id="title"
                      value={selectedContent.title}
                      onChange={(e) => setSelectedContent({ ...selectedContent, title: e.target.value })}
                      className="bg-white border-rose-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-lg transition-all duration-300"
                      placeholder={t('ContentManagement.editor.fields.titlePlaceholder')}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="content" className="text-rose-800 font-medium text-lg">
                      {t('ContentManagement.editor.fields.content')}
                    </Label>
                    <Textarea
                      id="content"
                      value={selectedContent.content || ""}
                      onChange={(e) => setSelectedContent({ ...selectedContent, content: e.target.value })}
                      rows={12}
                      className="bg-white border-rose-200 focus:border-rose-400 rounded-2xl px-4 py-4 resize-none transition-all duration-300 min-h-[300px] font-medium leading-relaxed"
                      placeholder={t('ContentManagement.editor.fields.contentPlaceholder')}
                    />
                    <p className="text-rose-600 text-sm">
                      {t('ContentManagement.editor.fields.htmlNote')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-200">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        selectedContent.is_visible ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        {selectedContent.is_visible ? (
                          <Eye className="h-4 w-4 text-white" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div>
                        <Label htmlFor="is_visible" className="text-rose-800 font-medium cursor-pointer text-lg">
                          {t('ContentManagement.editor.fields.visibility.label')}
                        </Label>
                        <p className="text-rose-600 text-sm">
                          {selectedContent.is_visible 
                            ? t('ContentManagement.editor.fields.visibility.visible') 
                            : t('ContentManagement.editor.fields.visibility.hidden')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="is_visible"
                      checked={selectedContent.is_visible}
                      onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, is_visible: checked })}
                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                    />
                  </div>

                  <Button 
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-3 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin ml-2" />
                        {t('ContentManagement.actions.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 ml-2" />
                        {t('ContentManagement.actions.save')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl h-full flex items-center justify-center">
                <CardContent className="p-12 text-center">
                  <div className="p-4 bg-rose-100 rounded-2xl inline-block mb-4">
                    <FileText className="h-12 w-12 text-rose-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-rose-800 mb-2">
                    {t('ContentManagement.editor.empty.title')}
                  </h3>
                  <p className="text-rose-600 max-w-md">
                    {t('ContentManagement.editor.empty.description')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fecdd3;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fb7185;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e11d48;
        }
      `}</style>
    </div>
  );
};

export default ContentManagementPage;