import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ImageIcon, Check } from 'lucide-react';

interface GalleryImage {
  id: string;
  file_name: string;
  url: string;
}

interface GalleryPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
}

export const GalleryPickerModal = ({ open, onClose, onSelect }: GalleryPickerModalProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      loadImages();
      setSelectedUrls([]);
    }
  }, [open]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, file_name, url')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Galeri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url)
        ? prev.filter((u) => u !== url)
        : [...prev, url]
    );
  };

  const handleConfirm = () => {
    onSelect(selectedUrls);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Galeriden Görsel Seç
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Galeride görsel bulunamadı</p>
              <p className="text-sm mt-1">Önce Medya Galeri sayfasından görsel yükleyin</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4">
              {images.map((image) => {
                const isSelected = selectedUrls.includes(image.url);
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => toggleSelection(image.url)}
                    className={`
                      relative aspect-video rounded-lg overflow-hidden border-2 transition-all
                      hover:ring-2 hover:ring-primary/50
                      ${isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-border'}
                    `}
                  >
                    <img
                      src={image.url}
                      alt={image.file_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Selection Overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    {/* Checkbox */}
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelection(image.url)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-background/80 border-border"
                      />
                    </div>

                    {/* Filename */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs text-white truncate">
                        {image.file_name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="border-t border-border pt-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {selectedUrls.length} görsel seçildi
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedUrls.length === 0}
              >
                <Check className="w-4 h-4 mr-1" />
                Ekle ({selectedUrls.length})
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
