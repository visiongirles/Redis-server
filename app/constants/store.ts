// export const store: Map<string, storeValue> = new Map();

export const store: Map<string, Value> = new Map();

interface Value {
  value: string | Stream;
  timeToLive: number | null;
}

export interface Stream {
  id: string;
  key: string;
  value: string;
}

// у меня стейт выглядит как HashMap<String, Value>
//  struct Value { value: ValueWrapper, expires_at: u128, }
//  enum ValueWrapper { String(String), Stream(Stream), }
// struct Stream { map: BTreeMap<StreamKey, Vec<String>>, subscribe: Sender<StreamKey>, }
