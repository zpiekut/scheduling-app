# Appointment Scheduling App

This project is an appointment scheduling app for providers and clients. It allows providers to submit a schedule and clients to book appointments for open timeslots within that schedule. Appointments must be booked 24hrs in advance and then confirmed within 30mins of booking.

## Setup

This project is run using docker. Run the following command in the project root directory to build and run

```
docker-compose up --build
```

A Postman collection for testing is included in this repo. 

## Tradeoffs

Some tradoffs had to be made to keep within the development timeframe, which would need to be fixed, refactored, or developed further before a production deployment

* In the interest of time, the scheduling datetimes were implemented very simply. The app does not handle timezones, daylight savings, etc.

* The api endpoints do not validate request parameters. Input validation should be added to check for correct values and prevent sql injection attacks.

* Authentication and authorization needs to be added on all endpoints.

* The application should be broken up into separate files/modules for better organization and maintainability.

* Unit and API level tests should be written.

* Event and error logging

* Configuration parameters should be pulled from aws parameter store and secrets manager (or something similar) when deployed

* A number of additional api endpoints would likely be wanted/needed, like create and update for both clients and providers, GET calls for individual clients/providers/appointments, etc