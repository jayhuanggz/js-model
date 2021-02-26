import Model from './model'

import ArrayModel from './array'


let Factory = {

    create(parent, prop, val) {
        if (typeof val === 'undefined') {
            return new Model(parent, prop);
        }

        if (Array.isArray(val)) {
            return new ArrayModel(parent, prop, val);
        } else {
            let result = new Model(parent, prop, val);
            if (typeof val === 'object') {
                for (var key in val) {
                    if (Object.prototype.hasOwnProperty.call(val, key)) {
                        Factory.create(result, key, val[key]);
                    }
                }
            }
            return result;
        }

    }
}

export default Factory;