import { useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import clinicianData from './data/clinicians.json';
import labData from './data/labs.json';
import { fetchAddr, fetchRoutes, fetchLongAndLat } from './api';
import { type Route, type DataWithCoordinates } from './types/types';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AddressInput from '@/components/AddressInput';
import ResultCard from './components/ResultCard';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function App() {
  const [clinicCoords, setClinicCoords] = useState<DataWithCoordinates[]>([]);
  const [labCoords, setLabCoords] = useState<DataWithCoordinates[]>([]);
  const [selectedAddr, setSelectedAddr] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [labRequired, setLabRequired] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [updatedClinics, updatedLabs] = await Promise.all([
        fetchLongAndLat(clinicianData),
        fetchLongAndLat(labData),
      ]);
      setLabCoords(updatedLabs);
      setClinicCoords(updatedClinics);
    };
    fetchAll();
  }, []);

  const getRoutes = async (address: string, lat: number, lng: number) => {
    setIsLoading(true);
    const routes = await fetchRoutes(
      { address: address, lat: lat, lng: lng },
      clinicCoords,
      labCoords,
      labRequired,
    );
    if (routes && routes.length > 0) {
      setIsLoading(false);
      setRoutes(routes);
    }
  };

  const handleClick = async () => {
    const res = await fetchAddr(selectedAddr.formatted_address);
    if (res.status === 'OK') {
      const result = res.results[0];
      setSelectedAddr(result);
      getRoutes(
        result.formatted_address,
        result.geometry.location.lat,
        result.geometry.location.lng,
      );
    } else setHasError(true);
  };

  const handleCheckChange = (checkState: boolean | 'indeterminate') => {
    setLabRequired(!!checkState);
  };

  const convertDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const hourDisplay = hours > 0 ? hours + ' hr ' : '';
    const minutesDisplay = minutes > 0 ? minutes + ' min' : '';
    return hourDisplay + minutesDisplay;
  };

  const createMapsUrl = (route: Route) => {
    let base = `https://www.google.com/maps/dir/?api=1&origin=${selectedAddr.formatted_address}&destination=${selectedAddr.formatted_address}&travel_mode=driving&waypoints=${route.address}`;
    if (route.labAddress) {
      base = base + `|${route.labAddress}`;
    }
    return base;
  };

  return (
    <main className='max-w-6xl mx-auto p-4 md:p-6'>
      <h1 className='mb-2 font-bold text-3xl text-center'>
        Find your nearest clinician and lab
      </h1>
      <FieldGroup className='gap-3'>
        <Field className='gap-1'>
          <FieldLabel htmlFor='input-field-address'>Address</FieldLabel>
          <APIProvider
            apiKey={API_KEY}
            solutionChannel='GMP_devsite_samples_v3_rgmautocomplete'
          >
            <div className='autocomplete-control w-100 border border-zinc-200 rounded-sm'>
              <AddressInput onPlaceSelect={setSelectedAddr} />
            </div>
            <FieldDescription>
              Begin typing an address and select an option from the dropdown
            </FieldDescription>
          </APIProvider>
        </Field>
        <Field orientation='horizontal'>
          <Checkbox
            id='checkbox-lab'
            name='checkbox-lab'
            checked={labRequired}
            onCheckedChange={handleCheckChange}
          />
          <FieldLabel htmlFor='checkbox-lab'>Lab drop-off required</FieldLabel>
        </Field>
        <Field>
          <Button
            disabled={!selectedAddr || isLoading}
            onClick={handleClick}
            className='cursor-pointer'
          >
            {isLoading && <Spinner data-icon='inline-start' />}
            {!isLoading
              ? 'Find Optimal Clinician'
              : 'Finding you the best route...'}
          </Button>
        </Field>
      </FieldGroup>
      {hasError && (
        <Alert
          variant='destructive'
          className='bg-red-50 border-red-200 shadow-sm shadow-red-50 rounded-sm my-4'
        >
          <AlertTitle>An error occurred</AlertTitle>
          <AlertDescription>
            Could not fetch routes, please try again.
          </AlertDescription>
        </Alert>
      )}
      {routes && routes.length > 0 && !isLoading && !hasError && (
        <div className='py-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {routes.map((route, i) => (
              <ResultCard
                i={i}
                route={route}
                selectedAddr={selectedAddr}
                labRequired={labRequired}
                convertDuration={convertDuration}
                createMapsUrl={createMapsUrl}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
