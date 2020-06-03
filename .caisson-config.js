module.exports = {
    providers: {
        '/': 'test/content',
        '/inner': 'test/other'
    },
    doDeepMerge: true,
    paths: {
        //content: "test/content",
        templates: "test/templates"
    }
}
