export interface Data {
  name: string;
  address: string;
}

export interface DataWithCoordinates extends Data {
  lat: number;
  lng: number;
}

export interface Route extends DataWithCoordinates {
  duration: number;
  distance: number;
  labName?: string;
  labAddress?: string;
}

export interface LatLng {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}
