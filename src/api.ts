import {
  type Data,
  type DataWithCoordinates,
  type LatLng,
  type Route,
} from './types/types';

const API_KEY: string = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const fetchAddr = async (address: string) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`;
  try {
    const resp = await fetch(url);
    if (resp.status === 200) {
      const json = await resp.json();
      return json;
    }
  } catch (error: unknown) {
    console.error(
      `An error occurred fetching longitude and latitude for ${address} - ${error}`,
    );
    throw error;
  }
};

const toLatLng = (coords: LatLng) => ({
  latitude: coords.lat,
  longitude: coords.lng,
});

export const fetchRoute = async (
  homeAddr: LatLng,
  clinicAddr: LatLng,
  labAddr: LatLng | null,
) => {
  const url = `https://routes.googleapis.com/directions/v2:computeRoutes`;
  try {
    const body = {
      origin: {
        location: {
          latLng: toLatLng(homeAddr),
        },
      },
      destination: {
        location: {
          latLng: toLatLng(homeAddr),
        },
      },
      intermediates: [
        {
          location: {
            latLng: toLatLng(clinicAddr),
          },
        },
      ],
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
    };
    if (labAddr?.lat && labAddr?.lng) {
      body['intermediates'].push({ location: { latLng: toLatLng(labAddr) } });
    }
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs',
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`HTTP error - status ${resp.status}`);
    const json = await resp.json();
    return json;
  } catch (error: unknown) {
    console.error(`An error occurred fetching the route`);
    throw error;
  }
};

export const fetchRoutes = async (
  homeAddr: LatLng,
  clinics: LatLng[],
  labs: LatLng[],
  labRequired: boolean,
) => {
  const routes: Partial<Route>[] = [];
  const labsToUse = labRequired ? labs : [null];
  await Promise.all(
    clinics.map(async (clinic) => {
      await Promise.all(
        labsToUse.map(async (lab) => {
          const route = await fetchRoute(homeAddr, clinic, lab);
          if (route.routes) {
            const { distanceMeters } = route.routes[0];
            let { duration } = route.routes[0];
            duration = Number(duration.replace('s', ''));
            let routeFound: Partial<Route> = {
              name: clinic.name,
              address: clinic.address,
              distance: distanceMeters,
              duration: duration,
            };
            if (labRequired && lab) {
              routeFound = {
                ...routeFound,
                labAddress: lab.address,
                labName: lab.name,
              };
            }
            routes.push(routeFound);
          }
        }),
      );
    }),
  );
  if (routes.length === 0) return null;
  return routes.sort((a, b) => a.duration! - b.duration!) as Route[];
};

export const fetchLongAndLat = async (
  items: Data[],
): Promise<DataWithCoordinates[]> => {
  return Promise.all(
    items.map(async (item: Data) => {
      const res = await fetchAddr(item.address);
      if (res.status === 'OK') {
        return {
          ...item,
          lng: res.results[0].geometry.location.lng,
          lat: res.results[0].geometry.location.lat,
        };
      }
      throw new Error(`Failed to get coordinates for ${item.address}`);
    }),
  );
};
