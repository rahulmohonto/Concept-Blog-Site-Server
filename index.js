const express = require('express')
const app = express()
// const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const cors = require('cors');
const bodyParser = require('body-parser');
// const admin = require("firebase-admin");
require('dotenv').config();
const port = process.env.PORT || 5800

app.use(bodyParser.json());
app.use(cors());

// console.log(process.env.DB_USER)

app.get('/', (req, res) => {
    res.send(` Hello Rahul Mohonto Welcome to port ${port}`)
});


var admin = require("firebase-admin");

var serviceAccount = require("./configs/concept-blog-site-firebase-adminsdk-81pho-26b7c672c8.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://concept-blog-site.firebaseio.com"
});


console.log(process.env.DB_USER)

const { MongoClient } = require('mongodb');
const uri = ` mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gqoeb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const blogCollection = client.db(`${process.env.DB_NAME}`).collection("blogs");
    const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admins");


    app.post('/addBlogs', (req, res) => {
        const blogData = req.body;

        console.log(blogData);
        blogCollection.insertOne(blogData)
            .then(result => {
                res.send(result.insertedCount > 0)
                console.log(result.insertedCount)
            })
    })


    app.get('/allBlogs', (req, res) => {
        blogCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })



    app.post('/allBlogs', (req, res) => {
        const blogData = req.body;
        const email = req.body.email
        console.log(blogData);
        adminCollection.find({ email: email })
            .toArray(err, admin => {
                const filter = { email: email }
                if (admin.length === 0) {
                    filter.email = email;
                }

                blogCollection.find(filter)
                    .toArray(err, documents => {
                        res.send(documents);
                    })
            })

    })


    app.get('/isAdmin', (req, res) => {
        // const email = req.body.email;
        adminCollection.find({})
            .toArray((error, documents) => {
                res.send(documents)
            })
    })

    app.delete('/deleteBlogs/:id', (req, res) => {
        const id = ObjectId(req.params.id);
        console.log('delete this product', id)
        blogCollection.findOneAndDelete({ _id: id })
            .then(result => {
                res.send(result.deletedCount > 0)
                console.log(result)
            })
            .catch(err => console.error(`Failed to find and delete document: ${err}`))

    })


    console.log("database connected successfully");
});





app.listen(port, () => {
    console.log(`Welcome rahul Mohonto at port http://localhost:${port}`)
})