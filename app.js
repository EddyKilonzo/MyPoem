const express = require('express');
const app = express(); 

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    console.log("hello");
    res.render('home.ejs', {});
})
app.get('')


const port = 3000;
app.listen(port, (err) => {
    if (err) {
      console.error(`Error starting the server: ${err}`);
    } else {
      console.log(`Server is running on port ${port}`);
    }
  });