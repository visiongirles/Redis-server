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

// TODO: вохможно, заготовка на будущее
// export interface Stream {
// map: Map<StreamId, KeyValuePair[]>;
// subscribe: string | undefined;
// }
// 19:11VIPWizzardoDev: там ключ-значение списком, оно другое
// 19:12VIPWizzardoDev: я все в одно запихнул
// 19:12VIPWizzardoDev: у меня стейт выглядит как HashMap<String, Value>
// 19:13VIPWizzardoDev: struct Value { value: ValueWrapper, expires_at: u128, }
// 19:13VIPWizzardoDev: enum ValueWrapper { String(String), Stream(Stream), }
// 19:13VIPWizzardoDev: struct Stream { map: BTreeMap<StreamKey, Vec<String>>, subscribe: Sender<StreamKey>, }

// const store = new Map<string, Value>();

// interface Value {
//   value: string | StreamKate;
//   expires_at: number;
// }

// interface StreamKate {
//   map: Map<StreamKey, Vec>;
//   subscribe: string;
// }

// type StreamKey = string; // stream Id 1526985054079-0
// type Vec = string[];
