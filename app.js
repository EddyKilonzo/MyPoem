const express = require('express');
const app = express(); 

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    
    res.render('home.ejs', {});
    
})



const port = 3000;
app.listen(port, (err) => {
    if (err) {
      console.error(`Error starting the server: ${err}`);
    } else {
      console.log(`Server is running on port ${port}`);
    }
  });