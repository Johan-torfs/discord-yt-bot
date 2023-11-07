import startBot from '../src/index.js';

export default function handler(req, res) {
    const message = startBot();
    return res.json({
      message: message,
    })
  }