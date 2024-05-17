import * as Papa from "papaparse";

export const parseShipCSV = (shipData, selectedPort) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return new Promise((resolve, reject) => {
    const groupedData = {};

    Papa.parse(shipData, {
      header: true,
      download: true,
      complete: (results) => {
        results.data.forEach((row) => {
          const shipName = row.site_name;
          const timestamp = new Date(row.ec_timestamp);
          if (!groupedData[shipName]) {
            groupedData[shipName] = [];
          }
          groupedData[shipName].push({ ...row, ec_timestamp: timestamp });
        });

        // Sort ship data by timestamp in ascending order
        Object.values(groupedData).forEach((shipData) => {
          shipData.sort((a, b) => a.ec_timestamp - b.ec_timestamp);
        });

        resolve(groupedData);
      },
      error: (error) => {
        reject(error);
      },
    });

    // Function to calculate distance between two coordinates using Haversine formula
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      // Radius of the Earth in kilometers
      const R = 6371;

      // Converts latitude and longitude from degrees to radians
      const radLat1 = (Math.PI / 180) * lat1;
      const radLon1 = (Math.PI / 180) * lon1;
      const radLat2 = (Math.PI / 180) * lat2;
      const radLon2 = (Math.PI / 180) * lon2;

      // Calculate's the differences between latitude and longitude of two points
      const dLat = radLat2 - radLat1;
      const dLon = radLon2 - radLon1;

      // Haversine formula
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(radLat1) *
          Math.cos(radLat2) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      // Distance in kilometers
      const distance = R * c;

      return distance;
    };

    const isShipWithinRadius = (ship, port) => {
      // Calculate's the distance between ship and port using Haversine formula
      const distance = haversineDistance(
        ship.latitude,
        ship.longitude,
        port.latitude,
        port.longitude
      );
      return distance <= 100;
    };

    const isShipWithinLast7Days = (ship) => {
      return new Date(ship.ec_timestamp) >= sevenDaysAgo;
    };

    Object.values(groupedData).forEach((shipData) => {
      shipData.forEach((visit) => {
        visit.portVisited = isShipWithinRadius(visit, selectedPort);
      });
    });
    return groupedData;
  });
};
