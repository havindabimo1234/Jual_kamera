const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')


const app = express()

const secretKey = 'thisisverysecretkey'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: "kamera"
})

db.connect((err) => {
    if (err) throw err
    console.log('Database connected')
})


const isAuthorized = (request, result, next) => {

    if (typeof(request.headers['x-api-key']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token is not provided'
        })
    }


    let token = request.headers['x-api-key']

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token is invalid'
            })
        }
    })  
    next()
}

app.get('/', (request, result) => {
    result.json({
        success: true,
        message: 'Welcome'
    })
})

app.post('/login', (request, result) => {
    let data = request.body

    if (data.username == 'user' && data.password == 'user123') {
        let token = jwt.sign(data.username + '|' + data.password, secretKey)

        result.json({
            success: true,
            message: 'Login success, welcome!!!',
            token: token
        })
    }

    result.json({
        success: false,
        message: 'You are not person with username user and have password user!'
    })
})

app.get('/kamera', isAuthorized, (req, res) => {
    let sql = `
        select * from transaksi
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Data berhasil diambil dari database',
            data: result
        })
    })
})

app.post('/transaksi', isAuthorized, (request, result) => {
    let data = request.body

    let sql = `
        insert into transaksi (nama_user, jenis_barang, tanggal_beli)
        values ( '`+data.nama_user+`', '`+data.jenis_barang+`', '`+data.tanggal_beli+`');
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Data berhasil ditambahkan'
    })
})

app.put('/transaksi/:id', isAuthorized, (request, result) => {
    let data = request.body

    let sql = `
        update transaksi
        set  nama_user = '`+data.nama_user+`', jenis_barang = '`+data.jenis_barang+`', tanggal_beli = '`+data.tanggal_beli+`'
        where id = `+request.params.id+`
   `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Data berhasil diubah'
    })
})

// endpoint hapus data kamera dari database
app.delete('/transaksi/:id', isAuthorized, (request, result) => {
    let sql = `
        delete from transaksi where id = `+request.params.id+`
    `

    db.query(sql, (err, res) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Data berhasil dihapus'
    })
})


app.listen(8060, () => {
    console.log('running on port 8060')
})