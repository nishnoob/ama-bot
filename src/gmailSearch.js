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
      // console.log(thread);
      for (const message of thread.messages) {
        // const messageText = convertMultipartEmail(message);
        console.log(JSON.stringify(message, null, 2));
      }
    }
  } else {
    console.log('No emails found');
  }
}

const convertMultipartEmail = (message) => {
  // also format it like:
  // Subject:
  // Date:
  // From:
  // To:
  // Cc:
  // Bcc:
  // Body:
  let messageText = '';
  for (const part of message.payload.parts) {
    if (part.mimeType === 'text/plain') {
      messageText += atob(part.body.data);
    }
  }
  return messageText;
}

const multipartEmailParser = (message) => {
  let messageText = '';
  for (const part of message.payload.parts) {
    if (part.mimeType === 'text/plain') {
      messageText += atob(part.body.data);
    }
  }
  return messageText;
}

const removeUnnecessaryNewLines = (text) => {
  return text.replace(/(\r\n|\n|\r)/gm, '');
}

module.exports = {
  fetcher,
  fetchEmails
};