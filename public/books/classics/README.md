# Classic Books Assets

This folder contains covers and EPUB files for the public domain classics.

## Folder Structure

```
classics/
├── covers/          # Book cover images (JPG or PNG)
│   ├── crime-punishment.jpg
│   ├── brothers-karamazov.jpg
│   └── ...
├── epubs/           # EPUB files (optional, for self-hosting)
│   ├── crime-punishment.epub
│   └── ...
└── README.md
```

## Cover Image Naming Convention

Cover images should be named using the book's `id` from `src/lib/classics-data.ts`:

| Book ID | Cover Filename |
|---------|----------------|
| crime-punishment | crime-punishment.jpg |
| brothers-karamazov | brothers-karamazov.jpg |
| notes-underground | notes-underground.jpg |
| metamorphosis | metamorphosis.jpg |
| trial | trial.jpg |
| thus-spoke-zarathustra | thus-spoke-zarathustra.jpg |
| beyond-good-evil | beyond-good-evil.jpg |
| complete-poe | complete-poe.jpg |
| war-peace | war-peace.jpg |
| anna-karenina | anna-karenina.jpg |
| fear-trembling | fear-trembling.jpg |
| sickness-unto-death | sickness-unto-death.jpg |
| frankenstein | frankenstein.jpg |
| dracula | dracula.jpg |
| pride-prejudice | pride-prejudice.jpg |
| 1984 | 1984.jpg |
| great-gatsby | great-gatsby.jpg |
| moby-dick | moby-dick.jpg |

## Recommended Image Specifications

- **Aspect Ratio**: 2:3 (same as book covers)
- **Minimum Size**: 300x450 pixels
- **Recommended Size**: 600x900 pixels
- **Format**: JPG or PNG
- **File Size**: Under 200KB for optimal loading

## Adding New Covers

1. Create or find a cover image for the book
2. Resize to recommended dimensions
3. Name the file using the book's ID (e.g., `crime-punishment.jpg`)
4. Place in the `covers/` folder
5. The app will automatically detect and display the cover
