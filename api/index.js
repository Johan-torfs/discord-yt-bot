import startBot from '../src/index.js';

export default function handler(req, res) {
    startBot();
    return res.json({
      message: `Bot online!`,
    })
  }