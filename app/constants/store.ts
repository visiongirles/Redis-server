export const store = new Map<string, StoreValue>();

export interface StoreValue {
  value: any;
  type: StoreValueType;
  timeToLive: number | null;
}

export enum StoreValueType {
  String,
  List,
  Set,
  SortedSet,
  Hash,
  Zipmap,
  Ziplist,
  Insert,
  SortedSetZiplist,
  HashmapZiplist,
  ListInQuicklist,
}
