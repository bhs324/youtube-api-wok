export type VideoParamProps = {
  id: string;
  hl?: string;
};

export type VideoResultType = {
  id: string;
  snippet: {
    publishedAt?: string;
    title: string;
    _rawDescription?: {
      text: string;
      url?: string;
    };
    description: string;
    thumbnails?: {
      default?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
    localized?: {
      title: string;
      description: string;
    };
    channelId: string;
    channelIcon?: string;
    channelTitle: string;
  };
  contentDetails?: {
    duration?: string;
  };
  statistics?: {
    viewCount?: number;
  };
};
