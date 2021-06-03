import {Types, isSameType, type } from './type';
// 判断数组是否相等
export function isArrayEqual(arr1: any, arr2: any, compare: (val1: any, val2: any) => boolean): boolean {
  if (!isSameType(arr1, arr2, Types.Array)) return false;
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (!compare(arr1[i], arr2[i])) return false;
  }
  return true;
}

// 判断两个变量值是否相等
export function isValEqual(val1: any, val2: any): boolean {
  if (!isSameType(val1, val2)) return false;
  switch (type(val1).objType) {
    case Types.Object:
      return isObjectEqual(val1, val2);
    case Types.Array:
      return isArrayEqual(val1, val2, isValEqual);
    default:
      return val1 === val2;
  }
}
// 判断对象是否相等
export function isObjectEqual(obj1: any, obj2: any): boolean {
  // 对象比较其实就是一个图的遍历（树的遍历），不过因为可能存在循环引用所以要做回路检测
  const stack1 = [];// 通过 DFS 做遍历+回路检测
  const visited1 = [];
  const stack2 = [];
  const visited2 = [];

  stack1.push(obj1);
  stack2.push(obj2);
  while (stack1.length > 0 && stack2.length > 0) {
    if (stack1.length !== stack2.length) return false;
    const node1 = stack1.pop();
    const node2 = stack2.pop();

    if (isSameType(node1, node2, Types.Object)) {
      visited1.push(node1);
      visited2.push(node2);
      const keys1 = Object.keys(node1);
      const keys2 = Object.keys(node2);
      if (keys1.length != keys2.length) return false;

      for (let i = 0; i < keys1.length; i++) {
        const j = keys2.indexOf(keys1[i]);
        if (j < 0) return false;
        if ((visited1.indexOf(node1[keys1[i]]) > -1) || (visited2.indexOf(node2[keys2[j]]) > -1)) {
          // defaultLogger.info('Error: there is circle in object');
          return false;
        }
        stack1.push(node1[keys1[i]]);
        stack2.push(node2[keys2[j]]);
      }
    } else if (isSameType(node1, node2, Types.Array)) {
      const compare = (val1: any, val2: any): boolean => {
        if (isSameType(val1, val2, Types.Object)) {
          stack1.push(val1);
          stack2.push(val2);
          return true;
        } else if (isSameType(val1, val2, Types.Array)) {
          if (!isArrayEqual(val1, val2, compare)) return false;
        } else {
          if (!isValEqual(val1, val2)) return false;
        }
        return true;
      };
      if (!isArrayEqual(node1, node2, compare)) return false;
    } else {
      if (!isValEqual(node1, node2)) return false;
    }
  }

  if (stack1.length !== stack2.length) return false;
  return true;
}