const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

//    `mongodb+srv://chrisjunlee:${password}@cluster0.yrqcltw.mongodb.net/?retryWrites=true&w=majority`
const url = process.env.MONGODB_URI

console.log('Connecting:', url)
mongoose.connect(url)
    .then(res => {console.log('connected to MongoDB')})
    .catch( err => {console.log('error connecting to MongoDB:', err.message)})

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name required'],
        minLength: 3},
    number: {
        type: String,
        required: [true, "Number required"],
        validate: {
            validator: (num) => /\d{3}-\d{3}-\d{4}/.test(num) ,
            message: props => `${props.value} is not a valid phone number`
        }
    }
})

personSchema.set('toJSON', {
    transform: (doc, retObj) => {
        retObj.id = retObj._id.toString()
        delete retObj._id
        delete retObj.__v
    }
})

module.exports = mongoose.model('Person', personSchema)