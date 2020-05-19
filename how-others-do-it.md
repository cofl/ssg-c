# How other SSGs work

Hopefully putting this down will help me figure out how this should work.

## Wintersmith

- Content Directory/Generators -> Content Tree -> Render View -> Output
    - Content Tree objects map names to plugins (directories end in /)
    - Pages are associated with plugins

- Templates distinct from content
- Plugins directory
- Frontmatter or global variables, no directory data.
- Configured in JSON.
- No dynamically-generated pages.
- No hydration.
- Picks how to transform by `.registerContentPlugin()` and glob pattern
- outputs with template string
- Explicit layout/template selection
- does not default to clean urls, do it yourself

## 11ty

- Everything is a "template".
- Data cascade, but not a content tree.
- "Layouts" are templates in the _includes or _layouts directories.
- Configured in JS.
- Can dynamically generate pages from data, put anywhere w/ permalink templating
- Picks how to transform by extension and some config
- outputs with permalink (which can be generated from basename slug)
- Explicit layout/template selection
- defaults to clean urls
- uses collections to group pages
    - are auto-collections a thing?

## Gatsby

- Hydration.
- A mess.
- All done in JS.

## Hugo

- Directories for content, layouts, themes, static, data, etc
- Not extensible.
- Geared almost exclusively toward blog-like sites.

## Grav

- not an SSG, but still useful
- builds a content tree (pretty sure?)
- allows changing routes/permalinks (can alias, because not an SSG) (TODO: how does this affect the content tree?)
- one folder per page (clean links automatically, no option for otherwise)
- picks a template by file name

## Commonalities

- Templates/Layouts are located distinct from Content
