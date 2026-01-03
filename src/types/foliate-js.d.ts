// Type declarations for foliate-js library
declare module 'foliate-js/view.js' {
  interface FoliateSection {
    id?: string;
    createDocument: () => Promise<Document | null>;
    resolveHref?: (href: string) => string;
  }

  interface FoliateBook {
    toc?: Array<{
      href?: string;
      label?: string;
      subitems?: Array<unknown>;
    }>;
    sections?: FoliateSection[];
    loadBlob: (path: string) => Promise<Blob | null>;
  }

  export function makeBook(file: File): Promise<FoliateBook>;
}
