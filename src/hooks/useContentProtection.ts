import { useEffect, useCallback } from "react";

interface ContentProtectionOptions {
  disableCopy?: boolean;
  disableContextMenu?: boolean;
  disablePrint?: boolean;
  disableKeyboardShortcuts?: boolean;
  disableTextSelection?: boolean;
}

export const useContentProtection = (options: ContentProtectionOptions = {}) => {
  const {
    disableCopy = true,
    disableContextMenu = true,
    disablePrint = true,
    disableKeyboardShortcuts = true,
    disableTextSelection = true,
  } = options;

  // Context menu handler
  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (disableContextMenu) {
      e.preventDefault();
      return false;
    }
  }, [disableContextMenu]);

  // Copy/Cut handler
  const handleCopy = useCallback((e: ClipboardEvent) => {
    if (disableCopy) {
      e.preventDefault();
      return false;
    }
  }, [disableCopy]);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!disableKeyboardShortcuts) return;

    // Ctrl/Cmd + C (Copy)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault();
      return false;
    }

    // Ctrl/Cmd + A (Select All)
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      return false;
    }

    // Ctrl/Cmd + P (Print)
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      if (disablePrint) {
        e.preventDefault();
        return false;
      }
    }

    // Ctrl/Cmd + S (Save)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      return false;
    }

    // F12 (Dev Tools)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // Ctrl + Shift + I (Dev Tools)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }

    // Ctrl + Shift + J (Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }

    // Ctrl + U (View Source)
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      return false;
    }
  }, [disableKeyboardShortcuts, disablePrint]);

  // Before print handler
  const handleBeforePrint = useCallback(() => {
    if (disablePrint) {
      // Add a style to hide content when printing
      const style = document.createElement('style');
      style.id = 'print-protection';
      style.textContent = '@media print { body { display: none !important; } }';
      document.head.appendChild(style);
    }
  }, [disablePrint]);

  const handleAfterPrint = useCallback(() => {
    const style = document.getElementById('print-protection');
    if (style) {
      style.remove();
    }
  }, []);

  useEffect(() => {
    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    // Add print protection style immediately
    if (disablePrint) {
      const style = document.createElement('style');
      style.id = 'print-protection-permanent';
      style.textContent = '@media print { body * { display: none !important; } body::after { content: "Bu içerik yazdırılamaz."; display: block; text-align: center; padding: 50px; font-size: 24px; } }';
      document.head.appendChild(style);
    }

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      
      const printStyle = document.getElementById('print-protection-permanent');
      if (printStyle) {
        printStyle.remove();
      }
    };
  }, [handleContextMenu, handleCopy, handleKeyDown, handleBeforePrint, handleAfterPrint, disablePrint]);

  // Return CSS properties for text selection protection
  const protectionStyles: React.CSSProperties = disableTextSelection
    ? {
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
      }
    : {};

  return { protectionStyles };
};

export default useContentProtection;
