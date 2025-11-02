import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Box, Search, X } from 'lucide-react';
import { Icon as IconifyIcon } from '@iconify/react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
  }
>(({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm border-transparent',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 shadow-sm',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100',
  };
  const sizes = {
    sm: 'h-7 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-sm',
    icon: 'h-7 w-7 p-0 flex items-center justify-center',
  };
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = 'Button';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, spellCheck, ...props }, ref) => (
  <input
    ref={ref}
    spellCheck={spellCheck}
    className={cn(
      'flex h-8 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export const Label = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <label className={cn('text-xs font-medium text-gray-700 mb-1.5 block', className)}>
    {children}
  </label>
);

export const Switch = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={cn(
      'relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
      checked ? 'bg-green-500' : 'bg-gray-200',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
        checked ? 'translate-x-3' : 'translate-x-0'
      )}
    />
  </button>
);

export const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600',
      className
    )}
  >
    {children}
  </span>
);

export const ServerIcon = ({
  url,
  className,
}: {
  url?: string;
  className?: string;
}) => {
  // Check if it's an iconify icon name (e.g., 'ph:gear')
  if (url && url.includes(':')) {
    return <IconifyIcon icon={url} className={cn('w-5 h-5 opacity-40', className)} />;
  }
  
  // Otherwise treat it as a URL
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={cn('w-5 h-5 object-contain opacity-40', className)}
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    );
  }
  return <Box className={cn('w-5 h-5 text-gray-400 opacity-40', className)} />;
};

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

export const IconPicker = ({ value, onChange, onClose, anchorEl }: IconPickerProps) => {
  const [search, setSearch] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(value ? value.replace('ph:', '') : '');
  const [iconMetadata, setIconMetadata] = useState<Record<string, any>>({});
  const [allIcons, setAllIcons] = useState<string[]>([]);
  
  const notRegular = (iconName: string) => {
    const irregularPatterns = ['-fill', '-duotone', '-bold', '-thin', '-light', '-regular'];
    return irregularPatterns.some(pattern => iconName.endsWith(pattern));
  }
  useEffect(() => {
    // Load icon metadata from the package
    import('@iconify-json/ph/icons.json').then((data: any) => {
      const icons = Object.keys(data.icons || {}).filter(iconName => !notRegular(iconName));
      setAllIcons(icons);
      
      // Import metadata if available
      import('@iconify-json/ph/metadata.json')
        .then((metadata: any) => {
          setIconMetadata(metadata);
        })
        .catch(() => {
          // Metadata not available, just use icon names
          setIconMetadata({});
        });
    });
  }, []);
  
  const filteredIcons = search
    ? allIcons.filter(icon => {
        const lowerSearch = search.toLowerCase();
        // Search by icon name
        if (icon.toLowerCase().includes(lowerSearch)) return true;
        
        // Search by metadata if available
        const meta = iconMetadata[icon];
        if (meta) {
          // Check categories
          if (meta.categories && Array.isArray(meta.categories)) {
            if (meta.categories.some((cat: string) => cat.toLowerCase().includes(lowerSearch))) {
              return true;
            }
          }
          // Check tags
          if (meta.tags && Array.isArray(meta.tags)) {
            if (meta.tags.some((tag: string) => tag.toLowerCase().includes(lowerSearch))) {
              return true;
            }
          }
        }
        return false;
      })
    : allIcons.slice(0, 100); // Show first 100 icons by default

  const handleSave = () => {
    if (selectedIcon) {
      onChange(`ph:${selectedIcon}`);
      onClose();
    }
  };

  // Calculate position based on anchor element
  const pickerStyle: React.CSSProperties = anchorEl
    ? {
        position: 'fixed',
        top: anchorEl.getBoundingClientRect().bottom + 8,
        left: anchorEl.getBoundingClientRect().left,
      }
    : {};

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <div 
        className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-80 max-h-96 flex flex-col"
        style={pickerStyle}
      >
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-900/10"
              autoFocus
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-8 gap-1">
            {filteredIcons.map((icon) => {
              const iconName = `ph:${icon}`;
              const isSelected = selectedIcon === icon;
              return (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    'aspect-square rounded border transition-all flex items-center justify-center hover:bg-gray-50',
                    isSelected
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  title={icon}
                >
                  <IconifyIcon icon={iconName} className="w-4 h-4 text-gray-700 opacity-80" />
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <div className="text-center py-8 text-xs text-gray-400">
              <p>No icons found</p>
            </div>
          )}
        </div>
        
        <div className="p-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {selectedIcon ? (
              <div className="flex items-center gap-1.5">
                <IconifyIcon icon={`ph:${selectedIcon}-light`} className="w-3.5 h-3.5 opacity-40" />
                <span className="font-mono text-[10px]">{selectedIcon}</span>
              </div>
            ) : (
              <span className="text-[10px]">Select an icon</span>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 px-2 text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!selectedIcon}
              className="h-6 px-2 text-xs"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

