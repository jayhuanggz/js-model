js-model is a library to create watchable objects/models using Proxy and Reflect, written in pure javascript with no dependency. Api is simliar to vuex with support for:



* Watch for array operations

* Deep watch

* Mutations and actions





```
import jsmodel from 'js-reactive-model'


        let def = {
            state() {
                return {
                    name: 'Jay',
                    mobile: '123456789',
                    skills: ['java', 'react', 'vue', 'architecture'],
                    company: {
                        name: 'Essue',
                        position: 'Founder'
                    }
                }
            },
            mutations: {

            },
            actions: {

            }
        }
        let model = jsmodel(def);
        let watches = [];
        watches.push(model.watch('name', (oldVal, newVal) => {
            console.log('name changed')
        }));
        
        watches.push(model.watch('skills', (oldVal, newVal) => {
            console.log('skills changed')
        }));

       watches.push( model.watch('company', () => {
            console.log('company changed');
        }, {
            deep: true
        }));


        model.name = 'Kevin'
        model.skills.push('Distributed Systems');
        model.skills = [];
        model.company.name = 'Coolzhua Tech'
        
        watches.forEach(w->w());
        model.destroy();
```





