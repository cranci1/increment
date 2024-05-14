// pages/api/increment.js
import { MongoClient } from 'mongodb';

const MAX_NUMBER = Number(process.env.MAX_NUMBER) || 20;
const MONGODB_URI = process.env.MONGODB_URI;

const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const resetNumber = async () => {
  try {
    await client.connect();
    const collection = client.db("test").collection("numbers");
    await collection.updateOne({ id: '1' }, { $set: { number: 0 } });
  } catch (err) {
    console.error(err);
  }
};

const initializeDataFile = async () => {
  try {
    await client.connect();
    const collection = client.db("test").collection("numbers");
    const number = await collection.findOne({ id: '1' });
    if (!number) {
      await resetNumber();
    }
  } catch (err) {
    console.error(err);
  }
};

export default async function handler(req, res) {
  try {
    await initializeDataFile();

    if (req.method === 'POST') {
      await client.connect();
      const collection = client.db("test").collection("numbers");
      const data = await collection.findOne({ id: '1' });

      if (data.number < MAX_NUMBER) {
        await collection.updateOne({ id: '1' }, { $inc: { number: 1 } });
        res.json({ success: true });

        const now = new Date();
        const delay = 60 * 1000 - (now.getSeconds() * 1000 + now.getMilliseconds());

        // Schedule the number to be reset at the start of the next minute
        setTimeout(resetNumber, delay);
      } else {
        res.json({ success: false });
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
}