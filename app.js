import express from "express";
import mysql from "mysql";
import session from "express-session";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs')

// Serve static files
app.use(express.static('public'))
app.use(express.static(join(__dirname, 'public')));
app.use(express.static(join(process.cwd(), 'public')));

// Parse URL-encoded bodies
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'',
  database: 'Poeticpinnacle'
});
// Connect to MySQL
connection.connect((err) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return;
    }
    console.log('Connected to database');
  });





//templating engine

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}))

// const session = require('express-session');
app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  }));

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


app.get('/login', (req, res) => {
    if(req.session.isLoggedIn) {
        res.redirect('/')
    } else {
        res.render('login.ejs', {error: false})
    }
  });
  
  app.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    connection.query(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password],
        (error, results) => {
            if (results.length > 0) {
                req.session.isLoggedIn = true;
                req.session.userID = results[0].UserID; // Set the userID in the session
                req.session.username = results[0].username;
                console.log(results);
                console.log(results[0].UserID);
                res.redirect('/');
            } else {
                let message = 'Email/password mismatch.';
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
app.post("/signup", (req, res) => {
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;

    if (password !== confirmPassword) {
        let message = 'Password & Confirm Password do not match.';
        return res.render('signup.ejs', {
            error: true,
            errorMessage: message,
            email: email,
            username: username,
            password: password,
            confirmPassword: confirmPassword
        });
    }

    connection.query(
        'SELECT email FROM users WHERE email = ?',
        [email],
        (error, results) => {
            if (error) {
                console.error("Error querying database:", error);
                return res.status(500).send("Internal Server Error");
            }

            if (results.length === 0) {
                connection.query(
                    'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
                    [email, username, password], // Note: Storing password in plain text
                    (error, results) => {
                        if (error) {
                            console.error("Error inserting user into database:", error);
                            return res.status(500).send("Internal Server Error");
                        }
                        // Set session variables upon successful signup
                        req.session.userID = results.insertId; // Assuming insertId is the ID of the newly inserted user
                        req.session.username = username;

                        res.redirect("/login");
                    }
                );
            } else {
                let message = 'Email already exists.';
                res.render('signup.ejs', {
                    error: true,
                    errorMessage: message,
                    email: email,
                    username: username,
                    password: password,
                    confirmPassword: confirmPassword
                });
            }
        }
    );
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.redirect('/');
    });
});
app.get('/', (req, res) => {
    
    res.render('home.ejs', {});
    
})
app.get('/poems', (req, res) => {
    
  res.render('poems.ejs', {});
  
})
app.get('/profile/:username', (req, res) => {
    if(res.locals.isLoggedIn && req.session.username === (req.params.username)) {
        connection.query(
            `SELECT * FROM users WHERE username = ?`,
            [req.params.username],
            (err, user) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render('profile.ejs',{user:user[0]});
                    console.log(user);
                }                
            }
        )
    } else {
        console.log('not logged in or id mismatch');
        res.redirect('/poems');

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