export const streamStore = new Map<string, Stream[]>();

// export interface StreamStoreValue {
//   stream: Stream[];
// }

export interface Stream {
  id: StreamId;
  key: string;
  value: any;
}

export interface StreamId {
  timestamp: string;
  count: string;
}
