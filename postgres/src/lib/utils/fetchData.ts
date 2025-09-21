export const fetchData = async (url: string, method?: 'GET' | 'POST', postData?: any) => {
  try {
    if (method === 'POST') {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      const data = await response.json();
      return data;
    }

    else {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    }

  } catch (error) {
    console.error('Error fetching data:', (error as Error).message);
    return [];
  }
};