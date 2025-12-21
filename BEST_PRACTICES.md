# Best Practices & Code Standards

This document outlines the best practices and standards for the VeryNice project, ensuring code quality, maintainability, and performance.

## Table of Contents

1. [Content Storage](#content-storage)
2. [Code Structure](#code-structure)
3. [Security](#security)
4. [Performance](#performance)
5. [Accessibility](#accessibility)
6. [Testing](#testing)
7. [Documentation](#documentation)

## Content Storage

### ✅ Use Markdown for Content

**Best Practice:** Store content in Markdown format, not HTML.

**Why:**
- **Storage Efficiency**: 30-60% smaller than HTML
- **Human Readable**: Easier to edit and review
- **Platform Independent**: Can be used across different systems
- **Better Searchability**: Plain text is easier to query
- **Safer**: No script execution risks

**Implementation:**
```typescript
// ✅ Good - Markdown format
{
  contentMarkdown: "This is **bold** text with a [link](https://example.com)",
  contentFormat: "markdown"
}

// ❌ Avoid - HTML format
{
  contentHTML: "<p>This is <strong>bold</strong> text with a <a href='...'>link</a></p>",
  contentFormat: "html"
}
```

### Content Processing

Always use the `processContent()` utility for rendering:

```typescript
import { processContent } from '$lib/utils/markdown';

// Prefers Markdown, falls back to HTML
{@html processContent(section.contentMarkdown || section.contentHTML, section.contentFormat || 'auto')}
```

### Migration Strategy

1. **New Content**: Always use Markdown
2. **Existing Content**: Gradually migrate from HTML to Markdown
3. **Backward Compatibility**: System supports both formats during transition

## Code Structure

### File Organization

```
src/
├── lib/
│   ├── components/      # Reusable components
│   ├── utils/          # Utility functions
│   ├── server/         # Server-side code
│   └── styles/         # Global styles
├── routes/              # Page routes
└── styles/              # Page-specific styles
```

### Naming Conventions

- **Files**: `kebab-case.ts` or `PascalCase.svelte`
- **Components**: `PascalCase.svelte`
- **Functions**: `camelCase()`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### Component Structure

```svelte
<script lang="ts">
  // 1. Imports
  import { processContent } from '$lib/utils/markdown';
  
  // 2. Type definitions
  interface Props {
    title: string;
    content: string;
  }
  
  // 3. Props
  export let title: string;
  export let content: string;
  
  // 4. Reactive statements
  $: processedContent = processContent(content);
</script>

<!-- 5. Template -->
<div class="component">
  <h2>{title}</h2>
  {@html processedContent}
</div>

<!-- 6. Styles -->
<style>
  .component {
    /* Scoped styles */
  }
</style>
```

## Security

### Content Sanitization

**Always sanitize user-generated or database content:**

```typescript
import { sanitizeHTML } from '$lib/utils/sanitize';
import { processContent } from '$lib/utils/markdown';

// ✅ Good - Automatic sanitization
{@html processContent(content)}  // Automatically sanitized

// ❌ Bad - Direct HTML rendering
{@html content}  // Security risk!
```

### XSS Prevention

- Never render raw HTML from database without sanitization
- Use DOMPurify for HTML sanitization
- Validate all user inputs
- Use Content Security Policy (CSP) headers

### Firebase Security Rules

Ensure Firestore security rules are properly configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pages/{pageId} {
      allow read: if true;  // Public read
      allow write: if request.auth != null;  // Authenticated write
    }
  }
}
```

## Performance

### Image Optimization

- Use Cloudinary for image optimization
- Always specify `width` and `height` attributes
- Use `loading="lazy"` for below-fold images
- Provide proper `alt` text for accessibility

```svelte
<img
  src={getCloudinaryUrl(image.publicId, { width: 800, height: 450 })}
  alt={image.alt || 'Descriptive alt text'}
  loading="lazy"
  decoding="async"
  width="800"
  height="450"
/>
```

### Code Splitting

- Use dynamic imports for heavy components
- Lazy load non-critical components
- Split routes appropriately

### Database Queries

- Fetch only needed fields
- Use indexes for frequently queried fields
- Limit query results when possible
- Cache frequently accessed data

## Accessibility

### Semantic HTML

```svelte
<!-- ✅ Good - Semantic structure -->
<article>
  <header>
    <h1>Article Title</h1>
  </header>
  <main>
    <section aria-labelledby="section-title">
      <h2 id="section-title">Section Title</h2>
      <p>Content...</p>
    </section>
  </main>
</article>

<!-- ❌ Bad - Div soup -->
<div>
  <div>Title</div>
  <div>Content...</div>
</div>
```

### ARIA Labels

- Use `aria-label` for interactive elements without visible text
- Use `aria-labelledby` to reference headings
- Use `role` attributes when semantic HTML isn't sufficient

### Alt Text

**Always provide descriptive alt text for images:**

```svelte
<!-- ✅ Good -->
<img alt="Golden Man statue in Kazakhstan National Museum" />

<!-- ❌ Bad -->
<img alt="image" />
<img alt="" />  <!-- Only if decorative -->
```

### Keyboard Navigation

- Ensure all interactive elements are keyboard accessible
- Provide visible focus indicators
- Maintain logical tab order

## Testing

### Code Quality Checks

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

### Database Auditing

```bash
# Run database audit
npm run audit:firebase

# Verbose audit
npm run audit:firebase:verbose
```

### Manual Testing Checklist

- [ ] Content renders correctly (Markdown and HTML)
- [ ] Images load with proper alt text
- [ ] Links work correctly
- [ ] Page is accessible (keyboard navigation)
- [ ] Mobile responsive
- [ ] SEO metadata present

## Documentation

### Code Comments

```typescript
/**
 * Processes content that can be Markdown or HTML
 * Prefers Markdown over HTML when both are available
 * 
 * @param content - Primary content (prefer Markdown)
 * @param format - Format hint ('markdown' | 'html' | 'auto')
 * @param fallbackContent - Fallback content (e.g., HTML)
 * @returns Sanitized HTML string ready for rendering
 */
export function processContent(
  content: string | null | undefined,
  format: 'markdown' | 'html' | 'auto' = 'auto',
  fallbackContent?: string | null | undefined
): string {
  // Implementation...
}
```

### README Files

- Document setup instructions
- Include usage examples
- List dependencies
- Provide troubleshooting tips

## Firebase Best Practices

### Data Structure

```typescript
// ✅ Good - Well-structured document
{
  title: "Section Title",
  contentMarkdown: "Content in Markdown...",
  contentFormat: "markdown",
  order: 1,
  images: [
    {
      publicId: "image-id",
      alt: "Descriptive alt text",
      captionName: "Caption",
      captionSource: "Source"
    }
  ],
  sectionId: "section-id"
}

// ❌ Bad - Inconsistent structure
{
  title: "Title",
  content: "<p>HTML content</p>",  // HTML instead of Markdown
  img: "image-id",  // Inconsistent field name
  // Missing order, sectionId, etc.
}
```

### Field Naming

- Use consistent field names across documents
- Prefer `camelCase` for field names
- Use descriptive names (e.g., `contentMarkdown` not `md`)

### Indexes

- Create indexes for frequently queried fields
- Use composite indexes for multi-field queries
- Monitor query performance

## Migration Best Practices

### Gradual Migration

1. **Phase 1**: Add Markdown support (backward compatible)
2. **Phase 2**: Migrate existing HTML to Markdown
3. **Phase 3**: Remove HTML support (after full migration)

### Migration Scripts

```bash
# Dry run (preview changes)
npm run migrate:html-to-markdown:dry-run

# Actual migration
npm run migrate:html-to-markdown
```

### Testing After Migration

- Verify content renders correctly
- Check for any data loss
- Validate storage savings
- Test all affected pages

## Performance Monitoring

### Metrics to Track

- Page load times
- Database query performance
- Image loading times
- Content rendering performance

### Optimization Checklist

- [ ] Images optimized and lazy-loaded
- [ ] Content stored in efficient format (Markdown)
- [ ] Database queries optimized
- [ ] Code split appropriately
- [ ] Caching implemented where appropriate

## Security Checklist

- [ ] All content sanitized before rendering
- [ ] User inputs validated
- [ ] Firebase security rules configured
- [ ] HTTPS enforced
- [ ] CSP headers set
- [ ] No sensitive data in client-side code

## Accessibility Checklist

- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Alt text for all images
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Screen reader tested

## Conclusion

Following these best practices ensures:

- ✅ **Maintainable** code that's easy to understand and modify
- ✅ **Secure** application protected against common vulnerabilities
- ✅ **Performant** application with optimal loading times
- ✅ **Accessible** application usable by everyone
- ✅ **Scalable** architecture that can grow with your needs

For specific implementation details, refer to:
- `MARKDOWN_MIGRATION_GUIDE.md` - Content migration guide
- `AUDIT_README.md` - Database auditing guide
- `ARTICLE_QUALITY_IMPLEMENTATION.md` - Content quality standards




































