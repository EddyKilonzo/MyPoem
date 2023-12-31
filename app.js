const express = require('express');
const app = express(); 
const port = 3000;

//static files
app.use(express.static('public'));
app.use('/css', express.static( __dirname + 'public/css'));
app.use('/images', express.static(__dirname + +'public/images'));
app.use('/js', express.static(__dirname + 'public/js'));


//templating engine

app.set('views', './views');
app.set('view engine', 'ejs');





app.get('/', (req, res) => {
    
    res.render('home.ejs', {});
    
})




app.listen(port, (err) => {
    if (err) {
      console.error(`Error starting the server: ${err}`);
    } else {
      console.log(`Server is running on port ${port}`);
    }
  });