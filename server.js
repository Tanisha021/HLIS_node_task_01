const express = require('express');
const conn = require('./config/database');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();
const path = require("path");
const port = process.env.PORT || 3000;
const session = require("express-session");
// const ejsLayouts = require("express-ejs-layouts");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html',require('ejs').renderFile);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// app.set('view engine','html');
// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.get('/profile_page',(req,res)=>{
        if (!req.session.user) {
          return res.redirect("/login");
        }
        res.render("profile", { user: req.session.user });
});

app.get('/addUser', (req, res) => {
    res.render('addUser.ejs'); 
});

app.get('/listing', async (req,res)=>{
    const [result]= await conn.query("select * from tbl_user where is_deleted=0");
                if(result.length>0){
                    res.render("listing",{data:result});
                }else{
                    res.render("listing",{data:[]});
                }
});

// app.get('/listing',function(req,res){
//     conn.query("select * from tbl_user where is_deleted=0",function(err,result){
//         if(!err && result.length>0){
//             res.render("listing",{data:result});
//         }else{
//             res.render("listing",{data:[]});
//         }
//     });
// });

//Load Login Page
app.get('/login', (req, res) => {
    res.render('login', { user: req.session.user });
  });

//Handle Login
    app.post("/login", async (req, res) => {
        try {
        const { email_id, passwords } = req.body;
        console.log(email_id, passwords);
    
        // Use await for the promise-based query
        const [user] = await conn.query(
            "SELECT * FROM tbl_user WHERE email_id = ? AND passwords = ?",
            [email_id, passwords]
        );
        console.log("user", user);
        
        if (user.length > 0) {
            req.session.user = user[0];
            res.redirect("/listing");
        } else {
            res.render("login", { error: "Invalid email or password. Please try again." });
        }
        } catch (error) {
        console.error("Error during login:", err);
        res.status(500).send("Error during login. Please try again.");
        }
    });
  

app.get('/edit/:id',async(req,res)=>{
    let userId = req.params.id;
    console.log(userId);
    const [result]=await conn.query("SELECT * FROM tbl_user WHERE user_id = ? AND is_deleted = 0", [userId]);
        if(result.length>0){
            res.render("edit",{data:result[0]});
        }else{
            res.render("edit",{data:[]});
        }
});

app.post('/editUser/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { user_full_name, email_id, mobile_number, gender } = req.body;
        
        if (!userId || !user_full_name || !email_id || !mobile_number || !gender) {
            return res.status(400).send('Missing required fields');
        }
        
        const userObj = { user_full_name, email_id, mobile_number, gender };
        const [result] = await conn.query("UPDATE tbl_user SET ? WHERE user_id = ?", [userObj, userId]);
        
        return result.affectedRows > 0 ? res.redirect('/listing') : res.status(400).send('Error updating user data');
    } catch (err) {
        console.error('Error updating user:', err);
        return res.status(500).send('Internal Server Error');
    }
});

app.post('/addUser', async (req, res) => {
    try {
        const { user_full_name, email_id, passwords, mobile_number, gender } = req.body;
        
        if (!user_full_name || !email_id || !passwords || !mobile_number || !gender) {
            return res.status(400).send('Missing required fields');
        }
        
        const query = "INSERT INTO tbl_user (user_full_name, email_id, passwords, mobile_number, gender, is_deleted) VALUES (?, ?, ?, ?, ?, 0)";
        const [result] = await conn.query(query, [user_full_name, email_id, passwords, mobile_number, gender]);
        
        return result.affectedRows > 0 ? res.redirect('/listing') : res.status(400).send('Error adding user');
    } catch (err) {
        console.error('Error adding user:', err);
        return res.status(500).send('Internal Server Error');
    }
});

  
app.get("/delete/:id", async (req, res) => {
    try {
      const result = await conn.query("DELETE FROM tbl_user WHERE user_id = ?", [
        req.params.id,
      ]);
  
      if (result.affectedRows === 0) {
        return res.status(404).send("User not found.");
      }
      res.redirect("/listing");
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).send("Error deleting user. Please try again.");
    }
  });
  
  
//Logout
  app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).send("Error logging out. Please try again.");
      }
      res.redirect("/login");
    });
  });


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})