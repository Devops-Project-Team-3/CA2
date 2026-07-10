require("dotenv").config();

const express = require("express");

const studyRoutes = require("./routes/studyRoutes");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

app.use("/", studyRoutes);

app.listen(process.env.PORT, () => {

    console.log(
        `Running on ${process.env.PORT}`
    );

});