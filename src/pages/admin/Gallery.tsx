import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Loader2,
  Upload,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  X,
  FileImage,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface GalleryImage {
  id: string;
  file_name: string;
  file_path: string;
  url: string;
  original_size: number;
  optimized_size: number;
  width: number | null;
  height: number | null;
  created_at: string;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status: 'compressing' | 'uploading' | 'done' | 'error';
  originalSize: number;
  optimizedSize?: number;
}

const GalleryContent = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load images
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading images:', error);
        toast.error('Görseller yüklenirken hata oluştu');
        return;
      }

      setImages(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });
  };

  const processAndUploadFile = async (file: File, fileId: string) => {
    try {
      const originalSize = file.size;

      // Update status to compressing
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'compressing' as const, progress: 10 } : f
      ));

      // Compress and convert to WebP
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp' as const,
        initialQuality: 0.8,
      };

      const compressedFile = await imageCompression(file, options);
      const optimizedSize = compressedFile.size;

      // Get dimensions
      const dimensions = await getImageDimensions(compressedFile);

      // Update status to uploading
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'uploading' as const, progress: 40, optimizedSize } : f
      ));

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${randomStr}.webp`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, compressedFile, {
          contentType: 'image/webp',
          cacheControl: '31536000',
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 70 } : f
      ));

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .insert({
          file_name: fileName,
          file_path: uploadData.path,
          url: urlData.publicUrl,
          original_size: originalSize,
          optimized_size: optimizedSize,
          width: dimensions.width,
          height: dimensions.height,
          uploaded_by: user?.id,
        });

      if (dbError) {
        throw dbError;
      }

      // Update status to done
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'done' as const, progress: 100 } : f
      ));

      // Remove from uploading list after delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'error' as const } : f
      ));
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Filter only images
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      toast.error('Sadece görsel dosyaları yükleyebilirsiniz');
      return;
    }

    // Add files to uploading queue
    const newUploadingFiles: UploadingFile[] = imageFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: file.name,
      progress: 0,
      status: 'compressing' as const,
      originalSize: file.size,
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Process files
    for (let i = 0; i < imageFiles.length; i++) {
      await processAndUploadFile(imageFiles[i], newUploadingFiles[i].id);
    }

    // Reload images
    loadImages();
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: true,
  });

  const toggleImageSelection = (id: string) => {
    const newSet = new Set(selectedImages);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedImages(newSet);
  };

  const selectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img.id)));
    }
  };

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success('Bağlantı kopyalandı!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Kopyalama başarısız');
    }
  };

  const deleteSelected = async () => {
    try {
      const selectedArray = Array.from(selectedImages);
      const imagesToDelete = images.filter(img => selectedArray.includes(img.id));

      // Delete from storage
      const filePaths = imagesToDelete.map(img => img.file_path);
      const { error: storageError } = await supabase.storage
        .from('gallery')
        .remove(filePaths);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .in('id', selectedArray);

      if (dbError) {
        throw dbError;
      }

      toast.success(`${selectedArray.length} görsel silindi`);
      setSelectedImages(new Set());
      setDeleteConfirm(false);
      loadImages();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Silme işlemi başarısız');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Medya Galeri</h2>
          <p className="text-muted-foreground">{images.length} görsel</p>
        </div>

        <div className="flex items-center gap-3">
          {images.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              {selectedImages.size === images.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
            </Button>
          )}
          
          {selectedImages.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {selectedImages.size} Seçili Sil
            </Button>
          )}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-300 mb-8
          ${isDragActive 
            ? 'border-primary bg-primary/10 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:bg-card/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragActive ? 'bg-primary/20' : 'bg-muted'}
          `}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">
              {isDragActive ? 'Bırakın!' : 'Görselleri sürükleyip bırakın'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              veya dosya seçmek için tıklayın (JPG, PNG, WebP)
            </p>
          </div>
          <Badge variant="secondary" className="mt-2">
            Otomatik WebP dönüşümü • Maks 1920px • %80 kalite
          </Badge>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mb-8 space-y-3">
          <h3 className="text-sm font-medium text-foreground mb-3">Yükleniyor...</h3>
          {uploadingFiles.map(file => (
            <div
              key={file.id}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <FileImage className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(file.originalSize)}
                    {file.optimizedSize && (
                      <span className="text-green-500 ml-1">
                        → {formatBytes(file.optimizedSize)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {file.status === 'compressing' && (
                    <Badge variant="outline" className="text-xs">Sıkıştırılıyor...</Badge>
                  )}
                  {file.status === 'uploading' && (
                    <Badge variant="outline" className="text-xs">Yükleniyor...</Badge>
                  )}
                  {file.status === 'done' && (
                    <Badge className="bg-green-500/20 text-green-500 text-xs">
                      <Check className="w-3 h-3 mr-1" /> Tamamlandı
                    </Badge>
                  )}
                  {file.status === 'error' && (
                    <Badge variant="destructive" className="text-xs">
                      <X className="w-3 h-3 mr-1" /> Hata
                    </Badge>
                  )}
                </div>
              </div>
              <Progress value={file.progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Henüz görsel yok</p>
          <p className="text-sm text-muted-foreground mt-1">
            Yukarıdaki alana görsel sürükleyerek başlayın
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className={`
                relative group rounded-lg overflow-hidden border-2 transition-all
                ${selectedImages.has(image.id) 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedImages.has(image.id)}
                  onCheckedChange={() => toggleImageSelection(image.id)}
                  className="bg-background/80 backdrop-blur"
                />
              </div>

              {/* Image */}
              <div className="aspect-square bg-muted">
                <img
                  src={image.url}
                  alt={image.file_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => copyToClipboard(image.url, image.id)}
                >
                  {copiedId === image.id ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      URL Kopyala
                    </>
                  )}
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                  {image.width && image.height && (
                    <p>{image.width}×{image.height}</p>
                  )}
                  <p>{formatBytes(image.optimized_size)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Görselleri Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedImages.size} görsel kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={deleteSelected}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Gallery = () => {
  return (
    <AdminLayout activeTab="galeri">
      <GalleryContent />
    </AdminLayout>
  );
};

export default Gallery;
