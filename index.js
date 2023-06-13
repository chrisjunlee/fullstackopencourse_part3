require('dotenv').config() 
const express = require('express')
const morgan = require('morgan')
const app = express()

const cors = require('cors')
app.use(cors())

const Person = require('./models/person')

app.use(express.static('build'))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// activating JSON parser middleware 
app.use(express.json())
app.use(requestLogger)

// logging middleware
morgan.token('body', function(req, res) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons =
[
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/', (req, res) => {
    res.send('<h1>backend index.js</h1>')
})

app.get('/api/persons', (req, res) => {
    // res.json(persons)
    Person.find({}).then(person => res.json(person))
})

app.post('/api/persons', (req, res, next) => {
    let body = req.body 
    if (!body.name) {
        return res.status(400).json(
            { error: 'Name Missing' })
    } 

    if (!body.number) {
        return res.status(400).json(
        { error: 'Number Missing' })
    }

    if (persons.find(p => p.name.toLowerCase() == body.name.toLowerCase())) {
        return res.status(400).json(
            { error: "Person with that name already exists"})
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    console.log('Adding person', person)
    person.save()
    .then( savedPerson => res.json(savedPerson))
    .catch(err => next(err)) 
})

app.put('/api/persons/:id', (req, res, next) => {
    console.log('Updating PUT', req.body)
    Person.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true, context: 'query'})
        .then(updatedPerson => res.json(updatedPerson))
        .catch(err => next(err))
})

app.get('/info', (req, res) => {
    Person.find({}).then(dbRes => {
        let page = "<div>Phonebook has info for " +
            dbRes.length + " people <br/><br/>" +
            Date() + "</div>"
        res.send(page)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    console.log('Finding', req.params.id)
    Person.findById(req.params.id)
    .then(person => {
        person? res.json(person) : res.status(404).end()
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
    console.log('Deleting', req.params.id)
    Person.findByIdAndDelete(req.params.id)
    .then(res.status(204).end())
    .catch(err => next(err))
})

// this middleware has to be defined after routes section
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

// port 3001 required for Fly.io
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})