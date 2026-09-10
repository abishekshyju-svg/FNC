// Core data types for the Flat Name Converter Tool

export interface FlatNameRow {
  primarykey: string;
  assetType: string;
  haystacktags: string;
  customHaystackTags: string;
  pointParameters: string;
  pointTypeOptions: string;
  [key: string]: string;
}

export interface SearchResult {
  row: FlatNameRow;
  selectedAssetType: string;
  pointsData: string;
  /** Tag injected because the input had a recognised suffix (_READ, _FDBACK_READ, _FDBACK_CTRL) */
  suffixTag: string | null;
}

export type AppState =
  | { stage: 'idle' }
  | { stage: 'error'; message: string }
  | { stage: 'ready'; rows: FlatNameRow[] }
  | { stage: 'results'; rows: FlatNameRow[]; query: string; results: SearchResult[] };

// ── Enum Conversion ────────────────────────────────────────────
export interface EnumOption {
  label: string;   // short display label shown in radio list
  value: string;   // full string inserted into Points Data
}

export const ENUM_OPTIONS: EnumOption[] = [
  {
    label: 'enumConversion:{"Heat":0,"Cool":1}',
    value: '"enumConversion:{""Heat"":0,""Cool"":1}"',
  },
  {
    label: 'enumConversion:{"Occupied":1,"Unoccupied":2}',
    value: '"enumConversion:{""Occupied"":1,""Unoccupied"":2}"',
  },
  {
    label: 'enumConversion:{"Normal":0,"Locked Out":1}',
    value: '"enumConversion:{""Normal"":0,""Locked Out"":1}"',
  },
  {
    label: 'enumConversion:{"Off":0,"On":1}',
    value: '"enumConversion:{""Off"":0,""On"":1}"',
  },
  {
    label: 'enumConversion:{"Disabled":1,"Enabled":2,"Auto":3}',
    value: '"enumConversion:{""Disabled"":1,""Enabled"":2,""Auto"":3}"',
  },
  {
    label: 'enumConversion:{"state":0,"another state":1}',
    value: '"enumConversion:{""state"":0,""another state"":1}"',
  },
  {
    label: 'enumConversion:{"Auto":1,"Heat":2,"Morning Warm-up":3,"Cool":4,"Night Purge":5,"Pre Cool":6,"Off":7,"Test":8,"Emergency Heat":9,"Fan Only":10,"Max Heat":11,"Dehumidify":12,"Calibrate":13}',
    value: '"enumConversion:{""Auto"":1,""Heat"":2,""Morning Warm-up"":3,""Cool"":4,""Night Purge"":5,""Pre Cool"":6,""Off"":7,""Test"":8,""Emergency Heat"":9,""Fan Only"":10,""Max Heat"":11,""Dehumidify"":12,""Calibrate"":13}"',
  },
];
