import * as Papa from 'papaparse';

export const parsePortsCSV = () => {
  return new Promise((resolve, reject) => {
    Papa.parse(require('./../geoData/portLocationData.csv'), {
      header: true,
      download: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};