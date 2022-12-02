const express = require("express");
const app = express();
const ObjectId = require("mongodb").ObjectId;
const bodyParser = require("body-parser");

function getClient() {
	const { MongoClient, ServerApiVersion } = require("mongodb");
	const uri ="mongodb+srv://testUser2:kuP0HsONJY4tD2Pb@cluster0.gev7m7p.mongodb.net/?retryWrites=true&w=majority";
	return new MongoClient(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverApi: ServerApiVersion.v1,
	});
}

app.get("/students", (req, res) => {
	const client = getClient();

	client.connect( async (err) => {
		const collection = client.db("school_app").collection("students");
		// perform actions on the collection object
		const students = await collection.find().toArray()
		res.send(students);
		client.close();
	});
});


app.post("/students", bodyParser.json(), (req, res) => { 
	const newStudent = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		birthYear: req.body.birthYear,
		grades: []
	};
	
	const client = getClient();
	client.connect( async (err) => {
		const collection = client.db("school_app").collection("students");
		// perform actions on the collection object
		const result = await collection.insertOne(newStudent)
		if (!result.insertedId) {
			res.send({error: 'Insert error'});
			return;
		}
		res.send(newStudent);
		client.close();
	});
});


app.put("/students/:id", bodyParser.json(), (req, res) => { 
	const editedStudent = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		birthYear: req.body.birthYear,
		grades: []
	};

	const id = getId(req.params.id);
	if (!id) {
		res.send({error: 'Invalid id'});
		return;
	}

	const client = getClient();
	client.connect( async (err) => {
		const collection = client.db("school_app").collection("students");
		// perform actions on the collection object
		const result = await collection.findOneAndUpdate({_id: id}, {$set: editedStudent}, {returnDocument: "after"});
		if (!result.ok) {
			res.send({error: 'Not found'});
			return;
		}
		res.send(result.value);
		client.close();
	});
});


app.listen(3000);