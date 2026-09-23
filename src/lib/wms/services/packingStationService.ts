import { wmsDb } from '../db';
import { logWmsActivity } from '../activityLog';

// TODO(api): swap bodies for /wms/packing-stations once the backend exists.
export const packingStationService = {
  assignOperator(stationId: string, operator: string) {
    wmsDb.mutate((draft) => {
      const station = draft.packingStations.find((s) => s.id === stationId);
      if (station) station.operator = operator;
    });
    logWmsActivity('packing_station', stationId, 'assign', `Operator ${operator} signed in`);
  },

  claimPackage(stationId: string, packageId: string) {
    wmsDb.mutate((draft) => {
      const station = draft.packingStations.find((s) => s.id === stationId);
      const pkg = draft.packages.find((p) => p.id === packageId);
      if (!station || !pkg) return;
      // Free up whatever this station was working on before.
      for (const other of draft.packages) {
        if (other.stationId === stationId) other.stationId = undefined;
      }
      station.currentPackageId = packageId;
      pkg.stationId = stationId;
    });
    logWmsActivity('packing_station', stationId, 'claim', `Claimed package for packing`);
  },

  releaseStation(stationId: string) {
    wmsDb.mutate((draft) => {
      const station = draft.packingStations.find((s) => s.id === stationId);
      if (!station) return;
      const pkg = draft.packages.find((p) => p.id === station.currentPackageId);
      if (pkg) pkg.stationId = undefined;
      station.currentPackageId = undefined;
    });
  },
};
