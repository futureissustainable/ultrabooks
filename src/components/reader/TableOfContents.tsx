'use client';

import { clsx } from 'clsx';
import { useReaderStore } from '@/lib/stores/reader-store';
import { Modal } from '@/components/ui';
import { PixelIcon } from '@/components/icons/PixelIcon';

interface TocItem {
  id: string;
  href: string;
  label: string;
  subitems?: TocItem[];
}

interface TableOfContentsProps {
  items: TocItem[];
  currentHref?: string;
  onNavigate: (href: string) => void;
}

function TocItemComponent({
  item,
  currentHref,
  onNavigate,
  level = 0,
}: {
  item: TocItem;
  currentHref?: string;
  onNavigate: (href: string) => void;
  level?: number;
}) {
  const isActive = currentHref === item.href;

  return (
    <li className="border-b border-[var(--border-primary)] last:border-b-0">
      <button
        onClick={() => onNavigate(item.href)}
        className={clsx(
          'w-full text-left py-2 px-3 font-[family-name:var(--font-system)] text-[12px] transition-colors',
          'hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]',
          isActive && 'bg-[var(--text-primary)] text-[var(--bg-primary)]',
        )}
        style={{ paddingLeft: `${(level + 1) * 16}px` }}
      >
        <span className="flex items-center gap-2">
          {level > 0 && (
            <span className="font-[family-name:var(--font-mono)] text-[9px] text-[var(--text-tertiary)]">
              {'└'}
            </span>
          )}
          <span className={clsx(level > 0 && 'text-[11px]')}>
            {item.label}
          </span>
        </span>
      </button>
      {item.subitems && item.subitems.length > 0 && (
        <ul>
          {item.subitems.map((subitem) => (
            <TocItemComponent
              key={subitem.id}
              item={subitem}
              currentHref={currentHref}
              onNavigate={onNavigate}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TableOfContents({ items, currentHref, onNavigate }: TableOfContentsProps) {
  const { isTocOpen, setTocOpen } = useReaderStore();

  const handleNavigate = (href: string) => {
    onNavigate(href);
    setTocOpen(false);
  };

  return (
    <Modal
      isOpen={isTocOpen}
      onClose={() => setTocOpen(false)}
      title="Contents"
      size="md"
    >
      {items.length === 0 ? (
        <div className="py-10 text-center border border-[var(--border-primary)] bg-[var(--bg-primary)]">
          <div className="w-12 h-12 border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4">
            <PixelIcon name="book" size={20} className="text-[var(--text-tertiary)]" />
          </div>
          <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.05em] text-[var(--text-secondary)]">
            No contents available
          </p>
        </div>
      ) : (
        <div className="border border-[var(--border-primary)] bg-[var(--bg-primary)]">
          <ul className="max-h-[60vh] overflow-y-auto">
            {items.map((item) => (
              <TocItemComponent
                key={item.id}
                item={item}
                currentHref={currentHref}
                onNavigate={handleNavigate}
              />
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
