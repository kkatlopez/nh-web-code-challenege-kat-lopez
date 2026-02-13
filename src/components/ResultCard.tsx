import { type Route } from '@/types/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

interface ResultCardProps {
  i: number;
  route: Route;
  selectedAddr: google.maps.places.PlaceResult;
  labRequired: boolean;
  convertDuration: (duration: number) => string;
  createMapsUrl: (route: Route) => string;
}

export default function ResultCard({
  i,
  route,
  selectedAddr,
  labRequired,
  convertDuration,
  createMapsUrl,
}: ResultCardProps) {
  return (
    <Card
      className={`gap-3 shadow-sm rounded-sm ${i === 0 ? 'bg-blue-50 md:col-span-2' : ''}`}
    >
      <CardHeader>
        <CardTitle className='grid gap-2'>
          {i === 0 && (
            <Badge className='bg-blue-600 text-blue-50 w-fit'>Fastest</Badge>
          )}
          Clinician {route.name}
          {route.labAddress && ` and ${route.labName}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          <strong>Estimated travel time: </strong>
          {convertDuration(route.duration)}
        </p>
        <p>
          <strong>Distance: </strong>
          {(route.distance / 1609).toFixed(2)} miles
        </p>
        <div className='py-2 **:text-zinc-600'>
          <div className='ml-3 border-l-2 border-zinc-500 pl-3 py-2 route'>
            {selectedAddr.formatted_address}
          </div>
          <div className='ml-3 border-l-2 border-zinc-500 pl-3 py-2 route'>
            Clinician {route.name} -{' '}
            <a
              href={`https://www.google.com/maps/place/${route.address}`}
              className='text-blue-700! underline'
              target='_blank'
            >
              {route.address}
            </a>
          </div>
          {labRequired && route.labAddress && (
            <div className='ml-3 border-l-2 border-zinc-500 pl-3 py-2 route'>
              {route.labName} -{' '}
              <a
                href={`https://www.google.com/maps/place/${route.labAddress}`}
                className='text-blue-700! underline'
                target='_blank'
              >
                {route.labAddress}
              </a>
            </div>
          )}
          <div className='ml-3 border-l-2 border-zinc-500 pl-3 py-2 route'>
            {selectedAddr.formatted_address}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild size='sm' variant={i === 0 ? 'default' : 'secondary'}>
          <a href={createMapsUrl(route)} target='_blank'>
            Open in Google Maps <ArrowUpRight data-icon='inline-end' />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
