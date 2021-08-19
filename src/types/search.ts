import { VideoResultType } from './video';

export type SearchType = 'channel' | 'playlist' | 'video';

export type SearchParamProps = {
  q: string;
  key?: string;
  pageToken?: string;
  regionCode?: string;
  relevanceLanguage?: string;
  videoEmbeddable?: boolean;
  topicId?: string;
  type?: SearchType;
};

export type SearchResourceType = 'youtube#video' | 'youtube#channel' | 'youtube#playlist';

export type SearchResource = Omit<VideoResultType, 'id'> & {
  id: {
    kind: SearchResourceType;
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };
};

export type SearchResultType = {
  innertubeApiKey?: string;
  items: SearchResource[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
  };
};
