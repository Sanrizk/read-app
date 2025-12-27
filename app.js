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
    const indexBook = books.findIndex(book => book.Slug === slug)
    const book = books[indexBook]

    return [book, indexBook]
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

app.get('/api/books/:slug', async (req, res) => {
    const slug = req.params.slug
    const [book, indexBook] = await getBook(slug)
    if (indexBook < 0) {
        res.status(401).json({ message: "Data Tidak Ditemukan", data: "" })
    } else {
        res.status(201).json({ message: "Data Ditemukan", data: book })
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

    content = { ...content, ...defaultPropBook }

    books.push(content)

    try {
        await saveBooks(books)
        res.status(201).json({ message: 'Data ditambahkan', data: content })
    } catch (err) {
        console.error(err)
    }
})

app.put('/api/books/edit/:slug', async (req, res) => {
    const slug = req.params.slug
    const books = await getBooks('./data.json')
    const [book, indexBook] = await getBook(slug)

    if (indexBook < 0) {
        res.status(401).json({ message: 'Data Tidak Ditemukan' })
    } else {
        const updateData = req.body
        books[indexBook] = { ...book, ...updateData }
        await saveBooks(books)
        res.status(201).json({ message: 'Data Diubah' })
    }

})

app.delete('/api/books/del/:slug', async (req, res) => {
    const slug = req.params.slug
    const books = await getBooks('./data.json')
    const [book, indexBook] = await getBook(slug)

    if (indexBook < 0) {
        res.status(401).json({ message: 'Data tidak Ditemukan' })
    } else {
        const updateBooks = books.filter(book => book.Slug !== slug)
        saveBooks(updateBooks)
        res.status(201).json({ message: 'Data Dihapus' })
    }

})

// server menangkap
app.listen(port, () => {
    console.log(`Server Running on port: http://localhost:${port} \nRunning....`)
})


// Next buat endpoint CRUD
// create = http://localhost:3000/books/add [sudah]
// read per item = http://localhost:3000/books/:slug [sudah]
// read all item = http://localhost:3000/books [sudah]
// update = http://localhost:3000/books/edit/:slug [sudah]
// delete = http://localhost:3000/books/del/:slug [sudah]

// *add* ==> next edit 
// slug auto generate judul 
// status dan reading auto isi di data



