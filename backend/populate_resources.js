import axios from 'axios';

const disasterId = '7b05bd64-30f5-4b21-8a0b-e427741958d0'; // Change to your actual disaster ID
const url = `http://localhost:5000/api/resources/disasters/${disasterId}/resources`;

const resources = [
  {
    name: "Water Bottles",
    location_name: "Community Center",
    type: "water",
    lat: 40.7128,
    lng: -74.0060
  },
  {
    name: "Medical Kit",
    location_name: "Red Cross Tent",
    type: "medical",
    lat: 40.7138,
    lng: -74.0050
  },
  {
    name: "Blankets",
    location_name: "School Gym",
    type: "shelter",
    lat: 40.7148,
    lng: -74.0040
  },
  {
    name: "Canned Food",
    location_name: "Food Bank",
    type: "food",
    lat: 40.7158,
    lng: -74.0030
  }
];

(async () => {
  for (const resource of resources) {
    try {
      const res = await axios.post(url, resource);
      console.log('Inserted:', res.data.data);
    } catch (err) {
      console.error('Error inserting:', resource, err.response?.data || err.message);
    }
  }
})();