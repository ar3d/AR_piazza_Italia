window.onload = () => {
    let method = 'dynamic';

    // if you want to statically add places, de-comment following line:
    method = 'static';
    if (method === 'static') {
        let places = staticLoadPlaces();
        return renderPlaces(places);
    }

    if (method !== 'static') {
        // first get current user location
        return navigator.geolocation.getCurrentPosition(function (position) {

            // than use it to load from remote APIs some places nearby
            dynamicLoadPlaces(position.coords)
                .then((places) => {
                    renderPlaces(places);
                })
        },
            (err) => console.error('Error in retrieving position', err),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 27000,
            }
        );
    }
};

function staticLoadPlaces() {
    return [
        {
            name: "Palazzo della Provincia",
            location: {
                lat: 40.725374, // change here latitude if using static data
                lng: 8.564491, // change here longitude if using static data
            },
			image: "assets/map-marker.png",
			href: "https://it.wikipedia.org/wiki/Palazzo_della_Provincia_(Sassari)",
			sfondo: "assets/palazzo_provincia.jpg",
			text: "Costruito tra il 1873 e il 1878 dall'ing. Borgnini affiancato dall'ing. Sironi in stile neoclassico, ospita gli uffici della Prefettura e della Provincia di Sassari"
        },
		{
            name: "Palazzo Giordano",
            location: {
                lat: 40.724974, // change here latitude if using static data
                lng: 8.563411, // change here longitude if using static data
            },
			image: "assets/map-marker.png",
			href: "https://it.wikipedia.org/wiki/Palazzo_Giordano",
			sfondo: "assets/palazzo_giordano.jpg",
			text: "Fu costruito in stile neogotico dall'ing. Pasquali e dall'arch. Fasoli per conto del senatore Giuseppe Giordano Apostoli a partire dal 1877"
        },
    ];
}

// getting places from REST APIs
function dynamicLoadPlaces(position) {
    let params = {
        radius: 300,    // search places not farther than this value (in meters)
        clientId: 'HZIJGI4COHQ4AI45QXKCDFJWFJ1SFHYDFCCWKPIJDWHLVQVZ',
        clientSecret: '',
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    // NOTE this no longer works - please replace with your own proxy
    let corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    let endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=15
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    places.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;

        // add place name
        let icon = document.createElement('a-image');
        icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
        icon.setAttribute('name', place.name);
        icon.setAttribute('src', place.image);
        icon.setAttribute('scale', '2 2 2');
		icon.setAttribute('href', place.href);
		icon.setAttribute('sfondo', place.sfondo);
		icon.setAttribute('text', place.text);
		

        
        icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));


// this click listener has to be added simply to a click event on an a-entity element
const clickListener = function (ev) {
    ev.stopPropagation();
    ev.preventDefault();

    const name = ev.target.getAttribute('name');
	const link = ev.target.getAttribute('href');
	const testo = ev.target.getAttribute('text');
	const sfondo = ev.target.getAttribute('sfondo');
    const el = ev.detail.intersection && ev.detail.intersection.object.el;
	
    if (el && el === ev.target) {
        // after click, we are adding a label with the name of the place
        const label = document.createElement('span');
        const container = document.createElement('div');
        container.setAttribute('id', 'place-label');
		label.innerHTML = "<a href="+link+"><img src="+sfondo+"></a>
        container.appendChild(label);
        document.body.appendChild(container);

        setTimeout(() => {
            // that will disappear after less than 2 seconds
            container.parentElement.removeChild(container);
        }, 3000);
     }
 };
icon.addEventListener('click', clickListener);
        scene.appendChild(icon);
    });
}
