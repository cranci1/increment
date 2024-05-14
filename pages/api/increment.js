// pages/api/more.js
import fs from 'fs-extra';
import path from 'path';

const MAX_NUMBER = Number(process.env.MAX_NUMBER) || 20;
const DATA_PATH = path.join(process.cwd(), 'data', 'data.json');

const resetNumber = async () => {
  try {
    const data = { number: 0 };
    await fs.writeFile(DATA_PATH, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

const initializeDataFile = async () => {
  try {
    await fs.access(DATA_PATH);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await resetNumber();
    } else {
      console.error(err);
    }
  }
};

export default async function handler(req, res) {
  try {
    await initializeDataFile();

    if (req.method === 'POST') {
      const data = JSON.parse(await fs.readFile(DATA_PATH));

      if (data.number < MAX_NUMBER) {
        data.number++;
        await fs.writeFile(DATA_PATH, JSON.stringify(data));
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
    if (err.code === 'ENOENT') {
      res.status(500).json({ error: 'Data file not found' });
    } else {
      res.status(500).json({ error: `Internal server error: ${err.message}` });
    }
  }
}