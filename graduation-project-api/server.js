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

//Teachers
app.post('/loginTeacher' , (req , res)=>{
  Teacher.find({id_number:req.body.id,password:req.body.password}, function(err, result) {
    if (err) {
      console.log(err,"error while fetching teacher");
    } else {
      console.log(result);
      res.json(result);
    }
  });
});

app.post('/teachers' , (req , res)=>{
  const newTeacher = new Teacher({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    id_number:req.body.id_number,
    password:req.body.password,
  });
  newTeacher.save().then(response=>{ res.json(response)}).catch(e=>{res.status(400).json("error while saving the Teacher data "+e)});
});

//Classes
app.get('/classes' , (req , res)=>{
  Class.find({}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.json(result);
    }
  });
})

app.post('/classes', (req,res)=>{
  const arrStudents=[];
  console.log(req.body) ;
  const idsArr = req.body.ids ;
  const fnames = req.body.fnames ;
  const lnames = req.body.lnames ;

  for(let i = 0 ; i < idsArr.length ; i++){
    let obj = {
      firstName : fnames[i] ,
      lastName : lnames[i],
      id_number : idsArr[i]
    }
    arrStudents.push(obj) ;
  }
  
  const class1 = new Class({
    className: req.body.className ,
    students: arrStudents
  });
    console.log(class1);
    class1.save().then(response=>{ res.json(response)}).catch(e=>{res.status(400).json("error while saving the class data "+e)});
});



//Students
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
 
    Student.find({}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
            result= result.map((std)=>{
                // let st = `${std.firstName} ${std.lastName}  |  ${std.id_number}`;
                let st = {
                    'fname' : `${std.firstName}`,
                    'lname' : `${std.lastName}` ,
                    'id' : `${std.id_number}` ,
                }
                return st;
            });
            console.log(result);
          res.json(result);
        }
      });
});


