import axios from 'axios';

export const fetchWeb = axios.create({
  baseURL: 'https://www.youtube.com/',
  timeout: 3000,
});

export const innertubeApi = axios.create({
  baseURL: 'https://www.youtube.com/youtubei/v1/',
  headers: {
    "content-type": 'application/json',
  },
  timeout: 3000,
});
