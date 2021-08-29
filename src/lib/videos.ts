import { VideoParamProps, VideoResultType } from '../types/video';
import { fetchWeb } from './api';

export default async function videos({ id, hl }: VideoParamProps): Promise<VideoResultType | undefined | null> {
  const videoRes = await fetchWeb.get(`watch?v=${id}&hl=${hl || ''}&ucbcb=1`);
  if (videoRes.status === 200) {
    let match = videoRes.data.match(/ytInitialData[^{]*(.*?);\s*<\/script>/s);
    if (!(match && match.length > 1)) {
      match = videoRes.data.match(/ytInitialData"[^{]*(.*);\s*window\["ytInitialPlayerResponse"\]/s);
    }
    let data;
    try {
      data = JSON.parse(match[1]);
    } catch (e) {
      match = match[1].match(/ytInitialPlayerResponse[^{]*(.*)/s);
      data = JSON.parse(match[1]);
    }

    if (data.contents) {
      return parseVideoInfoRenderer(data);
    } else if (data.microformat) {
      return parseMicroFormatRenderer(data);
    } else {
      throw new Error('Failed to parse video data.\n' + data);
    }
  } else {
    throw new Error(videoRes.statusText);
  }
}

function parseVideoInfoRenderer(data: any): VideoResultType {
  const {videoId} = data.currentVideoEndpoint.watchEndpoint;
  const contents = data.contents.twoColumnWatchNextResults.results.results.contents;
  const primaryRenderer = contents.find((c: any) => c.hasOwnProperty('videoPrimaryInfoRenderer'))?.videoPrimaryInfoRenderer;
  const secondaryRenderer = contents.find((c: any) => c.hasOwnProperty('videoSecondaryInfoRenderer'))?.videoSecondaryInfoRenderer;

  const _rawDescription = secondaryRenderer.description.runs.map((r: any) => ({
    text: r.text,
    url: r.navigationEndpoint?.commandMetadata.webCommandMetadata.url,
  }));

  return {
    id: videoId,
    snippet: {
      publishedAt: primaryRenderer.dateText.simpleText,
      title: primaryRenderer.title.runs[0].text,
      _rawDescription,
      description: _rawDescription.map((r: any) => r.text).join(''),
      channelId: secondaryRenderer.owner.videoOwnerRenderer.title.runs[0].navigationEndpoint.browseEndpoint.browseId,
      channelIcon:
        secondaryRenderer.owner.videoOwnerRenderer.thumbnail.thumbnails[
          secondaryRenderer.owner.videoOwnerRenderer.thumbnail.thumbnails.length - 1
        ].url,
      channelTitle: secondaryRenderer.owner.videoOwnerRenderer.title.runs[0].text,
    },
    statistics: {
      viewCount: primaryRenderer.viewCount.videoViewCountRenderer?.viewCount?.simpleText
        ? parseInt(primaryRenderer.viewCount.videoViewCountRenderer.viewCount.simpleText.replace(/[^0-9]/g, ''))
        : 0,
    },
  };
}

function parseMicroFormatRenderer(data: any) {
  const {videoDetails, microformat: {playerMicroformatRenderer: microRenderer}} = data;

  return {
    id: videoDetails.videoId,
    snippet: {
      publishedAt: microRenderer.publishDate,
      title: videoDetails.title,
      description: microRenderer.description.runs[0].text,
      channelId: videoDetails.channelId,
      channelTitle: microRenderer.ownerChannelName,
    },
    statistics: {
      viewCount: microRenderer.viewCount,
    },
  }
}
