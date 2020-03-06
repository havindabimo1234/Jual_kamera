const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const app = express()

const UsersecretKey = 'thisisverysecretkey'
const AdminsecretKey = 'thisisverysecretkey'

// menggunakan body parser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

// cofig connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: "kamera"
})

// connection database
db.connect((err) => {
    if (err) throw err
    console.log('Database connected')
})


// token admin 
const isAuthorized = (req, res, next) => {

    if (typeof(req.headers['x-api-key']) == 'undefined') {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized. Token is not provided'
        })
    }


    let token = req.headers['x-api-key']

    jwt.verify(token, AdminsecretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Token is invalid'
            })
        }
    })  
    next()
}


// token user
const Authorized = (request, result, next) => {

    if (typeof(request.headers['Authorized']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token is not provided'
        })
    }


    let token = request.headers['Authorized']

    jwt.verify(token, UsersecretKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token is invalid'
            })
        }
    })  
    next()
}

// endpoint untuk login user
app.post('/login/user', (request, result) => {
    let data = request.body
    var username = data.username;
    var password = data.password;

    if ( username && password) {
        db.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {

            if (results.length > 0) {
                let token = jwt.sign(data.username + '|' + data.password, UsersecretKey)

                result.json ({
                success: true,
                message: 'Login berhasil, hallo!',
                token: token
            });
        
            } else {
                result.json ({
                success: false,
                message: 'username atau password anda salah!!'
            });

            }
            result.end();
        });
    }
});

// endpoint untuk login admin
app.post('/login/admin', (request, result) => {
    let data = request.body
    var username = data.username;
    var password = data.password;

    if ( username && password) {
        db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {

            if (results.length > 0) {
                let token = jwt.sign(data.username + '|' + data.password, AdminsecretKey)

                result.json ({
                success: true,
                message: 'Login berhasil, hallo!',
                token: token
            });
        
            } else {
                result.json ({
                success: false,
                message: 'username atau password anda salah!!'
            });

            }
            result.end();
        });
    }
});


// endpoint untuk registrasi
app.post('/registrasi', (request, result) => {
    let data = request.body

    let sql = `
        insert into user (nama_user, username, password, alamat, kontak, gender)
        values ('`+data.nama_user+`', '`+data.username+`', '`+data.password+`', '`+data.alamat+`', '`+data.kontak+`', '`+data.gender+`');
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Registrasi berhasil'
    })
})

// endpoint untuk read data user
app.get('/user', isAuthorized, (req, res) => {
    let sql = `
        select id, nama_user, username, alamat, kontak, gender from user
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

// endpoint untuk menambahkan data user
app.post('/user', isAuthorized, (request, result) => {
    data = request.body

    data.forEach(element => {
        
        db.query(`
        insert into user (nama_user, username, password, alamat, kontak, gender)
        values ('`+element.nama_user+`', '`+element.username+`', '`+element.password+`', '`+element.alamat+`', '`+element.kontak+`', '`+element.gender+`')
        `, 
        (err, result) => {
            if (err) throw err
        })
    });

    result.json({
        success: true,
        message: 'Data user berhasil ditambahkan'
    })
})

// endpoint untuk mengubah data user
app.put('/user/:id', isAuthorized, (request, result) => {
    let data = request.body

    let sql = `
        update user
        set nama_user = '`+data.nama_user+`', username = '`+data.username+`', password = '`+data.password+`', alamat = '`+data.alamat+`', kontak = '`+data.kontak+`', gender = '`+data.gender+`'
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

// endpoint untuk menghapus data user
app.delete('/user/:id', isAuthorized, (request, result) => {
    let sql = `
        delete from user where id = `+request.params.id+`
    `

    db.query(sql, (err, res) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Data berhasil dihapus'
    })
})

// endpoint untuk read data kamera
app.get('/kamera', isAuthorized, (req, res) => {
    let sql = `
        select * from kamera
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

// endpoint untuk menambahkan data kamera
app.post('/kamera', isAuthorized, (request, result) => {
    data = request.body

    data.forEach(element => {
        
        db.query(`
        insert into kamera (jenis_barang, type, warna, spesifikasi, harga, stock, keterangan)
        values ('`+element.jenis_barang+`', '`+element.type+`', '`+element.warna+`', 
        '`+element.spesifikasi+`', '`+element.harga+`', '`+element.stock+`', '`+element.keterangan+`');
        `, 
        (err, result) => {
            if (err) throw err
        })
    });

    result.json({
        success: true,
        message: 'kamera berhasil ditambahkan'
    })
})

// endpoint untuk mengubah data user
app.put('/kamera/:id', isAuthorized, (request, result) => {
    let data = request.body

    let sql = `
        update kamera
        set jenis_barang = '`+data.jenis_barang+`', type = '`+data.type+`', warna = '`+data.warna+`', spesifikasi = '`+data.spesifikasi+`', 
        harga = '`+data.harga+`', stock = '`+data.stock+`',  keterangan = '`+data.keterangan+`'
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

// endpoint untuk menghapus data kamera
app.delete('/kamera/:id', isAuthorized, (request, result) => {
    let sql = `
        delete from kamera where id = `+request.params.id+`
    `

    db.query(sql, (err, res) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Data berhasil dihapus'
    })
})

// endpoint untuk menambahkan data transaksi
app.post('/transaksi', (req, res) => {
    let data = req.body

    db.query(`
        insert into transaksi (user_id, kamera_id, tanggal_beli)
        values ('`+data.user_id+`', '`+data.kamera_id+`', '`+data.tanggal_beli+`')
    `, 
    
    (err, result) => {
        if (err) throw err
    })

    // mengubah stock pada table kamera, apabila ada transaksi maka stock akan mengurang satu
    db.query(`
        update kamera
        set stock = stock - 1
        where id = '`+data.kamera_id+`'`, 
        (err, result) => {
        if (err) throw err
    })

    res.json({
        message: "kamera has been taked by user"
    })
})

// endpoint untuk read data transaksi sesuai id
app.get('/transaksi/:id', (req, res) => {
    db.query(`
        select user.nama_user, kamera.jenis_barang, kamera.type, kamera.warna, 
        kamera.spesifikasi, kamera.harga, kamera.keterangan 
        from user
        right join transaksi on user.id = transaksi.user_id
        right join kamera on transaksi.kamera_id = kamera.id
        where transaksi.id = '`+req.params.id+`'
    `, (err, result) => {
        if (err) throw err

        res.json({
            message: "success get user's kamera",
            data: result
        })
    })
})

// endpoint untuk mengubah data transaksi
app.put('/transaksi/:id', isAuthorized, (req, res) => {
    let data = req.body

    let sql = `
        update transaksi
        set user_id = '`+data.user_id+`', kamera_id = '`+data.kamera_id+`'
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Data berhasil diubah",
            data: result
        })
    })
})

// endpoint untuk menghapus data transaksi
app.delete('/transaksi/:id', isAuthorized, (req, res) => {
    let sql = `
        delete from transaksi
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err
        
        res.json({
            message: "Data berhasil dihapus",
            data: result
        })
    })
})

// port untuk menjalankan program
app.listen(8080, () => {
    console.log('running on port 8080')
})