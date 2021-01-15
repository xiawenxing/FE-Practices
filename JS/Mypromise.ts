enum PromiseState {
    Pending = 0, // 初始态：异步操作执行中，可转化为其他两个状态且转化不可逆
    Fullfilled = 1,// 终止态：异步操作执行成功
    Rejected = 2// 终止态：异步操作执行失败
}

class Mypromise {
    private _state: PromiseState;// 状态
    private _res: any;// 值

    // 存放进入终止态状态（异步操作结束）后需要执行的回调
    private _onRejectedCallbacks: any[];
    private _onFullfilledCallbacks: any[];

    // 用于变更状态的 resolve、reject
    resolve = (res) => {
        // 如果 res 是个 promise 对象
        if (res instanceof Mypromise) {
            res.then((res) => {
                this._turnToFullfilled(res);
            }, (err) => {
                this._turnToRejected(err);
            })
        } else {// 如果不是
            this._turnToFullfilled(res);
        }
    };

    reject = (res) => {
        this._turnToRejected(res);
    };

    _turnToFullfilled = (res) => {// 状态转为 fullfilled 态
        if (this._state != PromiseState.Pending) return;
        this._state = PromiseState.Fullfilled;
        this._res = res;
        // 执行 resolve 状态下等待执行的回调
        let cb;
        while (cb = this._onFullfilledCallbacks.shift()) {
            cb(res);
        }
    }

    _turnToRejected = (res) => {// 状态转为 rejected 态
        if (this._state != PromiseState.Pending) return;
        this._state = PromiseState.Rejected;
        this._res = res;
        // 执行 resolve 状态下等待执行的回调
        let cb;
        while (cb = this._onRejectedCallbacks.shift()) {
            cb(res);
        }
    }

    // then 方法
    then = (onFullfilled?, onRejected?) => {
        // then 函数返回一个新的 promise
        return new Mypromise((resolve, reject) => {
            try {
                if (this._state === PromiseState.Pending) {
                    // 如果执行 .then 的时候，原 promise 还处于 pending 状态
                    // 新 promise 需要 pending， 再根据旧 promise 执行结果状态 -> 执行 onFullfilled/onRejected 后的结果 -> 变更新 promise 的状态
                    if (typeof onFullfilled === 'function') {
                        this._onFullfilledCallbacks.push((res) => {
                            try {
                                resolve(onFullfilled(res));
                            } catch (e) {
                                reject(e);
                            }
                        });
                    } else {
                        this._onFullfilledCallbacks.push((res) => {
                                resolve(res);
                        });
                    }
                    if (typeof onRejected === 'function') {
                        this._onRejectedCallbacks.push((res) => {
                            try {
                                resolve(onRejected(res));
                            } catch (e) {
                                reject(e);
                            }
                        })
                    } else {
                        this._onRejectedCallbacks.push((res) => {
                                reject(res);
                        })
                    }
                } else if (this._state === PromiseState.Fullfilled) {
                    // 执行 .then 的时候，原 promise 已经处于终止态了
                    if (typeof onFullfilled === 'function') {
                        try {
                            resolve(onFullfilled(this._res));
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        resolve(this._res);
                    }
                } else if (this._state === PromiseState.Rejected) {
                    if (typeof onRejected === 'function') {
                        try {
                            resolve(onRejected(this._res));
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(this._res);
                    }
                }
            } catch (e) {
                reject(e);
            }
        })
    }

    constructor(handler) {
        this._state = PromiseState.Pending;
        this._onFullfilledCallbacks = [];
        this._onRejectedCallbacks = [];
        handler(this.resolve, this.reject);
    }
}

const promise = new Mypromise((resolve, reject) => {
    // setTimeout(()=>reject(1), 100);
    setTimeout(()=>resolve(1),10);
}).then((res) => {
    console.log('resolve',res);
    return 2;
},(e)=>{
    console.log('reject',e);
    return 2;
}).then((res)=>{
    console.log('resolve2',res);
})