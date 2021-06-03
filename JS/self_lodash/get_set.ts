import { isObject } from "./type";

function _(object: Object) {
  function get(path: string) {// 获取 Object 对象上的指定属性
    if (!isObject(object)) return undefined;// 非 Object 尤其是 undefined、null return undefined
    // [^.[\]]+ 反向字符集 匹配 非 .、[、] 的字符 效果：将被 . [ ] 之外的字符提取出来，并以其为分界线分割
    // \[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\] 匹配格式如 [-1.2] 或者 ["x"] ['x'] 的字符串，且
    // (?=(?:\.|\[\])(?:\.|\[\]|$))
    var propertyExp = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reEscapeChar = /\\(\\)?/g;// () 匹配 
    const paths = [];
    if (path.charCodeAt(0) === 46 /* . */) {
      paths.push('');
    }
    path.replace(propertyExp, (match, number, quote, subString) => {
      paths.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
      return '';
    });
    return paths.reduce((obj, currProperty)=>{
      if(obj === undefined)return undefined;
      return obj[currProperty.toString()];
    }, object)
  }
}