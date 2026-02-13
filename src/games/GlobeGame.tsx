import { useState, useEffect } from "react";
import Globe from "react-globe.gl";
import "./GlobeGame.css";

function GlobeGame() {
  const [countries, setCountries] = useState<{ features: object[] }>({
    features: [],
  });

  useEffect(() => {
    fetch("/ne_110m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then(setCountries);
  }, []);

  return (
    <div className="globe-container">
      <Globe
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
        hexPolygonsData={countries.features}
        hexPolygonResolution={3}
        hexPolygonMargin={0.3}
        hexPolygonUseDots={true}
        hexPolygonColor={() =>
          `#${Math.round(Math.random() * Math.pow(2, 24))
            .toString(16)
            .padStart(6, "0")}`
        }
        hexPolygonLabel={({ properties: d }: any) =>
          `<b>${d.ADMIN} (${d.ISO_A2})</b><br />Population: <i>${d.POP_EST}</i>`
        }
      />
    </div>
  );
}

export default GlobeGame;
