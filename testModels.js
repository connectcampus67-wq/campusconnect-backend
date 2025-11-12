import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const key = process.env.GEMINI_API_KEY;

const url = `https://generativelanguage.googleapis.com/v1/models?key=${key}`;

fetch(url)
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error("Error:", err));
