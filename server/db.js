const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medilink')

.then(() => {
    console.log("MongoDB Connected Successfully!");
})

.catch((error) => {
    console.log("MongoDB Connection Failed:", error);
});
