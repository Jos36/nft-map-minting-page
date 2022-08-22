const { default: mongoose } = require("mongoose");

mongoose.connect(process.env.DB_URL, (err) => {
    if (err) {
        console.log(err);
    }
})


mongoose.connection.once("open", () => console.log("Database Connection Established!"));
