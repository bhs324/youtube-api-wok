import * as yt from '../src';

(async function basicUsage() {
  const search = await yt.search({q: 'lookbook', relevanceLanguage: 'en', regionCode: 'US', type: 'video', videoEmbeddable: true});
  console.log('Search videos: ', search.items.length);
  console.log(search.items[0]);
  // console.log('......');
  // console.log('key:', search.innertubeApiKey);
  // console.log('nextPageToken:', search.nextPageToken);
  // console.log('totalResults:', search.pageInfo.totalResults);

  // const searchMore = await yt.search({
  //   q: 'BTS',
  //   key: search.innertubeApiKey,
  //   pageToken: search.nextPageToken,
  //   videoEmbeddable: true,
  // });
  // console.log('More videos: ', searchMore.items.length);
  // console.log(searchMore.items[0]);
  // console.log('......');
  // console.log('nextPageToken:', searchMore.nextPageToken);
  // console.log('totalResults:', searchMore.pageInfo.totalResults);

  // const videoDetail = await yt.videos({id: 'CuklIb9d3fI'});
  // console.log('Video detail:');
  // console.log(videoDetail);
})();
