
const map = L.map('map').setView([-30, 130], 5);

const sa3_url = 'sa3_simple.geojson'
const sa2_wa_url = 'sa2_wa_simple.geojson'

// search
function toggleSearch() {
    document.getElementById("search-dropdown").classList.toggle("show");
}

function filterFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("searchInput");
    console.log(input)
    console.log(input.value)
    filter = input.value.toUpperCase();
    div = document.getElementById("search-dropdown");
    a = div.getElementsByTagName("a"); // tag a => links
    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

// map
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'basemap &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// control that shows state info on hover
const info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    const areas = [];
    areas.push(props ? `<b>${props.SA3_NAME21}</b>` : 'Hover over an area')

    const area_names = ["Curtin", "UWA", "Murdoch", "ECU", "ACU", "Avondale", "Bond", "CDU", "CSU", "CQU", "Deakin", "Federation", "Flinders", "Griffith", "JCU", "La Trobe", "ANU", "UniMelb"]
    if (props) for (let i = 0; i < area_names.length; i++) {
        const area_name = area_names[i]
        areas.push(`${area_name}: ${props[area_name]}`);
    }
    // const contents = props ? `<b>${props.SA3_NAME21}</b><br />${props.Curtin} people going to Curtin <br> ${props.UWA}  people going to UWA <br> ${props.UWA}  people going to Murdoch <br> ${props.ECU} people going to ECU` : 'Hover over an area';
    const contents = areas.join('<br>')
    this._div.innerHTML = `<h4>Students from area</h4>${contents}`;
};

info.addTo(map);


// get color depending on population Curtin value
function getColor(d) {
    return d > 5000 ? '#800026' :
        d > 1000 ? '#BD0026' :
            d > 500 ? '#E31A1C' :
                d > 300 ? '#FC4E2A' :
                    d > 200 ? '#FD8D3C' :
                        d > 50 ? '#FEB24C' :
                            d > 10 ? '#FED976' : '#FFEDA0';
}

function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.UWA)
    };
}

function highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();

    info.update(layer.feature.properties);
}

var cur_geojson

async function SA2WAtoMap() {
    console.log("SA2WA clicked");
    const json = await load_shapefile(sa2_wa_url);

    // Clear map of old data
    map.removeLayer(cur_geojson)
    // load new data
    cur_geojson = L.geoJson(json, {
        style,
        onEachFeature
    }).addTo(map);
}

async function SA3toMap() {
    console.log("SA3 clicked");
    const json = await load_shapefile(sa3_url);

    // Clear map of old data
    map.removeLayer(cur_geojson)

    // load new data
    cur_geojson = L.geoJson(json, {
        style,
        onEachFeature
    }).addTo(map);
}



var shape_obj

async function load_shapefile(url) {
    // let url = 'sa2_wa_simple.geojson';
    const response = await fetch(url)
    shape_obj = await response.json();
    console.log(shape_obj);
    return shape_obj;
}

async function main() {
    const json = await load_shapefile(sa3_url);
    // function style_i(feature) { return style(feature, "Curtin"); }
    cur_geojson = L.geoJson(json, {
        style,
        onEachFeature
    }).addTo(map);
}
main()


function resetHighlight(e) {
    cur_geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">Australian Bureau of Statistics</a>');


const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {

    const div = L.DomUtil.create('div', 'info legend');
    const grades = [0, 10, 20, 50, 100, 200, 500, 1000];
    const labels = [];
    let from, to;
    labels.push('UWA Students in area')
    for (let i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(`<i style="background:${getColor(from + 1)}"></i> ${from}${to ? `&ndash;${to}` : '+'}`);
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);



