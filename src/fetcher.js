async function fetcher (url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GMAIL_AUTH_TOKEN
      }
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    } else {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = fetcher;