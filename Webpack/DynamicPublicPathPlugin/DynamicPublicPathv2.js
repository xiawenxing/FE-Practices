const {
	toConstantDependency,
	evaluateToString
} = require("../node_modules/webpack/lib/javascript/JavascriptParserHelpers");
class DynamicPublicPathPluginV2{
    constructor(options){
        this.options = options;
        this.replacePublicPathRuntimeModule = this.replacePublicPathRuntimeModule.bind(this);
    }

    replacePublicPathRuntimeModule(compilation){
        const { preProcess } = this.options;
        if(preProcess)
            compilation.hooks.runtimeModule.tap('DynamicPublicPathPluginV1',(module, chunk)=>{
                if(module.name=='publicPath'){
                    module.generate = function(){
                        return `__webpack_require__.p = "";\n__webpack_require__('${preProcess}');`;
                    };
                }
        })
    }

    placeHolderReplace(normalModuleFactory){
        const {replaceHolder} = this.options;
        if(replaceHolder){
            const parserHandler = parser => {
                const info = {
                    expr: '__webpack_require__.p',
                    req: ['__webpack_require__.p'],
                    type: 'string',
                    assign: true
                };
                parser.hooks.expression
                    .for(replaceHolder)
                    .tap(
                        "APIPlugin",
                        toConstantDependency(parser, info.expr, info.req)
                    );
                if (info.assign === false) {
                    parser.hooks.assign.for(replaceHolder).tap("APIPlugin", expr => {
                        const err = new WebpackError(`${replaceHolder} must not be assigned`);
                        err.loc = expr.loc;
                        throw err;
                    });
                }
                if (info.type) {
                    parser.hooks.evaluateTypeof
                        .for(replaceHolder)
                        .tap("APIPlugin", evaluateToString(info.type));
                }
            }
            normalModuleFactory.hooks.parser
                        .for("javascript/auto")
                        .tap("APIPlugin", parserHandler);
            normalModuleFactory.hooks.parser
                        .for("javascript/dynamic")
                        .tap("APIPlugin", parserHandler);
            normalModuleFactory.hooks.parser
                        .for("javascript/esm")
                        .tap("APIPlugin", parserHandler);
        }
    }

    apply(compiler){
        compiler.hooks.thisCompilation.tap('DynamicPublicPathPluginV2',(compilation,params)=>{
            // compilation.hooks.afterRuntimeRequirements.tap('DynamicPublicPathPluginV1', ()=>{
                this.replacePublicPathRuntimeModule(compilation);
            // });
        })
        compiler.hooks.compilation.tap('DynamicPublicPathPluginV2',(compilation, { normalModuleFactory })=>{
                this.placeHolderReplace(normalModuleFactory)
        })
    }
}

module.exports = DynamicPublicPathPluginV2;
