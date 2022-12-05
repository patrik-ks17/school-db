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


function getId(raw) {
	try {
		return new ObjectId(raw);
	}
	catch(e) {
		return ''
	}
}


// Read
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


// Read by Id
app.get('/students/:id', (req, res) => {
	const id = getId(req.params.id);
	if(!id) {
		res.send({error: 'Invalid id'});
		return
	}

	const client = getClient();
	client.connect(async (err) => {
		const collection = client.db("school_app").collection("students");
		// perform actions on the collection object
		const student = await collection.findOne({_id: id})
		if (!student) {
			res.send({error: 'Not found'});
			return;
		}
		res.send(student);
		client.close();
	});
})


// Create
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


// Update
app.put("/students/:id", bodyParser.json(), (req, res) => { 
	const editedStudent = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		birthYear: req.body.birthYear
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


// Delete
app.delete('/students/:id', bodyParser.json(), (req, res) => {
	const id = getId(req.params.id);
	if (!id) {
		res.send({error: 'Invalid id'});
		return;
	}

	const client = getClient();
	client.connect( async (err) => {
		const collection = client.db("school_app").collection("students");
		// perform actions on the collection object
		const result = await collection.deleteOne({_id: id});
		if (!result.deletedCount) {
			res.send({error: 'Not found'});
			return;
		}
		res.send({_id: id});
		client.close();
	});
});


// Add grades
app.post('/grades', bodyParser.json(), (req, res) => {  
	const newGrades = req.body.grades;

	const id = getId(req.body.id);
	if (!id) {
		res.send({error: 'Invalid id'});
		return;
	}
	const client = getClient();
	client.connect(async err => {
		const collection = client.db("school_app").collection("students");
		const result = await collection.findOneAndUpdate(
			{_id: id},
			{ $push: { grades: { $each: newGrades } } },
			{returnDocument: "after"}
		);
		if (!result.ok) {
			res.send({error: 'Not found'});
			return;
		}
		res.send(result.value);
		client.close();
	});
});


app.listen(3000);