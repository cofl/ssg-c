# Planned API

- Config
    Configuration options

    - constructor(options)
    - async import(options)
    - async importFromFile(path, { encoding = utf-8 }?)
- ContentProvider
    Creates pages/loads data into GraphQL
    Loads content into the data tree (all content elements are then evaluated into the content tree/"pagination" evaluated)

data cascade:
	- computed values (added last)
	- own metadata
	- adjacent metadata
	- parent metadata
	- ancestor metadata (through parent)

layouts: Record<string, Layout> = {};
interface Layout {
	layoutID(): string; // path-like
	data(): any; // if this contains another layout key, apply that one too
	apply(ssgc: SSGC, page: Page);
}

interface Page {
	data(): any;
	permalink(): string;
	slug(): string;
	parent(): Directory;
}

providers: Provider[]
interface Provider {
	getPages(): yield Page;
}
