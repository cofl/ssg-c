# How this should work

1. Gather main config, register content transformers and providers.
2. Populate Layouts. Default Layout = Static/No Change.
3. Populate Data Map of data path -> data item, scraping frontmatter from supported/listed file types (set in config).
    - Also populate temporary Content List, links content -> data
    - If a file has an extension matching a "content provider", match data and content using that to populate return items.
    - Follow layout chain to determine final extension for files.
    - Loop until queue of providers is empty.
4. Link Data Map -> Data Tree
5. Build Content Tree from temporary Content List. Default permalinks from provider base + data path (?)
6. Apply tree transformers to content tree.
7. Invoke Render on the root.
    - walk the tree
    - apply pre-layout content transformers
    - apply layouts to items
    - apply post-layout content transformers
    - write to files.

## Things I need

- Config
- OnProvideContentTransformer
- PreLayoutContentTransformer
- PostLayoutContentTransformer
- ContentProvider
- Layout
- ContentRoot (hs no parent, is ContentItem)
- ContentTree (has children, is ContentItem)
- ContentItem (has parent, links to data)
- ContentFile (is ContentItem, has content)
- StaticContentFile
- Data (has parent, links to contentitem)

## Other

1. data cascade
    - global data added to root
    - directory data added to tree items (after global)
    - adjacent data file
    - layout frontmatter/data from most distant to the one declared or implied by the file
    - file frontmatter
    - computed properties last (special case of pre-layout content transformers)
2. data tree != content tree
    - data tree mostly maps the real-world FS.
    - content tree maps permalinks

## Goals

1. Extensible.
2. Low-dependency.
3. Not all batteries included.
