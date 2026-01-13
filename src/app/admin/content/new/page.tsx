'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Upload, Loader2, Music, Mic, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Category } from '@/types';

export default function NewContentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'audio' as 'audio' | 'podcast' | 'pdf',
    category_id: '',
    author: '',
    access_level: 'free' as 'free' | 'premium',
    is_published: true,
    is_featured: false,
  });

  const [contentFile, setContentFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (data) setCategories(data);
    }
    fetchCategories();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentFile) {
      alert('Por favor selecciona un archivo de contenido');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Subiendo archivo de contenido...');

    try {
      // Upload content file
      const contentExt = contentFile.name.split('.').pop();
      const contentPath = `${crypto.randomUUID()}.${contentExt}`;
      const bucket = formData.content_type === 'pdf' ? 'pdf-files' : 'audio-files';

      console.log('Uploading to bucket:', bucket, 'path:', contentPath);

      const { error: contentError } = await supabase.storage
        .from(bucket)
        .upload(contentPath, contentFile);

      if (contentError) {
        console.error('Storage upload error:', JSON.stringify(contentError, null, 2));
        throw new Error(`Error subiendo archivo: ${contentError.message}`);
      }

      const {
        data: { publicUrl: fileUrl },
      } = supabase.storage.from(bucket).getPublicUrl(contentPath);

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        setUploadProgress('Subiendo imagen de portada...');
        const thumbExt = thumbnailFile.name.split('.').pop();
        const thumbPath = `${crypto.randomUUID()}.${thumbExt}`;

        const { error: thumbError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbPath, thumbnailFile);

        if (!thumbError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('thumbnails').getPublicUrl(thumbPath);
          thumbnailUrl = publicUrl;
        }
      }

      // Get audio duration if it's an audio file
      let duration = null;
      if (formData.content_type !== 'pdf') {
        duration = await getAudioDuration(contentFile);
      }

      setUploadProgress('Guardando información...');

      // Create content record
      const slug = generateSlug(formData.title);
      const insertData = {
        title: formData.title,
        slug,
        description: formData.description || null,
        content_type: formData.content_type,
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl,
        category_id: formData.category_id || null,
        author: formData.author || null,
        duration,
        access_level: formData.access_level,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
      };

      console.log('Inserting content:', insertData);

      const { error: insertError } = await supabase.from('content').insert(insertData);

      if (insertError) {
        console.error('Insert error:', JSON.stringify(insertError, null, 2));
        throw new Error(`Error guardando en BD: ${insertError.message}`);
      }

      router.push('/admin/content');
    } catch (error: unknown) {
      console.error('Error creating content:', JSON.stringify(error, null, 2));
      let errorMessage = 'Error desconocido';
      if (error && typeof error === 'object') {
        const err = error as { message?: string; error_description?: string; details?: string };
        errorMessage = err.message || err.error_description || err.details || JSON.stringify(error);
      }
      alert(`Error al crear el contenido: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  // Generate URL-friendly slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .trim()
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      + '-' + Date.now().toString(36); // Add unique suffix
  };

  const getAudioDuration = (file: File): Promise<number | null> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        resolve(Math.round(audio.duration));
      });
      audio.addEventListener('error', () => {
        resolve(null);
      });
      audio.src = URL.createObjectURL(file);
    });
  };

  const contentTypeIcons = {
    audio: Music,
    podcast: Mic,
    pdf: FileText,
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/content">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Contenido</h1>
          <p className="text-muted-foreground">Sube nuevo contenido a la plataforma</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Type */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de contenido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {(['audio', 'podcast', 'pdf'] as const).map((type) => {
                const Icon = contentTypeIcons[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, content_type: type })}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      formData.content_type === type
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium capitalize">{type}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Nombre del contenido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Nombre del autor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción del contenido"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Files */}
        <Card>
          <CardHeader>
            <CardTitle>Archivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                Archivo de contenido *
                {formData.content_type === 'pdf'
                  ? ' (PDF)'
                  : ' (MP3, WAV, M4A, OGG)'}
              </Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept={
                    formData.content_type === 'pdf'
                      ? '.pdf'
                      : 'audio/mpeg,audio/wav,audio/mp4,audio/ogg,.mp3,.wav,.m4a,.ogg'
                  }
                  onChange={(e) => setContentFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="content-file"
                />
                <label htmlFor="content-file" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  {contentFile ? (
                    <p className="text-sm font-medium">{contentFile.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Haz clic para seleccionar un archivo
                    </p>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagen de portada (opcional)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="thumbnail-file"
                />
                <label htmlFor="thumbnail-file" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  {thumbnailFile ? (
                    <p className="text-sm font-medium">{thumbnailFile.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Haz clic para seleccionar una imagen
                    </p>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nivel de acceso</Label>
              <Select
                value={formData.access_level}
                onValueChange={(value: 'free' | 'premium') =>
                  setFormData({ ...formData, access_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratis</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Publicar ahora</Label>
                <p className="text-sm text-muted-foreground">
                  El contenido será visible para los usuarios
                </p>
              </div>
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_published: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Destacar</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar en la sección de destacados
                </p>
              </div>
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_featured: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/content">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploadProgress || 'Guardando...'}
              </>
            ) : (
              'Crear contenido'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
