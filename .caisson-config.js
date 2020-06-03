module.exports = function(caisson){
    caisson.registerPlugin(new (require("./packages/caisson-markdown").CaissonMarkdownPlugin)());
    return {
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
}
