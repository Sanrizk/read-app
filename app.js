// buat variabel require express, panggil express, port
const express = require('express')
const fs = require('fs')
const fsP = require('fs').promises
const app = express()
const cors = require('cors')
const port = 3000
const dataJson = './data.json'


app.use(cors())

app.use(express.urlencoded({ extended: true }))

// middleware untuk parsing body menjadi json (biasanya untuk post dll)
app.use(express.json())

const getBooks = async (fileData) => {
    let dataBooks = []

    try {
        dataBooks = await fsP.readFile(fileData)
        dataBooks = JSON.parse(dataBooks)
    } catch (err) {
        console.error('Error', err)
    }

    return dataBooks
}

const saveBooks = async (books) => {
    fsP.writeFile('./data.json', JSON.stringify(books, null, 4))
}

const getBook = async (slug) => {
    const books = await getBooks('./data.json')
    const indexBook = books.findIndex(book => book.slug === slug)
    
    return {}
}

app.get('/api/books', async (req, res) => {
    // jika ada baca data di file json
    if (fs.existsSync('data.json')) {

        const data = await getBooks('./data.json')
        res.status(201).json({ message: 'Success', data })

    } else {
        // file gak ada maka dibuat baru kosongan
        // --start--
        const content = []
        fs.writeFile('data.json', JSON.stringify(content, null, 4), err => {
            if (err) {
                console.error(err);
            } else {
                res.send('File "data.json" has been written successfully.');
            }
        });
        // --end--
    }
})

app.post('/api/books/add', async (req, res) => {
    const books = await getBooks('./data.json')
    let content = req.body

    let defaultPropBook = {
        Status: {
            IsRead: false,
            IsRomawiPage: false,
            IsPage: false
        },
        ReadingNumber: 0
    }

    content = {...content, ...defaultPropBook}

    books.push(content)

    try {
        await saveBooks(books)
        res.status(201).json({ message: 'Data ditambahkan', data: content })
    } catch (err) {
        console.error(err)
    }
})

// server menangkap
app.listen(port, () => {
    console.log(`Server Running on port: http://localhost:${port} \nRunning....`)
})


// Next buat endpoint CRUD
// create = http://localhost:3000/books/add [sudah]
// read per item = http://localhost:3000/books/:slug
// read all item = http://localhost:3000/books [sudah]
// update = http://localhost:3000/books/edit/:slug
// delete = http://localhost:3000/books/del/:slug

// *add 
// slug auto generate judul 
// status dan reading auto isi di data


