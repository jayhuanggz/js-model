
class Model {
    constructor(parent, prop, value) {
        this.watches = [];
        this.parent = parent;
        this.props = {};
        this.prop = prop;
        this.value = value;
        if (typeof parent !== 'undefined') {
            parent.addProp(prop, this);
        }
        this.mutating = false;
    }



    get(target, prop) {
        return Reflect.get(target, prop);
    }

    set(target, prop, val) {

        let propModel;
        if (Object.prototype.hasOwnProperty.call(this.props, prop)) {
            propModel = this.props[prop];
        }
        let oldVal = target[prop], newVal = val;
        if (typeof val === 'object' && typeof propModel !== 'undefined') {
            val = propModel.proxy(val);
        }

        Reflect.set(target, prop, val);
        if (typeof propModel !== 'undefined') {
            if (oldVal !== newVal) {
                propModel.notify(oldVal, newVal);
            }
        } else {
            this.notify(target, target, true);
        }

        return true;
    }

    deleteProperty(target, prop) {
        let oldVal = Reflect.get(target, prop);
        let result = Reflect.deleteProperty(target, prop);
        let propModel = this.props[prop];
        if (typeof propModel === 'undefined') {
            this.notify(target, target, true);
        } else {
            propModel.notify(oldVal, Reflect.get(target, prop));
        }

        return result
    }

    getProp(prop) {
        return this.props[prop];
    }

    addProp(prop, model) {
        if (Object.prototype.hasOwnProperty.call(this.props, prop)) {
            throw new Error('Duplicate prop: ' + prop);
        }
        this.props[prop] = model;
    }

    notify(oldVal, newVal, bubbling) {
        this.watches.forEach(w => {
            if (!bubbling || w.isDeep()) {
                w.notify(oldVal, newVal);
            }
        });

        if (typeof this.parent !== 'undefined') {
            this.parent.notify(this.parent.value, this.parent.value, true)
        }
    }

    watch(prop, cb, options) {
        let model = this._findModelByPath(prop);

        if (typeof model === 'undefined') {
            return () => { };
        }
        let watch = new Watch(prop, cb, options);
        return model._addWatch(watch);

    }

    _addWatch(watch) {
        this.watches.push(watch);
        return (function (model, w) {
            return function () {
                if (typeof w !== 'undefined') {
                    w.destroy();
                    let index = model.watches.indexOf(w)
                    if (index !== -1) {
                        model.watches.splice(index, 1);
                    }
                }
            }
        })(this, watch);
    }



    _findModelByPath(path) {

        let current = this;

        let paths = path.split('.');
        for (var i = 0; i < paths.length && typeof current !== 'undefined'; i++) {
            current = current.getProp(paths[i]);
        }

        if (typeof current === 'undefined') {
            return;
        }

        return current;


    }

    proxy(target) {

        this.value = target;
        if (Array.isArray(target)) {
            return new Proxy(target, this);
        } else if (typeof target === 'object') {
            let copy = {};

            for (var key in this.props) {
                if (Object.prototype.hasOwnProperty.call(target, key)) {
                    copy[key] = this.props[key].proxy(target[key]);
                }
            }
            this.value = copy;
            return new Proxy(copy, this);
        } else {
            return target
        }


    }

    destroy() {
        this.watches.forEach(w => w.destroy());
        this.value = undefined;
        for (var key in this.props) {
            this.props[key].destroy();
        }

        this.props = undefined;
        this.parent = undefined;
    }

}
class Watch {
    constructor(prop, cb, options) {
        this.cb = cb;
        this.prop = prop;
        this.options = options;
    }

    notify(oldVal, newVal) {
        this.cb(oldVal, newVal);

    }

    isDeep() {
        return this.options && this.options.deep === true;
    }


    destroy() {
        this.cb = undefined;
    }


}
export default Model;