import  express  from "express";
import mysql from "mysql";
import bcrypt from "bcrypt";
import session  from "express-session";
const port = 3000;

const app = express(); 
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'',
  database: 'Poeticpinnacle'
});

//static files
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/css', express.static(__dirname + '/public/css'));


//templating engine

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}))


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

app.use((req, res, next) => {
  if(req.session.userID === undefined) {
      res.locals.isLoggedIn = false;
  } else {
      res.locals.isLoggedIn = true;
      res.locals.username = req.session.username;
      res.locals.userID = req.session.userID;
  }
  next();
});



app.get('/', (req, res) => {
    
    res.render('home.ejs', {});
    
})
app.get('/poems', (req, res) => {
    
  res.render('poems.ejs', {});
  
})
app.get('/login', (req, res) => {
  if(res.locals.isLoggedIn) {
      res.redirect('/')
  } else {
      res.render('login.ejs', {error: false})
  }
});
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (error, results) => {
          if (error) {
              console.error('Error retrieving user:', error);
              res.status(500).send('Internal Server Error');
              return;
          }

          if (results.length > 0) {
              bcrypt.compare(password, results[0].password, (error, isEqual) => {
                  if (error) {
                      console.error('Error comparing passwords:', error);
                      res.status(500).send('Internal Server Error');
                      return;
                  }

                  if (isEqual) {
                      // Set session variables
                      // req.session.userID = results[0].id;
                      // req.session.username = results[0].username;

                      // Redirect to profile page with user ID
                      res.redirect('/' );
                  } else {
                      let message = 'Email/password mismatch.';
                      res.render('login.ejs', {
                          error: true,
                          errorMessage: message,
                          email: email,
                          password: password
                      });
                  }
              });
          } else {
              let message = 'Account does not exist. Please create one.';
              res.render('login.ejs', {
                  error: true,
                  errorMessage: message,
                  email: email,
                  password: password
              });
          }
      }
  );
});

app.get('/signup', (req, res) => {

  let user = {
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
}

res.render('signup.ejs', {error:false, user: user})

})
app.post("/signup", (req, res) =>{
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;
  

  if (password === confirmPassword) {
      bcrypt.hash(password, 10, (error, hash) => {
          if (error) {
              // Handle bcrypt hashing error
              console.error("Error hashing password:", error);
              res.status(500).send("Internal Server Error");
              return;
          }

          connection.query(
              'SELECT email FROM users WHERE email = ?',
              [email],
              (error, results) => {
                  if (error) {
                      // Handle database query error
                      console.error("Error querying database:", error);
                      res.status(500).send("Internal Server Error");
                      return;
                  }

                  if (results.length === 0) {
                      connection.query(
                          'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
                          [email, username, hash],
                          (error, results) => {
                              if (error) {
                                  // Handle database insertion error
                                  console.error("Error inserting user into database:", error);
                                  res.status(500).send("Internal Server Error");
                                  return;
                              }

                              // Redirect to login page after successful signup
                              res.redirect("/login");
                          }
                      );
                  } else {
                      let message = 'Email already exists.'
                      res.render('signup.ejs', {
                          error: true,
                          errorMessage: message,
                          email: email,
                          username: username,
                          password: password,
                          confirmPassword: confirmPassword
                      })
                  }
              }
          );
      });
  } else {
      let message = 'Password & Confirm Password do not match.'
      res.render('signup.ejs', {
          error: true,
          errorMessage: message,
          email: email,
          username: username,
          password: password,
          confirmPassword: confirmPassword
      });
  }
});



app.get('*', (req, res) => {
    res.render('404.ejs')
});

app.listen(port, (err) => {
    if (err) {
      console.error(`Error starting the server: ${err}`);
    } else {
      console.log(`Server is running on port ${port}`);
    }
  });