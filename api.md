# Planned API

- Config
    Configuration options

    - constructor(options)
    - async import(options)
    - async importFromFile(path, { encoding = utf-8 }?)
- ContentProvider
    Creates pages/loads data into GraphQL
    Loads content into the data tree (all content elements are then evaluated into the content tree/"pagination" evaluated)
