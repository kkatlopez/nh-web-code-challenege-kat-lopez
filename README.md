# To run:

1. Create a copy of `example.env` file.
2. Go to [Set up the Maps Embed API](https://developers.google.com/maps/documentation/embed/get-api-key?setupProd=enable) on Google Maps Platform and follow the directions to generate an API key.
3. In `example.env`, paste your API key:
   `VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE`
4. Rename the file to `.env`
5. Run `npm install` in your terminal to install required packages.
6. Run `npm run dev` to start the application.

## Assumptions made:

- Users were assumed to be driving to their destinations - no other mode of transport was considered (see answer to #2 below).

## Questions:

### 1. If we were to release the MVP to Production as requested, what are the limiting factors of your solution? What issues do you think the users will run into immediately?

- **API usage:** billing might get high depending on the number of users utilizing the application (not necessarily on the user, but worth noting regardless)
- **Open hours of the clinician's office and lab:** there is the possibility that a user is viewing the directions to go to a clinician or lab, but they are not open on that particular day.
- **Planning a trip for the future:** there is a possibility that users are planning their trip for the next day or following week. The application currently assumes they are looking for directions when they click the button, so drive times might not be 100% accurate if they are, for example, planning to drive during rush hour on a weekday.

### 2. Besides drive times, what other factors could be considered to optimize sending the right clinician to a patient?

- Currently, the application assumes you are driving. There are other modes of transportation like biking, public transport, walking, etc. Users could select from a dropdown what option they'd want to take, and if no option is selected, assume they are driving.
- Similar to the last point, tolls/toll roads are not taken into consideration. Users may not want to pay tolls - a filter could combat this in the future.
