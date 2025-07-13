Pre-assignment
Our inflight crew needs passenger data in their apps. We had a planning session with the apps’ product
owners and decided to create two REST API endpoints: one for a list of passengers in a flight, and one for a
single passenger in a flight.
Your job is to create a data model layer for the endpoints.

1. Create modules/classes that model the data.
2. Create a database and database modules/classes that create a couple mock objects of each model.
3. Create a connection between the model classes and the database classes.
4. Create a controller that can be used to simulate sample requests.
   Endpoint:
   GET /passengers?flightNumber=<flight-number>&departureDate=<departure-date>
   Response body:
   [
   {
   ”passengerId”: ”string”,
   “firstName”: “string”,
   ”lastName”: ”string”,
   “bookingId”: “string, 6 chars”
   },
   ...
   ]
   Endpoint:
   GET /passengers/<passenger-id>
   Response body:
   {
   ”passengerId”: ”string”,
   ”firstName”: “string”,
   “lastName”: “string”,
   “email”: “string”,
   “bookingId”: “string, 6 chars”,
   “flights”: [
   {
   “flightNumber”: “string, carrier code + flight number”
   “departureAirport”: “string, 3 chars”,
   “arrivalAirport”: “string, 3 chars”,
   “departureDate”: “string, yyyy-mm-dd”,
   “arrivalDate”: “string, yyyy-mm-dd”
   },
   ...
   ]
   }
   Notes:
   • A booking can have multiple passengers, and a passenger can be in one booking.
   • A booking can have multiple flights, and a flight can have multiple bookings.
   • Do the assignment the way you would do it at work, but not everything has to be production-ready.
   • Use the programming language and framework you’re most familiar with.
