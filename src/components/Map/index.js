import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { parseShipCSV } from "../utils/shipData";
import { parsePortsCSV } from "../utils/portsData";
import "mapbox-gl/dist/mapbox-gl.css";
import "./ShipPanel.css";

import shipData from "../geoData/geoShipsData7Days.csv";
import SearchBar from "./SearchHeader";
import ShipPanel from "./ShipPanel";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZXNwYWNlc2VydmljZSIsImEiOiJjbHZ1dHZjdTQwMDhrMm1uMnoxdWRibzQ4In0.NaprcMBbdX07f4eXXdr-lw";
// mapboxgl.accessToken = process.env.API_ACCESS_TOKEN;

const Map = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [parsedData, setParsedData] = useState({});
  const [portLocations, setPortLocations] = useState([]);
  const [selectedShipData, setSelectedShipData] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [selectedPort, setSelectedPort] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const groupedData = await parseShipCSV(shipData);
      const portLocations = await parsePortsCSV();
      setParsedData(groupedData);
      setPortLocations(portLocations);
      setIsDataLoaded(true);
    };
    fetchData();
  }, []);
  const [errorMessage, setErrorMessage] = useState("");
  const handleSearch = useCallback(
    (shipName) => {
      const shipData = parsedData[shipName];
      if (shipData) {
        const latestLocation = shipData[shipData.length - 1];
        const lastTwoDays = shipData.slice(-3);
        const remainingDays = shipData.slice(0, -3);
        setSelectedShipData({ latestLocation, lastTwoDays, remainingDays });
        setErrorMessage(""); // Clear the error message if ship exist
      } else {
        setSelectedShipData(null);
        setErrorMessage(
          `Not Found: The ship "${shipName}" doesn't exist. Please re-enter the correct name.`
        );
      }
    },
    [parsedData]
  );

  const initializeMap = () => {

    //creating the map object with custom configuration
    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-80.1918, 25.7617], //Greater Miami region
      zoom: 6,
    });

    console.log(newMap);

    //creating the popup object
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    newMap.on("load", function () {
      console.log("map loaded");
      //marking the ship latest location
      newMap.addSource("ships", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: Object.values(parsedData).flatMap((shipData) => [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [
                  parseFloat(shipData[shipData.length - 1].location_longitude),
                  parseFloat(shipData[shipData.length - 1].location_latitude),
                ],
              },
              properties: {
                title: shipData[shipData.length - 1].site_name,
              },
            },
          ]),
        },
      });

      //setting the ship png image to show the ship latest position
      newMap.loadImage(
        `${process.env.PUBLIC_URL}/images/shipimg.png`,
        (error, image) => {
          if (error) throw error;
          newMap.addImage("ship-marker", image);
          newMap.addLayer({
            id: "ships",
            type: "symbol",
            source: "ships",
            layout: {
              "icon-image": "ship-marker",
              "icon-size": 0.025,
              "icon-allow-overlap": true,
            },
          });
        }
      );

      // marking the ports location
      newMap.addSource("ports", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: portLocations.map((port) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [
                parseFloat(port.geo_location_longitude),
                parseFloat(port.geo_location_latitude),
              ],
            },
            properties: {
              title: port.port_name,
            },
          })),
        },
      });

      //setting the port png image to show the ports position
      newMap.loadImage(
        `${process.env.PUBLIC_URL}/images/port-icon.png`,
        (error, image) => {
          if (error) throw error;
          newMap.addImage("port-marker", image);
          newMap.addLayer({
            id: "ports",
            type: "symbol",
            source: "ports",
            layout: {
              "icon-image": "port-marker",
              "icon-size": 0.02,
              "icon-allow-overlap": true,
            },
          });
        }
      );

      // Adding the hover pop-up event handlers for ship markers
      newMap.on("mouseenter", "ships", (e) => {
        const shipName = e.features[0].properties.title;
        popup
          .setLngLat(e.lngLat)
          .setHTML(`<div style={{color: 'blue'}}>${shipName}</div>`)
          .addTo(newMap);
      });

      newMap.on("mouseleave", "ships", () => {
        popup.remove();
      });

      // Adding hover name pop-up event handlers for port markers
      newMap.on("mouseenter", "ports", (e) => {
        const portName = e.features[0].properties.title;
        popup
          .setLngLat(e.lngLat)
          .setHTML(`<div>${portName}</div>`)
          .addTo(newMap);
      });

      newMap.on("mouseleave", "ports", () => {
        popup.remove();
      });
    });

    const handlePortMarkerClick = (portName) => {
      setSelectedPort(portName);
      parseShipCSV(shipData, portName)
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(`handle port marker click error: ${error}`);
        });
    };



    newMap.on("click", "ports", (e) => {
      const portName = e.features[0].properties.title;
      // here calling a function to handle port marker click and pass portName
      console.log(portName);
      handlePortMarkerClick(portName);
    });

    setMap(newMap);
  };

  const updateMapLayers = useCallback(() => {
    if (map && selectedShipData) {
      const { latestLocation, lastTwoDays, remainingDays } = selectedShipData;

      // Check if the layer and source exist before attempting to remove them
      const selectedShipLineLayer = map.getLayer("selectedShipLine");
      const selectedShipSource = map.getSource("selectedShipSource");

      if (selectedShipLineLayer) {
        map.removeLayer("selectedShipLine");
      }

      if (selectedShipSource) {
        map.removeSource("selectedShipSource");
      }

      // Adding a new ship line layer
      map.addSource("selectedShipSource", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "MultiLineString",
                coordinates: [
                  remainingDays.map(
                    ({ location_longitude, location_latitude }) => [
                      parseFloat(location_longitude),
                      parseFloat(location_latitude),
                    ]
                  ),
                  lastTwoDays.map(
                    ({ location_longitude, location_latitude }) => [
                      parseFloat(location_longitude),
                      parseFloat(location_latitude),
                    ]
                  ),
                ],
              },
            },
          ],
        },
      });

      map.addLayer({
        id: "selectedShipLine",
        type: "line",
        source: "selectedShipSource",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "line-index"], 0],
            "#888",
            "#000",
          ],
          "line-width": ["case", ["==", ["get", "line-index"], 0], 2, 4],
          "line-dasharray": [
            "case",
            ["==", ["get", "line-index"], 0],
            ["literal", [4, 4]], // using the 'literal' expression for the dash pattern
            ["literal", []], // here using the 'literal' expression for an empty array (solid line)
          ],
        },
      });

      // centering the latest selected location
      map.flyTo({
        center: [
          latestLocation.location_longitude,
          latestLocation.location_latitude,
        ],
      });
    }
  }, [map, selectedShipData]);
  useEffect(() => {
    if (
      mapContainerRef.current &&
      isDataLoaded &&
      Object.values(parsedData).length > 0 &&
      portLocations.length > 0
    ) {
      initializeMap();
    }
  }, [isDataLoaded, parsedData, portLocations]);

  useEffect(() => {
    updateMapLayers();
  }, [updateMapLayers]);

  useEffect(() => {
    const cleanup = () => {
      if (map) {
        map.off("mouseenter", "ships");
        map.off("mouseleave", "ships");
        map.off("mouseenter", "ports");
        map.off("mouseleave", "ports");
        if (map.getLayer("selectedShipLine")) {
          map.removeLayer("selectedShipLine");
          map.removeSource("selectedShipSource");
        }
        if (map.getOwnLayer) {
          // Add null check for getOwnLayer method
          map.remove();
        }
      }
    };
    return cleanup;
  }, [map]);

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      {errorMessage && <p>{errorMessage}</p>}
      <div ref={mapContainerRef} style={{ height: "100vh" }} />
      {selectedPort && (
        <div className="panel-container">
          <ShipPanel
            ships={[
              "ship_9",
              "ship_10",
              "ship_60",
              "yet to build this ships visiting feature",
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default Map;
