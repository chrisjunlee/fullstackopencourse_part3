const express = require('express')
const morgan = require('morgan')
const app = express()

const cors = require('cors')
app.use(cors())

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
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.post('/api/persons', (req, res) => {
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

    const person = {
        name: body.name,
        number: body.number,
        id: generateID()
    }

    console.log('Adding person', person)
    persons = persons.concat(person)
    console.log('Result array', persons)

    res.json(person)
})

const generateID = () => {
    return Math.floor(Math.random() * persons.length * 1000)
}

app.get('/info', (req, res) => {
    let page = "<div>Phonebook has info for " +
        persons.length + " people <br/><br/>" +
    Date() + "</div>" 
    res.send(page)
})

app.get('/api/persons/:id', (req, res) => {
    let id = Number(req.params.id)
    let person = persons.find( p => p.id == id)

    console.log('get person', id, person)

    person? res.json(person) : res.status(404)
})

app.delete('/api/persons/:id', (req, res) => {
    let id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)
    console.log('deleting: ', id, persons)
    res.status(204).end()
})

// this middleware has to be defined after routes section
app.use(unknownEndpoint)

// port 3001 required for Fly.io
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})