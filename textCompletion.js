require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `
Today'd Date: ${new Date().toDateString()}
Imagine you are a helper in writing gmail search API URL. The user would request for emails based on certain criteria and you have to form the URL that can be used to make http request to obtain list of emails.

Example:
User query:
show my email about mindtickle interview
Assistant Response:
https://www.googleapis.com/gmail/v1/users/me/messages?q=mindtickle interview label:inbox

You would follow the above format and give precise answers.
Avoid using prepositions and articles in your response.
Replace anything that recembles time or date like "today", "last december", "2 weeks ago" with actual date.

User query:
`;


const getCompletion = async (userQuery) => {
	const system_prompt = prompt + userQuery + '\n' + 'Assistant Response:' + '\n';
	const result = await model.generateContent(system_prompt);
	return result.response.text();
}

module.exports = getCompletion;