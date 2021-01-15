class DynamicPublicPathPluginV1{
    constructor(options){
        this.options = options;
        this.replacePublicPathRuntimeModule = this.replacePublicPathRuntimeModule.bind(this);
    }

    replacePublicPathRuntimeModule(compilation){
        const { publicPath, preProcess } = this.options;
        if(publicPath&&preProcess)
            compilation.hooks.runtimeModule.tap('DynamicPublicPathPluginV1',(module, chunk)=>{
                if(module.name=='publicPath'){
                    module.generate = function(){
                        return `__webpack_require__('${preProcess}');\n__webpack_require__.p = ${publicPath};`;
                    };
                }
            })
    }

    apply(compiler){
        compiler.hooks.thisCompilation.tap('DynamicPublicPathPluginV1',(compilation,params)=>{
            // compilation.hooks.afterRuntimeRequirements.tap('DynamicPublicPathPluginV1', ()=>{
                this.replacePublicPathRuntimeModule(compilation);
            // });
        })
    }
}

module.exports = DynamicPublicPathPluginV1;
