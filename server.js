const express = require("express")
const bodyParser = require('body-parser');
let receivedData
const pool = require("./db/db")
const app= express()
app.use(express.json())
require("dotenv").config()
const port = process.env.PORT

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
}));


app.post("/products", async (req,res)=>{
    receivedData = req.body;
    
    console.log('Received data on server:', receivedData);
    
    
        const {title, category_id, description, price, image_url, user_id} = receivedData
        console.log(category_id )
        // PostgreSQL sorgusu
        const query = 'INSERT INTO products (title, category_id, description, price, user_id, image_url) VALUES ($1, $2, $3, $4, $5, $6)';
        
        // Sorguyu çalıştırma
        await pool.query(query, [title, category_id, description, price, user_id, image_url,]);
        console.log('Data added successfully')
        res.send({ message: 'Data added successfully' });
       /*catch (error) {
        console.error('Error adding data to the database:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
      }*/
})
// Tüm ürünleri listeler
app.get("/products", async (req,res) => {
    const query = 'SELECT * FROM products';
    const data = await pool.query(query);
    res.status(200).send({children: data.rows} )
})
// Kitapları listeler
app.get("/books", async (req,res) => {
    const query = 'SELECT * FROM products WHERE category_id = 1';
    const data = await pool.query(query);
    res.status(200).send({children: data.rows} )
})
// Teknoloji ürünlerini listeler
app.get("/technologies", async (req,res) => {
    const query = 'SELECT * FROM products WHERE category_id = 2';
    const data = await pool.query(query);
    res.status(200).send({children: data.rows} )
})
// Spor ürünlerini listeler
app.get("/sports", async (req,res) => {
    const query = 'SELECT * FROM products WHERE category_id = 3';
    const data = await pool.query(query);
    res.status(200).send({children: data.rows} )
})
// Giyim ürünlerini listeler
app.get("/clothes", async (req,res) => {
    const query = 'SELECT * FROM products WHERE category_id = 4';
    const data = await pool.query(query);
    res.status(200).send({children: data.rows} )
})
//tüm ürünleri id'si azalarak sıralar
app.get("/products:sort=product_id:desc", async (req,res) => {
    const query = 'SELECT * FROM products ORDER BY product_id DESC';
    const data = await pool.query(query);
    res.status(200).send({children: data.rows} )
})
//ürün detay sayfasında ilanlardan gidilen ürünün bilgilerini göstermek için
app.get("/products/id=:product_id", async (req,res) => {
    const query = `SELECT * FROM products WHERE product_id=${req.params.product_id}`;
    console.log(req.params.product_id)
    const data = await pool.query(query);
    res.status(200).send({children: data.rows} )
})

//giriş yapılı kullanıcının ilanlarını göstermek için
app.get("/products/user_id=:user_id", async (req,res) => {
    const query = `SELECT * FROM products WHERE user_id='${req.params.user_id}'`;
    console.log(req.params.user_id)
    const data = await pool.query(query);
    res.status(200).send({children: data.rows} )
})
//gelen product id ye göre veritabanından siler
app.delete("/products/:product_id", async (req,res) => {
    receivedData = req.body;
    
    
    const query = `DELETE FROM products WHERE product_id='${req.params.product_id}'`;
    await pool.query(query);
    console.log(req.params.user_id)
    console.log("Silme işlemi başarılı")
    const data = await pool.query(query);
    res.status(200).send({children: data.rows} )
})
app.listen(port, () => {
    console.log("Server "+port+" portundan çalışıyor")
})
