'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Newspaper,
  Plus,
  Edit,
  Trash2,
  Play,
  FileText,
  Image as ImageIcon,
  Megaphone,
  Eye,
  EyeOff,
  Star,
  Calendar,
  User,
} from 'lucide-react';
import {
  NewsUpdate,
  NewsUpdateCreate,
  NewsType,
  getNewsTypeLabel,
  extractYouTubeId,
} from '@/types/news';
import {
  getNewsUpdates,
  createNewsUpdate,
  updateNewsUpdate,
  deleteNewsUpdate,
  seedSampleNews,
} from '@/lib/news-storage';

const typeIcons: Record<NewsType, typeof Play> = {
  video: Play,
  article: FileText,
  photo: ImageIcon,
  announcement: Megaphone,
};

const typeColors: Record<NewsType, string> = {
  video: 'bg-red-100 text-red-800',
  article: 'bg-blue-100 text-blue-800',
  photo: 'bg-green-100 text-green-800',
  announcement: 'bg-yellow-100 text-yellow-800',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface NewsFormData {
  type: NewsType;
  title: string;
  content: string;
  video_url: string;
  image_url: string;
  author: string;
  is_published: boolean;
  is_featured: boolean;
}

const defaultFormData: NewsFormData = {
  type: 'announcement',
  title: '',
  content: '',
  video_url: '',
  image_url: '',
  author: '',
  is_published: true,
  is_featured: false,
};

function NewsForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: NewsUpdate;
  onSubmit: (data: NewsUpdateCreate) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<NewsFormData>(
    initialData
      ? {
          type: initialData.type,
          title: initialData.title,
          content: initialData.content,
          video_url: initialData.video_url || '',
          image_url: initialData.image_url || '',
          author: initialData.author || '',
          is_published: initialData.is_published,
          is_featured: initialData.is_featured,
        }
      : defaultFormData
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: NewsUpdateCreate = {
      type: formData.type,
      title: formData.title,
      content: formData.content,
      video_url: formData.video_url || undefined,
      image_url: formData.image_url || undefined,
      author: formData.author || undefined,
      is_published: formData.is_published,
      is_featured: formData.is_featured,
      published_at: initialData?.published_at || new Date().toISOString(),
    };
    onSubmit(submitData);
  };

  const youtubeId = formData.video_url ? extractYouTubeId(formData.video_url) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value: NewsType) =>
            setFormData({ ...formData, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="announcement">Announcement</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="photo">Photo</SelectItem>
            <SelectItem value="article">Article</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter a title..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your update..."
          rows={4}
          required
        />
      </div>

      {formData.type === 'video' && (
        <div className="space-y-2">
          <Label htmlFor="video_url">YouTube URL</Label>
          <Input
            id="video_url"
            value={formData.video_url}
            onChange={(e) =>
              setFormData({ ...formData, video_url: e.target.value })
            }
            placeholder="https://youtube.com/watch?v=... or video ID"
          />
          {youtubeId && (
            <div className="mt-2 aspect-video bg-slate-900 rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
                title="Video preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}

      {/* Cover image - available for all types */}
      <div className="space-y-2">
        <Label htmlFor="image_url">
          Cover Image URL {formData.type !== 'photo' && '(optional)'}
        </Label>
        <Input
          id="image_url"
          value={formData.image_url}
          onChange={(e) =>
            setFormData({ ...formData, image_url: e.target.value })
          }
          placeholder="/images/photo.jpg or https://..."
        />
        <p className="text-xs text-muted-foreground">
          {formData.type === 'video'
            ? 'Leave empty to use YouTube thumbnail automatically'
            : 'Add a cover image for the carousel. Leave empty for default placeholder.'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Author (optional)</Label>
        <Input
          id="author"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          placeholder="Who is posting this?"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="is_published"
            checked={formData.is_published}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_published: checked })
            }
          />
          <Label htmlFor="is_published">Published</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="is_featured"
            checked={formData.is_featured}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_featured: checked })
            }
          />
          <Label htmlFor="is_featured">Featured</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Update
        </Button>
      </div>
    </form>
  );
}

export default function NewsManagementPage() {
  const [updates, setUpdates] = useState<NewsUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsUpdate | null>(null);

  async function loadNews() {
    await seedSampleNews();
    const news = await getNewsUpdates();
    setUpdates(news);
    setLoading(false);
  }

  useEffect(() => {
    loadNews();
  }, []);

  const handleCreate = async (data: NewsUpdateCreate) => {
    await createNewsUpdate(data);
    await loadNews();
    setDialogOpen(false);
  };

  const handleUpdate = async (data: NewsUpdateCreate) => {
    if (editingItem) {
      await updateNewsUpdate(editingItem.id, data);
      await loadNews();
      setEditingItem(null);
      setDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this update?')) {
      await deleteNewsUpdate(id);
      await loadNews();
    }
  };

  const handleTogglePublished = async (item: NewsUpdate) => {
    await updateNewsUpdate(item.id, { is_published: !item.is_published });
    await loadNews();
  };

  const handleToggleFeatured = async (item: NewsUpdate) => {
    await updateNewsUpdate(item.id, { is_featured: !item.is_featured });
    await loadNews();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-christina-red" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">News & Updates</h1>
            <p className="text-muted-foreground">
              Manage homepage news feed content
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Update
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Update' : 'Create New Update'}
              </DialogTitle>
            </DialogHeader>
            <NewsForm
              initialData={editingItem || undefined}
              onSubmit={editingItem ? handleUpdate : handleCreate}
              onCancel={() => {
                setDialogOpen(false);
                setEditingItem(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{updates.length}</div>
            <p className="text-sm text-muted-foreground">Total Updates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {updates.filter((u) => u.is_published).length}
            </div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {updates.filter((u) => u.is_featured).length}
            </div>
            <p className="text-sm text-muted-foreground">Featured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {updates.filter((u) => u.type === 'video').length}
            </div>
            <p className="text-sm text-muted-foreground">Videos</p>
          </CardContent>
        </Card>
      </div>

      {/* Updates List */}
      <Card>
        <CardHeader>
          <CardTitle>All Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {updates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No updates yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((item) => {
                const Icon = typeIcons[item.type];
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-lg ${typeColors[item.type]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        {!item.is_published && (
                          <Badge variant="outline" className="text-xs">
                            Draft
                          </Badge>
                        )}
                        {item.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.published_at)}
                        </span>
                        {item.author && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.author}
                          </span>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {getNewsTypeLabel(item.type)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePublished(item)}
                        title={item.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {item.is_published ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFeatured(item)}
                        title={item.is_featured ? 'Remove featured' : 'Feature'}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            item.is_featured
                              ? 'fill-yellow-400 text-yellow-400'
                              : ''
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingItem(item);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
