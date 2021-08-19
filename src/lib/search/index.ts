import { fetchWeb, innertubeApi } from '../api';
import { SearchParamProps, SearchResource, SearchResultType, SearchType } from '../../types/search';
import { parseChannelRenderer, parsePlaylistRenderer, parseVideoRenderer } from './searchParser';

export default async function ({
  q,
  key,
  pageToken,
  regionCode,
  relevanceLanguage,
  videoEmbeddable,
  type,
}: SearchParamProps): Promise<SearchResultType> {
  const hl = relevanceLanguage || 'en';
  const gl = regionCode || 'US';

  if (key && pageToken) {
    const { data } = await innertubeApi.post(`search?key=${key}`, {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20210813.00.00',
          hl,
          gl,
        },
      },
      continuation: pageToken,
    });

    const { items, nextPageToken } = parseSearch(
      data.onResponseReceivedCommands[0].appendContinuationItemsAction.continuationItems,
      type,
    );

    return {
      items: videoEmbeddable ? await filterEmbeddable(items, key) : items,
      nextPageToken,
      pageInfo: {
        totalResults: data.estimatedResults ? parseInt(data.estimatedResults) : 0,
      },
    };
  } else {
    const sp = getSp(type);
    const searchRes = await fetchWeb.get(`results?search_query=${encodeURI(q.trim())}&hl=${hl}&gl=${gl}&sp=${sp}`);

    if (searchRes.status === 200) {
      // console.log('response', searchRes.data);
      const innertubeApiKey = searchRes.data.match(/"?innertubeApiKey"?\s*:\s*"([^"]+)"/s)[1];
      let match = searchRes.data.match(/ytInitialData[^{]*(.*?);\s*<\/script>/s);
      if (!(match && match.length > 1)) {
        match = searchRes.data.match(/ytInitialData"[^{]*(.*);\s*window\["ytInitialPlayerResponse"\]/s);
      }
      const data = JSON.parse(match[1]);
      const {items, nextPageToken} = parseSearch(
        data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents,
        type,
      );

      return {
        innertubeApiKey,
        items: videoEmbeddable ? await filterEmbeddable(items, innertubeApiKey) : items,
        nextPageToken,
        pageInfo: {
          totalResults: data.estimatedResults ? parseInt(data.estimatedResults) : 0,
        },
      };
    } else {
      throw new Error(searchRes.statusText);
    }
  }
}

function parseSearch(contents: any, type?: SearchType): Omit<SearchResultType, 'pageInfo'> {
  const result: Omit<SearchResultType, 'pageInfo'> = { items: [] };

  contents.forEach((sectionList: any) => {
    try {
      if (sectionList.hasOwnProperty('itemSectionRenderer')) {
        sectionList.itemSectionRenderer.contents.forEach((content: any) => {
          try {
            if ((!type || type === 'channel') && content.hasOwnProperty('channelRenderer')) {
              const channel = parseChannelRenderer(content.channelRenderer);
              if (channel) {
                result.items.push(channel);
              }
            }
            if ((!type || type === 'video') && content.hasOwnProperty('videoRenderer')) {
              const video = parseVideoRenderer(content.videoRenderer);
              if (video) {
                result.items.push(video);
              }
            }
            if ((!type || type === 'playlist') && content.hasOwnProperty('playlistRenderer')) {
              const playlist = parsePlaylistRenderer(content.playlistRenderer);
              if (playlist) {
                result.items.push(playlist);
              }
            }
          } catch (ex) {
            console.error('Failed to parse renderer:', ex);
            console.log(content);
          }
        });
      } else if (sectionList.hasOwnProperty('continuationItemRenderer')) {
        result.nextPageToken = sectionList.continuationItemRenderer.continuationEndpoint.continuationCommand.token;
      }
    } catch (ex) {
      console.error('Failed to read contents for section list:', ex);
      console.log(sectionList);
    }
  });

  return result;
}

function getSp(type?: SearchType) {
  if (type === 'video') {
    return 'EgIQAQ%253D%253D';
  } else if (type === 'channel') {
    return 'EgIQAg%253D%253D';
  } else if (type === 'playlist') {
    return 'EgIQAw%253D%253D';
  } else {
    return '';
  }
}

async function filterEmbeddable(items: SearchResource[], key: string) {
  const playerInfos = await Promise.all<any>(
    items.map((it) =>
      innertubeApi.post(`player?key=${key}`, {
        context: {
          client: {
            hl: 'en',
            clientName: 'WEB',
            clientVersion: '2.20210721.00.00',
            clientFormFactor: 'UNKNOWN_FORM_FACTOR',
            clientScreen: 'WATCH',
            mainAppWebInfo: {
              graftUrl: `/watch?v=${it.id.videoId}`,
            },
          },
          user: {
            lockedSafetyMode: false,
          },
          request: {
            useSsl: true,
            internalExperimentFlags: [],
            consistencyTokenJars: [],
          },
        },
        videoId: it.id.videoId,
        playbackContext: {
          contentPlaybackContext: {
            vis: 0,
            splay: false,
            autoCaptionsDefaultOn: false,
            autonavState: 'STATE_NONE',
            html5Preference: 'HTML5_PREF_WANTS',
            lactMilliseconds: '-1',
          },
        },
        racyCheckOk: false,
        contentCheckOk: false,
      }),
    ),
  );

  return items.filter((it, i) => playerInfos[i].data.playabilityStatus?.playableInEmbed);
}
