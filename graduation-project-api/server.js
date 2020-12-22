const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Teacher = require('./models/teacher');
const Student = require('./models/student');
const Class = require('./models/class');
const cors = require('cors');
app.use(cors());

const PORT  = process.env.PORT || 3000;



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

app.post('/createPerson',createPersonHandler);

app.get('/teacherClasses' , (req , res) => {
  const id = req.query.id ;
  Class.find({teacher_id:`${id}`}, function(err, result) {
    if (err) {
      console.log(err,"error while Getting Classes");
    } else {
      console.log(result);
      res.json(result);
    }
  });
});


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
    teacher_id: req.body.teacherID ,
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

mongoose.connect('mongodb+srv://mazen:123@test.nt5v0.mongodb.net/graduation?retryWrites=true&w=majority')
.then(res=>{
  app.listen(PORT,()=>{
    console.log(`Listining on PORT: ${PORT}`)})
  })
.catch(e=>{console.log(e)});


//helper functions :

function createPersonHandler(req,res){
  let {id_number,stName,file}= req.body;
  //check the id in database.
  console.log(file[0]);


  createPersonOnLuxand(stName,file)
  .then(result => {
          let personID = result.id; // get the id for add faces to the same person.
          addFaceTpPerson(file[1],personID)
          .then(data =>{
            addFaceTpPerson(file[2],personID)
            .then(data=>{
              listFacesOfPerson(file[0],personID)
              .then(result => {
                console.log(result)
                res.json(result)})
              .catch(error => console.log('error listing the faces of person..', error));
            })
          })
          .catch(error => console.log('error within adding face to the person ', error));
         
          
          //alert .. added successfully
      })
      .catch(error => console.log('error fetching (create person On API)', error));


  


}
function createPersonOnLuxand(stName,file){


  var formdata = new FormData();
  formdata.append("name", stName);
  formdata.append("photo", file[0], "file");
  formdata.append("store", "1");

  var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow'
  };

  return fetch("https://api.luxand.cloud/subject/v2", requestOptions)
         .then(response => response.json())
}
function addFaceTpPerson(file,id){


  var myHeaders = new Headers();
        myHeaders.append("token", "0ed0d51e90cc4f3ab510a564cfb94b60");

        var formdata = new FormData();
        formdata.append("photo", file, "file");

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };
        
        return fetch(`https://api.luxand.cloud/subject/${id}`, requestOptions)
            .then(response => response.json())
            .then(result => {})
            .catch(error => console.log('error within adding  face to the person ', error));

}

function listFacesOfPerson(file,id){
  var myHeaders = new Headers();
  myHeaders.append("token", "{{api-token}}");
  
  var formdata = new FormData();
  formdata.append("photo", file, "file");
  
  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
  };
  
  return fetch(`https://api.luxand.cloud/subject/${id}`, requestOptions)
    .then(response => response.json())
    
}