import { SearchResource } from '../../types/search';

export function parseVideoRenderer(data: any): SearchResource {
  if (!data) throw new Error('No data specified to parse');
  let title = '';
  title = data.title.runs[0].text;
  title = title.replace('\\\\', '\\');
  try {
    title = decodeURIComponent(title);
  } catch (e) {
    // @ts-ignore
  }

  return {
    id: {
      kind: 'youtube#video',
      videoId: data.videoId,
    },
    snippet: {
      publishedAt: data.publishedTimeText ? data.publishedTimeText.simpleText : null,
      title,
      _rawDescription: data.descriptionSnippet?.runs,
      description: data.descriptionSnippet?.runs[0] ? data.descriptionSnippet.runs[0].text : '',
      thumbnails: {
        default: data.thumbnail.thumbnails[0],
        high: data.thumbnail.thumbnails[data.thumbnail.thumbnails.length - 1],
      },
      channelId: data.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
      channelTitle: data.ownerText.runs[0].text,
      channelIcon: data.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].url,
    },
    contentDetails: {
      duration: data.lengthText ? data.lengthText.simpleText : null,
    },
    statistics: {
      viewCount:
        data.viewCountText && data.viewCountText.simpleText
          ? parseInt(data.viewCountText.simpleText.replace(/[^0-9]/g, ''))
          : 0,
    },
  };
}

export function parseChannelRenderer(data: any): SearchResource {
  if (!data) throw new Error('No data specified to parse');
  let title = '';
  title = data.title.simpleText;
  title = title.replace('\\\\', '\\');
  try {
    title = decodeURIComponent(title);
  } catch (e) {
    // @ts-ignore
  }

  return {
    id: {
      kind: 'youtube#channel',
      channelId: data.channelId,
    },
    snippet: {
      title,
      _rawDescription: data.descriptionSnippet?.runs,
      description: data.descriptionSnippet?.runs[0]
        ? data.descriptionSnippet.runs.map((r: any) => r.text).join('')
        : '',
      thumbnails: {
        default: data.thumbnail.thumbnails[0],
        high: data.thumbnail.thumbnails[data.thumbnail.thumbnails.length - 1],
      },
      channelId: data.channelId,
      channelTitle: title,
      channelIcon: data.thumbnail.thumbnails[data.thumbnail.thumbnails.length - 1],
    },
  };
}

export function parsePlaylistRenderer(data: any): SearchResource {
  if (!data) throw new Error('No data specified to parse');
  let title = '';
  title = data.title.simpleText;
  title = title.replace('\\\\', '\\');
  try {
    title = decodeURIComponent(title);
  } catch (e) {
    // @ts-ignore
  }

  return {
    id: {
      kind: 'youtube#playlist',
      playlistId: data.playlistId,
    },
    snippet: {
      title,
      _rawDescription: data.descriptionSnippet?.runs,
      description: data.descriptionSnippet?.runs[0]
        ? data.descriptionSnippet.runs.map((r: any) => r.text).join('')
        : '',
      thumbnails: {
        default: data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails[0],
        high: data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails[
          data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails.length - 1
        ],
      },
      channelId: data.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
      channelTitle: data.shortBylineText.runs[0].text,
    },
  };
}
