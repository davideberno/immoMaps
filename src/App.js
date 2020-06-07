import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  StandaloneSearchBox,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import zones from "./zones";

const libraries = ["places", "drawing", "geometry"];

const App = () => {
  const [center, setCenter] = useState({ lat: 41.902782, lng: 12.496365 });
  const [zoom, setZoom] = useState(10);
  const [marker, setMarker] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (marker) {
      setCenter(marker);
      setZoom(12);
    }
  }, [marker]);

  const searchBoxonLoad = (ref) => setSearchBox(ref);

  const onPlacesChanged = () => {
    console.log(searchBox.getPlaces());
    const places = searchBox.getPlaces();
    const newMarker = places[0].geometry.location;
    setMarker(newMarker);
  };

  const checkPos = () => {
    let result = null;
    map.data.forEach((feature) => {
      const geometry = feature.getGeometry();
      if (geometry.getType() === "Polygon") {
        const polygon = new window.google.maps.Polygon({
          paths: geometry.getAt(0).getArray(),
        });
        if (
          window.google.maps.geometry.poly.containsLocation(marker, polygon)
        ) {
          result = feature;
        }
      } else if (geometry.getType() === "GeometryCollection") {
        const polygon = new window.google.maps.Polygon({
          paths: geometry.getAt(0).getAt(0).getArray(),
        });
        if (
          window.google.maps.geometry.poly.containsLocation(marker, polygon)
        ) {
          result = feature;
        }
      }
    });
    // if (result) {
    //   map.data.overrideStyle(result, { visible: true });
    // }
    return result;
  };

  return (
    <LoadScript googleMapsApiKey="" libraries={libraries}>
      <GoogleMap
        mapContainerStyle={{
          width: "100vw",
          height: "100vh",
        }}
        center={center}
        zoom={zoom}
        onLoad={(map) => {
          zones.forEach((zone) => map.data.addGeoJson(zone));
          map.data.setStyle({ visible: false });
          setMap(map);
        }}
      >
        <StandaloneSearchBox
          onLoad={searchBoxonLoad}
          onPlacesChanged={onPlacesChanged}
        >
          <input
            type="text"
            placeholder="Search..."
            style={{
              border: `1px solid transparent`,
              width: `340px`,
              height: `32px`,
              padding: `0 12px`,
              borderRadius: `3px`,
              boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
              fontSize: `14px`,
              outline: `none`,
              textOverflow: `ellipses`,
              position: "absolute",
              left: "50%",
              marginLeft: "-120px",
              marginTop: "10px",
            }}
          />
        </StandaloneSearchBox>
        {marker ? (
          <Marker
            position={marker}
            visible={!infoWindow ? true : false}
            onClick={(e) => setInfoWindow(marker)}
          />
        ) : null}
        {infoWindow ? (
          <InfoWindow
            position={marker}
            onLoad={(info) => console.log(checkPos())}
            onCloseClick={() => setInfoWindow(null)}
          >
            <div
              style={{
                background: `white`,
                border: `1px solid #ccc`,
                padding: 15,
              }}
            >
              <h1>{checkPos().getProperty("name")}</h1>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </LoadScript>
  );
};

export default App;
