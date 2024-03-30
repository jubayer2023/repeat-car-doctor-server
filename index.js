// Requirements
const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;



// middleware from express
app.use(cors());
app.use(express.json());


console.log(process.env.DB_USER, process.env.DB_PASS)

// Main Part
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.of0ix0q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	}
});




async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();


		// collection
		const serviceCollection = client.db('carDoctor').collection('services');

		const bookingCollection = client.db('carDoctor').collection('bookings');



		// get servises
		app.get('/services', async (req, res) => {
			const cursor = serviceCollection.find();
			const services = await cursor.toArray();
			res.send(services);
		})

		// dynamic id route
		app.get('/services/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			const options = {
				projection: { _id: 1, title: 1, service_id: 1, price: 1, img: 1 }
			}

			const result = await serviceCollection.findOne(query, options);
			res.send(result);
		})


		// get bookingsinfo
		app.get('/bookings', async (req, res) => {



			// // console.log(req.query.email);

			let query = {};
			if (req.query?.email) {
				query = { email: req.query.email };
			}
			// console.log(query);

			const result = await bookingCollection.find(query).toArray();
			res.send(result);
		})



		// booking route post method
		app.post('/bookings', async (req, res) => {
			const bookingInfo = req.body;
			console.log(bookingInfo);

			const insertBookingInfo = await bookingCollection.insertOne(bookingInfo);

			res.send(insertBookingInfo);

		})


		// specific booking data delete
		app.delete('/bookings/:id', async (req, res) => {

			const id = req.params.id;

			const query = { _id: new ObjectId(id) };

			const result = await bookingCollection.deleteOne(query);

			res.send(result);

		})


		// update (PATCH) method

		app.patch('/bookings/:id', async (req, res) => {
			const id = req.params.id;
			const filter = { _id: new ObjectId(id) };

			const updatedInfo = req.body;
			// console.log(updateInfo);

			const updateDoc = {
				$set: {
					status: updatedInfo.status,
				},
			};

			const result = await bookingCollection.updateOne(filter, updateDoc);
			res.send(result);

		})



		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log("Pinged your deployment. You successfully connected to MongoDB!");
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);





app.get('/', (req, res) => {
	res.send('Car doctor server is running !!');
})

app.listen(port, () => {
	console.log(`Car doctor server is running on port ${port}`);
})