
export enum Types {
  Array = 'Array',
  String = 'String',
  Number = 'Number',
  Object = 'Object',
  Function = 'Function',
  AsyncFunc = 'AsyncFunction',
  Null = 'Null',
  Undefined = 'Undefined'
}

export function type(obj: any) {
  const objType = Object.prototype.toString.call(obj).slice(8, -1);
  const is = (type: Types) => type === objType;
  const oneof = (types: Types[]) => (Array.isArray(types) ? types.some(type => is(type)) : false);

  return { is, oneof, objType };
}

export function isArray(obj: any) {
  return type(obj).is(Types.Array);
}

export function isString(obj: any) {
  return type(obj).is(Types.String);
}

export function isNumber(obj: any) {
  return type(obj).is(Types.Number);
}

export function isFunction(obj: any) {
  return type(obj).is(Types.Function) || type(obj).is(Types.AsyncFunc);
}

export function isObject(obj: any) {
  return type(obj).is(Types.Object);
}

// 判断类型相等
export function isSameType(obj1: any, obj2: any, t?: Types) {
  if (t) {
    return (type(obj1).is(t) && (type(obj1).is(t)));
  }
  return (type(obj1).is(type(obj2).objType));
}

// 判断数组是否相等
export function isArrayEqual(arr1: any, arr2: any, compare: (val1: any, val2: any) => boolean): boolean {
  if (!isSameType(arr1, arr2, Types.Array)) return false;
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (!compare(arr1[i], arr2[i])) return false;
  }
  return true;
}