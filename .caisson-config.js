module.exports = function(caisson){
    caisson.registerPlugin(require("./packages/caisson-markdown"));
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
