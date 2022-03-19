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
            name: "Ciao!!",
            location: {
                lat: 40.72555620444061, // change here latitude if using static data
                lng: 8.56526266783476, // change here longitude if using static data
            },
			image: "assets/map-marker_2.png",
			href: "https://www.acquaepietra.it/NSDA/start_page/timeline_venafro.html",
			target: "_blank",
			text: "vuoi saperne di più?"
        },
		{
            name: "Ariciao!!",
            location: {
                lat: 40.72617414060629, // change here latitude if using static data
                lng: 8.565589897334577, // change here longitude if using static data
            },
			image: "assets/map-marker.png",
			href: "https://www.visitmolise.eu",
			target: "_blank",
			text: "vuoi saperne di più?"
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
        icon.setAttribute('scale', '5 5 5');
		icon.setAttribute('href', place.href);
		icon.setAttribute('target', place.target);
		icon.setAttribute('text', place.text);
		

        
        icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));


// this click listener has to be added simply to a click event on an a-entity element
const clickListener = function (ev) {
    ev.stopPropagation();
    ev.preventDefault();

    const name = ev.target.getAttribute('name');
	const link = ev.target.getAttribute('href');
    const el = ev.detail.intersection && ev.detail.intersection.object.el;
	
    if (el && el === ev.target) {
        // after click, we are adding a label with the name of the place
        const label = document.createElement('span');
        const container = document.createElement('div');
        container.setAttribute('id', 'place-label');
        label.innerHTML = name+"<br>"+"<a href="+link+" target='_blank'>Vuoi saperne di più</a>";
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
