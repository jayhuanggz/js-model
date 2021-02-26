import Factory from './lib/model_factory'

class Instance {
    constructor(def) {
        let data = def.state;

        if (typeof data === 'undefined') {
            data = {};
        } else if (typeof data === 'function') {
            data = data();
        }

        if (typeof data !== 'object') {
            throw new Error('state must be an object!');
        }

        this.model = Factory.create(undefined, undefined, data);
        this.mutations = def.mutations;
        this.state = this.model.proxy(data);
    }

    commit(name, data) {

        let mutations = this.mutations, mutation;
        if (mutations && Object.prototype.hasOwnProperty.call(mutations, name)) {

            mutation = mutations[name];
            if (typeof mutation !== 'function') {
                mutation = undefined;
            } else {
                mutation.call(this.state, this.state, data);
            }
        }

        if (typeof mutation === 'undefined') {
            throw new Error('Invalid mutation method: ' + name);
        }
    }

    watch() {
        return this.model.watch.apply(this.model, arguments);
    }

    destroy() {
        this.model.destroy();
    }
}


export default function (def) {
    return new Instance(def);
}