const express = require("express")
const app = express()
require('dotenv').config()
const mongoose = require('mongoose');
app.set('view engine', 'ejs');
app.use(express.static('public'))
const Schema = mongoose.Schema;
const httpServer = require("http").createServer(app);
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //Used to parse JSON bodies


const EntrySchema = new Schema({
    sentence: String,
    date: { type: Date, default: new Date() }
});
Entry = mongoose.model('Entry', EntrySchema);
app.get("/", (req, res) => {
    Entry.find({}).sort({ date: 1 }).exec((err, docs) => {
        let paragraph = ""
        docs.map(entry => {
            paragraph += entry.sentence
        })
        res.render("home", { paragraph: paragraph })
    });

})

app.post("/", (req, res, next) => {
    if (!req.body.sentence) return next()
    let entry = new Entry()
    entry.sentence = req.body.sentence

    entry.save((err, done) => {
        if (err) return next(err)
        res.json({ message: "done" })
    })
})

io.on("connection", socket => {


    socket.on("append", (arg) => {
        socket.broadcast.emit("add", arg);
        socket.emit("add", arg);
    });
});
mongoose.connect(process.env.DB_URL).then(() => {
    console.log("Connected to DB")

    httpServer.listen(process.env.PORT, () => {
        console.log("Listening on port 3000")
    })
}).catch(() => {
    console.log("DB connection failed")
})
