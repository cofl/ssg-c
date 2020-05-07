# How this should work

1. Gather main config, register content transformers and providers.
2. Populate Layouts. Default Layout = Static/No Change.
3. Populate Content Tree, scraping frontmatter from supported/listed file types (set in config).
    - Register additional content transformers/providers if encountered.
        - for fs provider, if a new fs provider is encountered, stop processing
          and add that directory to the queue. The new provider can have a different
          config.
    - If a file has an extension matching a "during population" content transformer,
      get the content item from that transformer.
    - Follow layout chain to determine final extension for files.
    - Loop until queue of providers is empty.
4. Apply tree transformers to content tree.
5. Invoke Render on the root.
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
