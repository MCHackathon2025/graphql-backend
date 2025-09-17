const getWeather = async (_p, { input }) => {
  const { time, region } = input;
  const encoded = encodeURIComponent(region.trim());
  const url = `https://wttr.in/${encoded}?format=j1`;

  const res = await fetch(url, {
    method: "GET",
    header: {
      'Accept': 'application/json'
    }
  });
  const body = await res.json();
  const cur = body?.current_condition?.[0];
  return {
    temperature: cur.temp_C,
    humidity: cur.humidity,
    time,
    region
  }
}

export const Query = {
  getWeather,
}
