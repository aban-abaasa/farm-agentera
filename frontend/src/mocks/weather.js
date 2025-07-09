// Mock weather data
export const mockWeatherData = {
    current: {
      location: "Kampala, Uganda",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      temperature: 26,
      condition: "Partly Cloudy",
      icon: "https://unsplash.com/featured/?weather,clouds",
      humidity: 65,
      windSpeed: 12,
      windDirection: "NE",
      precipitation: 0,
      uvIndex: 6
    },
    forecast: [
      {
        day: "Today",
        date: new Date().toLocaleDateString(),
        maxTemp: 28,
        minTemp: 22,
        condition: "Partly Cloudy",
        icon: "https://source.unsplash.com/featured/?weather,clouds",
        precipitation: 20,
        humidity: 65,
        windSpeed: 12
      },
      {
        day: "Tomorrow",
        date: new Date(Date.now() + 86400000).toLocaleDateString(),
        maxTemp: 29,
        minTemp: 23,
        condition: "Sunny",
        icon: "https://source.unsplash.com/featured/?weather,sunny",
        precipitation: 0,
        humidity: 60,
        windSpeed: 10
      },
      {
        day: new Date(Date.now() + 172800000).toLocaleDateString('en-US', { weekday: 'long' }),
        date: new Date(Date.now() + 172800000).toLocaleDateString(),
        maxTemp: 27,
        minTemp: 21,
        condition: "Thunderstorms",
        icon: "https://source.unsplash.com/featured/?weather,storm",
        precipitation: 80,
        humidity: 75,
        windSpeed: 15
      },
      {
        day: new Date(Date.now() + 259200000).toLocaleDateString('en-US', { weekday: 'long' }),
        date: new Date(Date.now() + 259200000).toLocaleDateString(),
        maxTemp: 25,
        minTemp: 20,
        condition: "Rain",
        icon: "https://source.unsplash.com/featured/?weather,rain",
        precipitation: 60,
        humidity: 80,
        windSpeed: 8
      },
      {
        day: new Date(Date.now() + 345600000).toLocaleDateString('en-US', { weekday: 'long' }),
        date: new Date(Date.now() + 345600000).toLocaleDateString(),
        maxTemp: 26,
        minTemp: 21,
        condition: "Partly Cloudy",
        icon: "https://source.unsplash.com/featured/?weather,clouds",
        precipitation: 30,
        humidity: 70,
        windSpeed: 10
      },
      {
        day: new Date(Date.now() + 432000000).toLocaleDateString('en-US', { weekday: 'long' }),
        date: new Date(Date.now() + 432000000).toLocaleDateString(),
        maxTemp: 28,
        minTemp: 22,
        condition: "Sunny",
        icon: "https://source.unsplash.com/featured/?weather,sunny",
        precipitation: 10,
        humidity: 65,
        windSpeed: 12
      },
      {
        day: new Date(Date.now() + 518400000).toLocaleDateString('en-US', { weekday: 'long' }),
        date: new Date(Date.now() + 518400000).toLocaleDateString(),
        maxTemp: 29,
        minTemp: 23,
        condition: "Sunny",
        icon: "https://source.unsplash.com/featured/?weather,sunny",
        precipitation: 0,
        humidity: 60,
        windSpeed: 10
      }
    ],
    agriculturalAlerts: [
      {
        id: 1,
        title: "Heavy Rain Warning",
        description: "Heavy rainfall expected in Eastern Uganda over the next 3 days. Take precautions to protect crops from potential flooding.",
        severity: "warning",
        regions: ["Eastern", "Central"],
        date: "2023-07-15"
      },
      {
        id: 2,
        title: "Optimal Planting Conditions",
        description: "Current soil moisture and temperature conditions are ideal for planting maize and beans in the Central region.",
        severity: "info",
        regions: ["Central"],
        date: "2023-07-14"
      },
      {
        id: 3,
        title: "Drought Alert",
        description: "Below average rainfall in Northern Uganda may lead to drought conditions. Consider water conservation measures.",
        severity: "alert",
        regions: ["Northern"],
        date: "2023-07-13"
      }
    ],
    rainfallData: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: "This Year",
          data: [45, 70, 120, 160, 140, 80, 30, 40, 60, 90, 110, 80],
        },
        {
          label: "Average",
          data: [50, 65, 110, 150, 130, 70, 40, 50, 70, 100, 120, 90],
        }
      ]
    }
  };
  
// Mock popular locations
export const mockPopularLocations = [
{ id: 1, name: "Kampala", region: "Central" },
{ id: 2, name: "Entebbe", region: "Central" },
{ id: 3, name: "Jinja", region: "Eastern" },
{ id: 4, name: "Mbarara", region: "Western" },
{ id: 5, name: "Gulu", region: "Northern" },
{ id: 6, name: "Mbale", region: "Eastern" },
{ id: 7, name: "Fort Portal", region: "Western" },
{ id: 8, name: "Arua", region: "Northern" },
];
  
// Mock saved locations (for logged in users)
export const mockSavedLocations = [
{ id: 1, name: "Kampala", region: "Central" },
{ id: 4, name: "Mbarara", region: "Western" },
{ id: 6, name: "Mbale", region: "Eastern" },
];