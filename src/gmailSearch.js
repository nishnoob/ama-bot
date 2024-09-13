const fetcher = require("./fetcher");

function extractHttpRequset (inputStr) {
  // we need to extract http requests using regex from a string
  // https://www.googleapis.com/gmail/v1/users/me/messages?q="bus to kozhikode" after:2023-12-01 before:2024-01-01 label:inbox
  // there can be spaces in query param sof url, so we need to extract the whole url
  const regex = /https?:\/\/[^\s]+(?:\s+[^:]+:[^:\s]+)*/g;
  const match = inputStr.match(regex);
  return match
}

async function fetchThreadList (url) {
  try {
    const data = await fetcher(url);
    return data;
  } catch (error) {
    return error.message;
  }
}

async function fetchThread (threadId) {
  const url = `https://www.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`;
  try {
    const data = await fetcher(url);
    return data;
  } catch (error) {
    return error.message;
  }
}

async function fetchEmails (completion) {
  const httpRequests = extractHttpRequset(completion);
  if (!httpRequests) {
    return 'No http requests found in the input string';
  }
  const url = httpRequests[0];
  const thredsList = await fetchThreadList(url);
  // console.log(thredsList);
  if (thredsList.messages && thredsList.messages.length > 0) {
    for (const message of thredsList.messages.splice(0, 5)) {
      const thread = await fetchThread(message.id);
      console.log(gmailThreadFormatter(thread));
    }
  } else {
    console.log('No emails found');
  }
}

const convertMultipartEmail = (message) => {
  let messageText = '';
  for (const part of message.payload.parts) {
    if (part.mimeType === 'text/plain') {
      messageText += atob(part.body.data);
    }
  }
  // remove whitespaces in each line
  messageText = messageText.split('\n').map(line => line.trim()).join('\n');
  // replace multiple new lines with single new line
  return messageText.replace(/\n+/g, '\n').trim();
}

const gmailThreadFormatter = (thread) => {
  // console.log(thread);
  let formattedThread = '';
  for (const message of thread.messages) {
    formattedThread += `Subject: ${message.payload.headers.find(header => header.name === 'Subject').value}\n`;
    formattedThread += `Date: ${new Date(parseInt(message.internalDate)).toDateString()}\n`;
    formattedThread += `From: ${message.payload.headers.find(header => header.name === 'From').value}\n`;
    formattedThread += `To: ${message.payload.headers.find(header => header.name === 'To').value}\n`;
    const ccHeader = message.payload.headers.find(header => header.name === 'Cc');
    if (ccHeader) {
      formattedThread += `Cc: ${ccHeader.value}\n`;
    }
    const bccHeader = message.payload.headers.find(header => header.name === 'Bcc');
    if (bccHeader) {
      formattedThread += `Bcc: ${bccHeader.value}\n`;
    }
    formattedThread += `Body: ${convertMultipartEmail(message)}\n`;
    formattedThread += '\n';
  }
  return formattedThread;
}

module.exports = {
  fetcher,
  fetchEmails
};