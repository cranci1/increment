const express = require('express');
const fs = require('fs').promises;

const app = express();
const MAX_NUMBER = process.env.MAX_NUMBER || 20;

app.use(express.json());

const resetNumber = async () => {
  try {
    const data = { number: 0 };
    await fs.writeFile('data.json', JSON.stringify(data));

    const now = new Date();
    const secondsUntilNextMinute = 60 - now.getSeconds();

    setTimeout(resetNumber, secondsUntilNextMinute * 1000);
  } catch (err) {
    console.error(err);
  }
};

resetNumber();

app.post('/', async (req, res) => {
  try {
    const data = JSON.parse(await fs.readFile('data.json'));

    if (data.number < MAX_NUMBER) {
      data.number++;
      await fs.writeFile('data.json', JSON.stringify(data));
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = app;