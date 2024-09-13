require('dotenv').config();
// console.log(process.env)
const { fetchEmails } = require('./gmailSearch');
const getCompletion = require('./textCompletion');



// continous asking for user input until quit
const askUserInput = async (rl) => {
	rl.question('Enter your input: ', async (input) => {
		// console.log('User Query:', input);
		const result = await getCompletion(input);
		console.log('LLM Response: ', result);
		await fetchEmails(result);
		askUserInput(rl);
	});
}

const main = async () => {
	// take input from user
	const readline = require('readline');

	const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	});

	askUserInput(rl);
}

main();