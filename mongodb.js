const mongoose = require (mongoose);

mongoose.connect('mongodb://localhost: 27017/ PoeticPinnacle')

.then(() => {
    console.log('mongodb connected');
})
.catch(()=> {
    console.log('failed to connect');
})

const LoginSchema = new mongoose.Schema (- {
    name:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})

const collection = new mongoose.model("collection1", LoginSchema)

module.exports = collection