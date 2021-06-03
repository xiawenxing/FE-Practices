const obj = { overloadFn: undefined };
function addOverloadMethod(obj, name, fn) {
  const last = obj[name];
  obj[name] = function () {
    if (arguments.length === fn.length)// 函数的 length 属性返回该函数定义时的参数个数
    {
      fn(...arguments);
    } else {
      last(...arguments);
    }
  }
}

function overload1() { }
function overload2(a) { }
function overload3(a, b, c) { }

addOverloadMethod(obj, 'overloadFn', overload1);
addOverloadMethod(obj, 'overloadFn', overload2);
addOverloadMethod(obj, 'overloadFn', overload3);


// @ts-ignore
obj.overloadFn()
// @ts-ignore
obj.overloadFn(a)
// @ts-ignore
obj.overloadFn(a, b, c)