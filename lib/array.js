import Model from './model'

class ArrayModel extends Model {
    constructor(parent, prop, value) {
        super(parent, prop, value);
        this.updating = false;
    }
    get(target, prop) {

        if (this.isMutationMethod(prop)) {
            this.updating = true;
        }
        return Reflect.get(target, prop);
    }
    set(target, prop, val) {

        Reflect.set(target, prop, val);

        if (prop === 'length') {
            this.updating = false;
            this.notify(target, target);
        } else if (prop >= 0 && !this.updating) {
            this.notify(target, target);
        }
        return true;
    }

    deleteProperty(target, prop) {
        if (!this.updating) {
            throw new Error('Array must delete elements using pop/shift/splice!');
        }
        let result = Reflect.deleteProperty(target, prop);
        this.notify(target, target);
        return result;

    }

    isMutationMethod(prop) {
        return prop === 'push' || prop === 'pop'
            || prop === 'splice' || prop === 'unshift'
            || prop === 'shift';
    }

}

export default ArrayModel;