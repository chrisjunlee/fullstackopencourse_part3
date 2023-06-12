const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

//    `mongodb+srv://chrisjunlee:${password}@cluster0.yrqcltw.mongodb.net/?retryWrites=true&w=majority`


console.log('Connecting:', url)
mongoose.connect(url)
    .then(res => {console.log('connected to MongoDB')})
    .catch( err => {console.log('error connecting to MongoDB:', err.message)})

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

personSchema.set('toJSON', {
    transform: (doc, retObj) => {
        retObj.id = retObj._id.toString()
        delete retObj._id
        delete retObj.__v
    }
})

module.exports = mongoose.model('Person', personSchema)