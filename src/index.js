import express from "express";
const app = express();
const { PORT = 3000 } = process.env;

import bodyParser from "body-parser";
import cors from "cors";
import data from "../data"; //every time the server is restarted, data is pulled
//from data.js. When we modify data, data.js doesn't actually change! This is
//because when we import it, it is a copy of the data from data.js. So when we restart
//the server, data is pulled again from data.js, which doesn't change.
import * as utilities from "./utils/functions"; //functions for parameter validation
//and error handling

//swagger
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

//route to show swagger documentation; go to this website to see it. The resulting
//swagger is based on the swagger.json
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(bodyParser.json()).use(cors()); //middleware for security and specifying format
//of body and how to parse it

//define routes for the endpoints. Our API will retrieve and modify data from data.js

//get requests
app.get("/", (request, response) => response.send("Hello World!"));
app.get("/api/v1/doctors", (req, res) => res.json(data.doctors));
app.get("/api/v1/doctors/:id", (req, res) => { //the :id basically adds a property to req.params
  const id = req.params.id;

  //parameter validation for id
  if (utilities.isInvalidId(id)) {
    return res.status(400).json({ error: "Invalid id." });
  }

  const doctor = data.doctors.find((doc) => doc.id == id); //id may be a string, so only 2 equals

  //if doctor was not found
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found." });
  }

  return res.json(doctor); //default status code is 200
});

//if parameter is in the path, use req.params. if the parameter are written as tags in the
//url (using ? or &), use req.query. if the parameter is in the body, use req.body.

app.get("/api/v1/patients", (req, res) => res.json(data.patients));
app.get("/api/v1/patients/:id", (req, res) => {
  const patientid = req.params.id;

  if (utilities.isInvalidId(patientid)) {
    return res.status(400).json({error: "Invalid id."});
  }

  const patient = data.patients.find((p) => p.id == patientid);

  if (!patient) {
    return res.status(404).json({error: "Patient not found."});
  }

  return res.json(patient);
})
app.get("/api/v1/visits", (req, res) => {
  const { doctorid, patientid } = req.query; //doctorid and patient id are put in the form of
  //?doctorid=1&patientid=1. These are accessible through the req.query object. These fields may
  //are optional and may not exist, in which case both doctorid = patientid = undefined and
  //the entire data.visits object is returned; doctorid and patientid are optional

  let visits = data.visits;

  if (doctorid) {
    visits = visits.filter(
      (visit) => visit.doctorid === parseInt(doctorid, 10)
    );
  }

  if (patientid) {
    visits = visits.filter(
      (visit) => visit.patientid === parseInt(patientid, 10)
    );
  }

  return res.json(visits);
});

//post requests; running these through the url is not good enough! This is because
//we need to specify a body this time. We should do this through postman.
app.post("/api/v1/doctors", (req, res) => {
  const nextId = data.doctors.length + 1;

  if (!req.body.name) { //check that the body as a name
    return res.status(400).json({ error: "Doctor needs a name parameter." });
  }

  const doctor = { id: nextId, name: req.body.name }; //request body should include the doctor's name

  data.doctors.push(doctor); //modify data by adding the doctor
  res.status(201).json(doctor); // 201 means Resource Created, also returns new doctor created
});
app.post("/api/v1/patients", (req, res) => {
  const nextId = data.patients.length + 1;

  if (!req.body.name) {
    return res.status(400).json({error: "Patient needs a name parameter."});
  }

  const patient = {id: nextId, name: req.body.name};

  data.patients.push(patient);
  res.status(201).json(patient);
})


//start the app. the callback is a console.log, outputted when the app is successfully running
app.listen(PORT, () =>
  console.log(`Hello World, I'm listening on port ${PORT}!`)
);

