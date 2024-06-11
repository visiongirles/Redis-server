export const streamStore = new Map<StreamKey, StreamValue>();

export type StreamValue = Map<StreamId, KeyValuePair[]>;
export type StreamKey = string;

export interface KeyValuePair {
  key: string;
  value: any;
}

export interface StreamId {
  timestamp: string;
  count: string;
}
