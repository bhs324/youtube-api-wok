import { VideoParamProps, VideoResultType } from '../types/video';
import { fetchWeb } from './api';

export default async function videos({ id, hl }: VideoParamProps): Promise<VideoResultType | undefined | null> {
  const videoRes = await fetchWeb.get(`watch?v=${id}&hl=${hl || ''}&ucbcb=1`);
  if (videoRes.status === 200) {
    let match = videoRes.data.match(/ytInitialData[^{]*(.*?);\s*<\/script>/s);
    if (!(match && match.length > 1)) {
      match = videoRes.data.match(/ytInitialData"[^{]*(.*);\s*window\["ytInitialPlayerResponse"\]/s);
    }
    const data = JSON.parse(match[1]);
    const { contents } = data.contents.twoColumnWatchNextResults.results.results;

    return parseVideo(
      data.currentVideoEndpoint.watchEndpoint.videoId,
      contents.find((c: any) => c.hasOwnProperty('videoPrimaryInfoRenderer'))?.videoPrimaryInfoRenderer,
      contents.find((c: any) => c.hasOwnProperty('videoSecondaryInfoRenderer'))?.videoSecondaryInfoRenderer,
    );
  } else {
    throw new Error(videoRes.statusText);
  }
}

function parseVideo(videoId: string, primaryInfo: any, secondaryInfo: any): VideoResultType {
  const _rawDescription = secondaryInfo.description.runs.map((r: any) => ({
    text: r.text,
    url: r.navigationEndpoint?.commandMetadata.webCommandMetadata.url,
  }));

  return {
    id: videoId,
    snippet: {
      publishedAt: primaryInfo.dateText.simpleText,
      title: primaryInfo.title.runs[0].text,
      _rawDescription,
      description: _rawDescription.map((r: any) => r.text).join(''),
      channelId: secondaryInfo.owner.videoOwnerRenderer.title.runs[0].navigationEndpoint.browseEndpoint.browseId,
      channelIcon:
        secondaryInfo.owner.videoOwnerRenderer.thumbnail.thumbnails[
          secondaryInfo.owner.videoOwnerRenderer.thumbnail.thumbnails.length - 1
        ],
      channelTitle: secondaryInfo.owner.videoOwnerRenderer.title.runs[0].text,
    },
    statistics: {
      viewCount: primaryInfo.viewCount.videoViewCountRenderer?.viewCount?.simpleText
        ? parseInt(primaryInfo.viewCount.videoViewCountRenderer.viewCount.simpleText.replace(/[^0-9]/g, ''))
        : 0,
    },
  };
}
