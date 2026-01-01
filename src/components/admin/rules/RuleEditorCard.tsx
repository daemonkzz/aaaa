import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Pencil, Trash2, Eye, EyeOff, GripVertical, Check, X } from 'lucide-react';
import { RuleFormatToolbar } from './RuleFormatToolbar';
import { RuleContentRenderer } from '@/components/rules/RuleContentRenderer';
import type { Rule } from '@/types/rules';

interface RuleEditorCardProps {
  rule: Rule;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (updates: Partial<Rule>) => void;
  onDelete: () => void;
  formatDate: (dateString: string) => string;
}

export const RuleEditorCard: React.FC<RuleEditorCardProps> = ({
  rule,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  formatDate,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [localTitle, setLocalTitle] = useState(rule.title);
  const [localDescription, setLocalDescription] = useState(rule.description);

  // Reset local state when editing starts
  React.useEffect(() => {
    if (isEditing) {
      setLocalTitle(rule.title);
      setLocalDescription(rule.description);
      setShowPreview(false);
    }
  }, [isEditing, rule.title, rule.description]);

  const handleSave = () => {
    onUpdate({ title: localTitle, description: localDescription });
    onCancelEdit();
  };

  const handleCancel = () => {
    setLocalTitle(rule.title);
    setLocalDescription(rule.description);
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <div className="p-4 border border-primary/30 rounded-lg bg-primary/5 space-y-3">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <FileText className="w-4 h-4 text-primary" />
          <Input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Kural başlığı"
            className="flex-1"
            autoFocus
          />
        </div>

        {/* Format Toolbar */}
        <RuleFormatToolbar
          textareaRef={textareaRef}
          value={localDescription}
          onChange={setLocalDescription}
        />

        {/* Description Textarea */}
        <Textarea
          ref={textareaRef}
          value={localDescription}
          onChange={(e) => setLocalDescription(e.target.value)}
          placeholder="Kural açıklaması... (format araç çubuğunu kullanarak zengin içerik ekleyebilirsiniz)"
          className="min-h-[200px] font-mono text-sm rounded-t-none border-t-0"
          rows={8}
        />

        {/* Preview Toggle */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4" />
                Önizlemeyi Kapat
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Önizleme
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-1"
            >
              <X className="w-4 h-4" />
              İptal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="gap-1"
            >
              <Check className="w-4 h-4" />
              Kaydet
            </Button>
          </div>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="p-4 bg-background border border-border rounded-lg">
            <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
              Sitedeki Görünüm
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-primary">{rule.id}</span>
                <span className="font-semibold">{localTitle || 'Başlık'}</span>
              </div>
              <RuleContentRenderer content={localDescription || 'Açıklama...'} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // View mode
  return (
    <div className="p-3 border border-border rounded-lg bg-background hover:bg-muted/20 transition-colors">
      <div className="flex items-start gap-3">
        <GripVertical className="w-4 h-4 text-muted-foreground mt-1 cursor-grab" />
        <FileText className="w-4 h-4 text-primary mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium truncate">{rule.title}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onEdit}
              >
                <Pencil className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onDelete}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {rule.description.replace(/\*\*/g, '').replace(/''/g, '').substring(0, 150)}
            {rule.description.length > 150 && '...'}
          </p>
          {rule.lastUpdate && (
            <p className="text-xs text-muted-foreground mt-1">
              Son güncelleme: {formatDate(rule.lastUpdate)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RuleEditorCard;
