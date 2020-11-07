const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Teacher = require('./models/teacher');
const Student = require('./models/student');
const Class = require('./models/class');
const cors = require('cors');
app.use(cors());


mongoose.connect('mongodb+srv://mhd:123@classes.8mkn9.mongodb.net/graduation?retryWrites=true&w=majority').then(res=>{app.listen(3000)}).catch(e=>{console.log(e)});


//middleware :
app.use(express.urlencoded({extended : false}));
app.use(express.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

//routes
app.post('/classes', (req,res)=>{  
    const class1 = new Class({
        className: 'Java',
        students: [{
            firstName:'mazen',
            lastName:'al-samman',
            id_number:'22312'
        } ,{
            firstName:'ahmad',
            lastName:'al-khalid',
            id_number:'12345'
        },
        {
            firstName:'khaled',
            lastName:'al-ahmad',
            id_number:'12423'
        } ],
        history:[{
            date: '26-10-2020',
            students:['ahmad','mazen','khaled']
        }]
    });
    class1.save().then(response=>{ res.json(response)}).catch(e=>{res.status(400).json("error while saving the class data "+e)});
});


app.post('/students', (req,res)=>{
    console.log("Request : ") ;
    console.log(req.body) ;
    const std1 = new Student({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        id_number:req.body.id_number,
        password:req.body.password,
        faceID :req.body.faceID,
        images:req.body.images
    });
        std1.save().then(response=>{ res.json(response)}).catch(e=>{res.status(400).json("error while saving the student data "+e)});    
});

app.get('/students' , (req , res) => {
    res.end("Hello From API") ;
});



