import type { FlatNameRow } from '../types';

/**
 * Sample fallback data for local testing without uploading an Excel file.
 * Mirrors the expected flat_Name_Convention sheet structure.
 */
export const MOCK_ROWS: FlatNameRow[] = [
  {
    primarykey: 'AHU-01',
    assetType: 'Air Handling Unit',
    haystacktags: 'ahu air handler equip',
    customHaystackTags: 'trane-ahu',
    pointParameters: 'supplyAirTemp dischargeAirTemp',
    pointTypeOptions: 'sensor setpoint',
  },
  {
    primarykey: 'AHU-01',
    assetType: 'Fan Coil Unit',
    haystacktags: 'fcu equip',
    customHaystackTags: '',
    pointParameters: 'fanSpeed',
    pointTypeOptions: 'cmd',
  },
  {
    primarykey: 'CHW-PUMP-01',
    assetType: 'Chilled Water Pump',
    haystacktags: 'pump chw equip',
    customHaystackTags: 'trane-pump',
    pointParameters: 'differentialPressure flowRate',
    pointTypeOptions: 'sensor',
  },
  {
    primarykey: 'RTU-02',
    assetType: 'Rooftop Unit',
    haystacktags: 'rtu rooftop equip',
    customHaystackTags: 'trane-rtu',
    pointParameters: 'condensingTemp evaporatingTemp',
    pointTypeOptions: 'sensor setpoint cmd',
  },
  {
    primarykey: 'VAV-101',
    assetType: 'Variable Air Volume',
    haystacktags: 'vav equip',
    customHaystackTags: '',
    pointParameters: 'zoneTemp zoneHumidity',
    pointTypeOptions: 'sensor setpoint',
  },
];
