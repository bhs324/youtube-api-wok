# [youtube-api-wok](https://github.com/bhs324/youtube-api-wok)

YouTube Data API without API key.

Adapted from youtube-search by @appit-online and youtube-scrape by @HermanFassett

## Installation

### Yarn

```bash
yarn add youtube-api-wok
```

### NPM
```bash
npm install youtube-api-wok --save
```


## Usage

### Search

```javascript
import * as yt from 'youtube-api-wok';

const search = await yt.search({q: 'BTS'});
console.log('Search videos:\n', search.items);

const searchMore = await yt.search({
  q: 'BTS',
  key: search.innertubeApiKey,
  pageToken: search.nextPageToken,
});
console.log('More videos:\n', searchMore.items);
```

### Videos

```javascript
const videoDetail = await yt.videos({id: 'CuklIb9d3fI'});
console.log('Video detail:\n', videoDetail);
```


[comment]: <> (## Methods)

[comment]: <> (### Search)

[comment]: <> (#### Parameters)

[comment]: <> (#### Return)

[comment]: <> (### Videos)

[comment]: <> (#### Parameters)

[comment]: <> (#### Return)


## TODO

- [x] Search
- [x] Videos
- [ ] Channels
- [ ] Comments
- [ ] CommentThreads
- [ ] Playlists
- [ ] Subscriptions
- [ ] Activities
