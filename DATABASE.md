# LOKIVA — Database Schema & Data Models

LOKIVA uses SQLAlchemy ORM supporting SQLite (default local zero-setup) and PostgreSQL + PostGIS + pgvector.

## Entity Relationship Diagram

```
+----------------+          +-------------------+          +------------------+
|     User       |<-------->|  TravelerProfile  |          |     Provider     |
+----------------+          +-------------------+          +------------------+
| id             |          | id                |          | id               |
| email          |          | user_id (FK)      |          | user_id (FK)     |
| full_name      |          | traveler_type     |          | business_name    |
| hashed_password|          | group_size        |          | is_verified      |
| role           |          | budget            |          | rating           |
+-------+--------+          | interests         |          +--------+---------+
        |                   | accessibility     |                   |
        |                   +-------------------+                   |
        v                                                           v
+----------------+          +-------------------+          +------------------+
|   Itinerary    |          |    Experience     |<---------| ProviderAnalytics|
+----------------+          +-------------------+          +------------------+
| id             |          | id                |          | views, saves     |
| user_id (FK)   |          | provider_id (FK)  |          | bookings, rev    |
| start_time     |          | title, desc       |          +------------------+
| total_duration |          | category, price   |
| total_budget   |          | duration_mins     |
| actual_cost    |          | lat, lng, address |
| feas_score     |          | is_indoor         |
+-------+--------+          | is_hidden_gem     |
        |                   | accessibility_*   |
        v                   | rating, reviews   |
+----------------+          +---------+---------+
| ItineraryItem  |                    |
+----------------+                    |
| itinerary_id   |<-------------------+
| experience_id  |
| scheduled_start|
| scheduled_end  |
| travel_time    |
| why_it_fits    |
+----------------+
```
