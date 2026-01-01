import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  Image,
  Code,
  Quote,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Bold,
  Italic,
  FolderOpen,
} from 'lucide-react';
import type { ContentBlock } from '@/types/update';
import { GalleryPickerModal } from './GalleryPickerModal';

interface RichTextEditorProps {
  content: ContentBlock[];
  onChange: (content: ContentBlock[]) => void;
}

type BlockType = ContentBlock['type'];

const blockTypeLabels: Record<BlockType, { label: string; icon: React.ReactNode }> = {
  heading: { label: 'Başlık', icon: <Heading1 className="w-4 h-4" /> },
  subheading: { label: 'Alt Başlık', icon: <Heading2 className="w-4 h-4" /> },
  paragraph: { label: 'Paragraf', icon: <Type className="w-4 h-4" /> },
  list: { label: 'Liste', icon: <List className="w-4 h-4" /> },
  image: { label: 'Görsel', icon: <Image className="w-4 h-4" /> },
  code: { label: 'Kod Bloğu', icon: <Code className="w-4 h-4" /> },
  quote: { label: 'Alıntı', icon: <Quote className="w-4 h-4" /> },
};

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [newBlockType, setNewBlockType] = useState<BlockType>('paragraph');
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [activeImageBlockId, setActiveImageBlockId] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      content: type === 'list' ? [''] : '',
      level: type === 'heading' ? 1 : undefined,
    };
    onChange([...content, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(
      content.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const removeBlock = (id: string) => {
    onChange(content.filter((block) => block.id !== id));
  };

  const openGalleryPicker = (blockId: string) => {
    setActiveImageBlockId(blockId);
    setGalleryPickerOpen(true);
  };

  const handleGallerySelect = (urls: string[]) => {
    if (urls.length === 0 || !activeImageBlockId) return;

    const currentIndex = content.findIndex((b) => b.id === activeImageBlockId);
    if (currentIndex === -1) return;

    // Update the current block with the first image
    const updatedContent = content.map((block) =>
      block.id === activeImageBlockId ? { ...block, content: urls[0] } : block
    );

    // If multiple images selected, create new blocks for the rest
    if (urls.length > 1) {
      const newBlocks: ContentBlock[] = urls.slice(1).map((url) => ({
        id: generateId(),
        type: 'image' as const,
        content: url,
      }));

      // Insert new blocks right after the current block
      updatedContent.splice(currentIndex + 1, 0, ...newBlocks);
    }

    onChange(updatedContent);
    setActiveImageBlockId(null);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = content.findIndex((block) => block.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === content.length - 1)
    ) {
      return;
    }

    const newContent = [...content];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newContent[index], newContent[newIndex]] = [newContent[newIndex], newContent[index]];
    onChange(newContent);
  };

  const updateListItem = (blockId: string, itemIndex: number, value: string) => {
    const block = content.find((b) => b.id === blockId);
    if (block && Array.isArray(block.content)) {
      const newItems = [...block.content];
      newItems[itemIndex] = value;
      updateBlock(blockId, { content: newItems });
    }
  };

  const addListItem = (blockId: string) => {
    const block = content.find((b) => b.id === blockId);
    if (block && Array.isArray(block.content)) {
      updateBlock(blockId, { content: [...block.content, ''] });
    }
  };

  const removeListItem = (blockId: string, itemIndex: number) => {
    const block = content.find((b) => b.id === blockId);
    if (block && Array.isArray(block.content) && block.content.length > 1) {
      const newItems = block.content.filter((_, i) => i !== itemIndex);
      updateBlock(blockId, { content: newItems });
    }
  };

  // Text formatting helpers
  const wrapText = (text: string, wrapper: string) => {
    return `${wrapper}${text}${wrapper}`;
  };

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    return (
      <Card key={block.id} className="p-4 bg-card border-border">
        <div className="flex items-start gap-3">
          {/* Drag Handle & Controls */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => moveBlock(block.id, 'up')}
              disabled={index === 0}
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => moveBlock(block.id, 'down')}
              disabled={index === content.length - 1}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>

          {/* Block Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              {blockTypeLabels[block.type].icon}
              <span>{blockTypeLabels[block.type].label}</span>
              {block.type === 'heading' && (
                <Select
                  value={String(block.level || 1)}
                  onValueChange={(v) => updateBlock(block.id, { level: Number(v) as 1 | 2 | 3 })}
                >
                  <SelectTrigger className="h-6 w-20 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">H1</SelectItem>
                    <SelectItem value="2">H2</SelectItem>
                    <SelectItem value="3">H3</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Paragraph, Heading, Subheading */}
            {['paragraph', 'heading', 'subheading'].includes(block.type) && (
              <div className="space-y-2">
                {block.type === 'paragraph' && (
                  <div className="flex gap-1 mb-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        const selection = window.getSelection()?.toString();
                        if (selection) {
                          const newContent = (block.content as string).replace(
                            selection,
                            `**${selection}**`
                          );
                          updateBlock(block.id, { content: newContent });
                        }
                      }}
                      title="Kalın (**text**)"
                    >
                      <Bold className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        const selection = window.getSelection()?.toString();
                        if (selection) {
                          const newContent = (block.content as string).replace(
                            selection,
                            `*${selection}*`
                          );
                          updateBlock(block.id, { content: newContent });
                        }
                      }}
                      title="İtalik (*text*)"
                    >
                      <Italic className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        const selection = window.getSelection()?.toString();
                        if (selection) {
                          const newContent = (block.content as string).replace(
                            selection,
                            `\`${selection}\``
                          );
                          updateBlock(block.id, { content: newContent });
                        }
                      }}
                      title="Kod (`text`)"
                    >
                      <Code className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <Textarea
                  value={block.content as string}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder={
                    block.type === 'heading'
                      ? 'Başlık yazın...'
                      : block.type === 'subheading'
                      ? 'Alt başlık yazın...'
                      : 'Paragraf içeriği... (Kalın: **text**, İtalik: *text*, Kod: `text`)'
                  }
                  className="min-h-[80px] resize-y"
                />
              </div>
            )}

            {/* List */}
            {block.type === 'list' && (
              <div className="space-y-2">
                {(block.content as string[]).map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0">
                      {itemIndex + 1}
                    </span>
                    <Input
                      value={item}
                      onChange={(e) => updateListItem(block.id, itemIndex, e.target.value)}
                      placeholder="Liste öğesi..."
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeListItem(block.id, itemIndex)}
                      disabled={(block.content as string[]).length <= 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem(block.id)}
                  className="mt-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Öğe Ekle
                </Button>
              </div>
            )}

            {/* Image */}
            {block.type === 'image' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={block.content as string}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Görsel URL'si..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => openGalleryPicker(block.id)}
                    className="shrink-0"
                  >
                    <FolderOpen className="w-4 h-4 mr-1" />
                    Galeriden Seç
                  </Button>
                </div>
                {block.content && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted max-w-md">
                    <img
                      src={block.content as string}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Code Block */}
            {block.type === 'code' && (
              <Textarea
                value={block.content as string}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="Kod bloğu..."
                className="font-mono text-sm min-h-[120px] bg-muted/50"
              />
            )}

            {/* Quote */}
            {block.type === 'quote' && (
              <div className="pl-4 border-l-2 border-primary">
                <Textarea
                  value={block.content as string}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder="Alıntı metni..."
                  className="min-h-[60px] italic"
                />
              </div>
            )}
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => removeBlock(block.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Block List */}
      {content.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Type className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Henüz içerik bloğu eklenmedi
          </p>
          <p className="text-sm text-muted-foreground">
            Aşağıdaki butonları kullanarak içerik ekleyin
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {content.map((block, index) => renderBlockEditor(block, index))}
        </div>
      )}

      {/* Add Block Toolbar */}
      <div className="border border-border rounded-lg p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground mb-3">İçerik Bloğu Ekle:</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(blockTypeLabels) as BlockType[]).map((type) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => addBlock(type)}
              className="gap-2"
            >
              {blockTypeLabels[type].icon}
              {blockTypeLabels[type].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Gallery Picker Modal */}
      <GalleryPickerModal
        open={galleryPickerOpen}
        onClose={() => setGalleryPickerOpen(false)}
        onSelect={handleGallerySelect}
      />
    </div>
  );
};
