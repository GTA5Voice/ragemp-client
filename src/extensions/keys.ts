const _spam = new WeakMap<object, number>();

mp.keys.bindSpam = function (key: number, hold: boolean, cooldown: number, fn: () => void): void {
    const obj: object = {};
    _spam.set(obj, 0);

    mp.keys.bind(key, hold, () => {
        const now = Date.now();
        const last = _spam.get(obj) ?? 0;
        if (now - last < cooldown) return;
        _spam.set(obj, now);
        fn();
    });
};
