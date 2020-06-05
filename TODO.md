# TODO (Core)
- [ ] Static/Frontmatterful/JS content distinction should be made in core.
    - Static files, if a data file is found for them that specifies a template, should be converted to some other type maybe.
- [ ] Transformers should specify:
    - RUN_AT_STAGE { Preprocess, Process, PostProcess} (priority by order added, default transformers last unless disabled)
    - `match(ContentItem): boolean`
    - `apply(ContentItem): void|Promise<void>`
- [ ] Implement directory/along-side data files
- [ ] Implement global data/directory-global (not inherited to page properties) data
    - I don't want to pollute the page properties with this, so probably split up the data field into "properties" and "data"
- [ ] Implement collections (low-priority, but it would be nice)
- [ ] Implement pagination (requires global data or collections)
- [ ] Implement helper registration
- [ ] Implement plugin options
- [ ] Find a way to express config as a json file
- [ ] Replace gray-matter with a more lightweight frontmatter parser.
    - I'd like to avoid `js-yaml` if possible, to avoid a transitive dependency on *another* argument parser that's not needed (`argparse`)
- [ ] Replace deepmerge with a custom solution that supports override keys.
- [ ] deep merge by default?
- [ ] JS Templates (should be fairly straightforward)
- [ ] Template "short" names w/o extensions.
    - [ ] extension priority ( default defined by load order of template-providing plugins?)
    - [ ] aliases

## TODO (Plugins)
- [ ] Is there a leaner/better package than `remark` for Markdown? If so, use that for the default markdown plugin.
- [ ] Pug templates

## TODO (Project)
- [ ] ESLint
- [ ] Prettier (with my weird style from C#)
- [ ] NPM package configs
