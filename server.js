const { clerkClient } = require('@clerk/clerk-sdk-node');
const express = require("express")
const bodyParser = require('body-parser');
let receivedData
const pool = require("./db/db")
const app= express()
const cors = require('cors');
app.use(express.json())
app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
    credentials: true
}))

require("dotenv").config()
const port =  8000 || process.env.PORT 

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
        
        
        const result = await pool.query(query, [title, category_id, description, price, user_id, image_url,]);
        console.log('Data added successfully')
        res.send({status:result, message: 'Data added successfully' });
       /*catch (error) {
        console.error('Error adding data to the database:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
      }*/
})

app.get('/getUser', async (req, res) => {
    const userId = 'user_2gmZJOP3rVJjoSzdi1bueT10z8g';

        const response = await clerkClient.users.getUser(userId)

        console.log(response);

        res.status(200).send(response)

})

app.get("/products", async (req,res) => {
    const query = 'SELECT * FROM products';
    const data = await pool.query(query);
    res.status(200).send({  status:"success" 
                            ,children: data.rows} )
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
app.get("/categories", async (req,res) => {
    const query = 'SELECT * FROM categories ORDER BY category_id ASC';
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
    try{
        const phone_number = await (await clerkClient.users.getUser(data.rows[0].user_id)).phoneNumbers[0].phoneNumber
        res.status(200).send({children: data.rows,phone_number:phone_number} )
    }catch(e){
        console.log(e)
        res.status(200).send({children: data.rows} )
    }
    
    
    
})

//giriş yapılı kullanıcının ilanlarını göstermek için
app.get("/products/user_id=:user_id", async (req,res) => {
    const query = `SELECT * FROM products WHERE user_id='${req.params.user_id}'`;
    console.log(req.params.user_id)
    const data = await pool.query(query);
    res.status(200).send({children: data.rows} )
})
app.get("/products/cat_id=:cat_id", async (req,res) => {
    const query = `SELECT * FROM products WHERE category_id='${req.params.cat_id}'`;
    console.log(req.params.cat_ids)
    const data = await pool.query(query);
    res.status(200).send({children: data.rows} )
})
//arama sonucuna gore urunleri dondurur
app.get("/products/search=:search", async (req,res) => {
    const search = req.params.search
    try{
        console.log("try")
        const query = `SELECT *
        FROM products
        WHERE title ILIKE '${search}%'    
        OR title ILIKE '%${search}'     
        OR title ILIKE '%${search}%'`;
        console.log(req.params.search)
        const data = await pool.query(query);
        res.status(200).send({children: data.rows} )
       
        
    }catch(e){
        console.log("try")
        console.log(e)
        res.status(500).send({message: "Veri getirilirken hata olustu"} )
    }

})
//wishliste ekle
app.post("/wishlist",async (req,res) => {
    const { product_id, user_id } = req.body
    console.log("wishlist",req.body)
    const query = 'INSERT INTO wishlist (product_id, user_id) VALUES ($1, $2)'
    try{
        await pool.query(query,[product_id,user_id])
        res.status(200).send({message: "basarili"})
    }catch(err){
        res.status(500).send({message: err.message})
    }
})
//urunu wishlistten kaldirir
app.post("/deleteFromWishlist", async (req, res) => {
    const { product_id, user_id } = req.body
    console.log("wishlistDelete",req.body)
    const query = 'DELETE FROM wishlist WHERE product_id=$1 AND user_id=$2'
    try{
        await pool.query(query,[product_id,user_id])
        res.status(200).send({message: "basarili"})
    }catch(err){
        res.status(500).send({message: err.message})
    }
})
//kullanicinin favoriledikleri
app.get("/favByUser/:user_id", async (req,res) => {
    const user_id = req.params.user_id
    const query = `SELECT p.*
                    FROM wishlist w
                    JOIN products p ON w.product_id = p.product_id
                    WHERE w.user_id = '${user_id}'`
    try{
        const data = await pool.query(query)
        res.status(200).send({children: data.rows})
    }catch(err){
        res.status(500).send({message: err.message})
    }             
})
// kullanici bu urunu favladi mi
app.get('/isFav/product_id=:product_id;user_id=:user_id', async (req, res) => {
    const { product_id, user_id } = req.params
    const query = `SELECT * FROM wishlist WHERE product_id = $1 AND user_id = $2`
    try{
        const data = await pool.query(query,[product_id,user_id])
        if(data.rows.length == 1){
            res.status(200).send(true)
        }
        else{
            res.status(200).send(false)
        }    
    }catch(err){
        res.status(500).send(err)
    }
})
//gelen product id ye göre veritabanından siler
app.delete("/products/:product_id", async (req,res) => {
    receivedData = req.body;
    const product_id = req.params.product_id
    try{
        const query = `DELETE FROM products WHERE product_id='${product_id}'`;
        await pool.query(query);
        
        console.log(`Urun silme basarili. Product ID: ${product_id}`)
        await pool.query(query);
        res.status(200).send({message: `Urun silme basarili. Product ID: ${product_id}`} )
    }
    catch (error) {
        console.error(`Urun silme basariSIZ. Product ID: ${product_id}`, error.message);
        res.status(500).json({ error: `Urun silme basarisiz. Product ID: ${product_id}` });
    }

})

app.post('/search', async (req, res) => {
    const { word } = req.body
    console.log(word)
    const query = `SELECT * FROM products WHERE title LIKE '%${word}%'`;
    const data = await pool.query(query);
    res.status(200).send({children: data.rows} )
})
app.listen(port, () => {
    console.log("Server "+port+" portundan çalışıyor")
})
