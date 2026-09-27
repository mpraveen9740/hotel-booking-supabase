import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { supabase } from "./lib/supabase";

import Navbar from "./components/Navbar";
import HotelCard from "./components/HotelCard";

import HotelDetails from "./pages/HotelDetails";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import Login from "./pages/Login";
import MyBookings from "./pages/MyBookings";
import Admin from "./pages/Admin";


/* =========================
   HOME PAGE
========================= */

function Home() {
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [hotels, setHotels] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(true);


  /* =========================
     FETCH HOTELS
  ========================= */

  useEffect(() => {
    fetchHotels();
  }, []);


  async function fetchHotels() {
    try {
      setLoading(true);

      const {
        data,
        error
      } = await supabase
        .from("hotels")
        .select("*")
        .order("id", {
          ascending: true
        });

      if (error) {
        console.error("Hotel fetch error:", error);
        return;
      }

      setHotels(data || []);
      setSearchResults(data || []);

    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  }


  /* =========================
     SEARCH HOTELS
  ========================= */

  async function handleSearch() {

    /* Check date validity */

    if (checkIn && checkOut) {

      if (
        new Date(checkOut) <=
        new Date(checkIn)
      ) {
        alert(
          "Check-out must be after check-in."
        );
        return;
      }
    }


    /* Filter by city */

    const cityResults = hotels.filter(
      (hotel) => {

        return (
          city.trim() === "" ||
          hotel.city
            .toLowerCase()
            .includes(
              city.toLowerCase()
            )
        );
      }
    );


    /* If dates are not selected,
       just show city results */

    if (!checkIn || !checkOut) {

      setSearchResults(cityResults);
      return;
    }


    try {

      const hotelIds =
        cityResults.map(
          (hotel) => hotel.id
        );


      if (hotelIds.length === 0) {

        setSearchResults([]);
        return;
      }


      /* Get rooms */

      const {
        data: rooms,
        error: roomsError
      } = await supabase
        .from("rooms")
        .select(
          "id, hotel_id, available_rooms"
        )
        .in(
          "hotel_id",
          hotelIds
        );


      if (roomsError) {

        console.error(
          "Room search error:",
          roomsError
        );

        alert(
          "Could not check room availability."
        );

        return;
      }


      const availableHotelIds = [];


      /* Check every room */

      for (
        const room of rooms || []
      ) {

        const {
          data: bookings,
          error: bookingError
        } = await supabase
          .from("bookings")
          .select("rooms")
          .eq(
            "room_id",
            room.id
          )
          .lt(
            "check_in",
            checkOut
          )
          .gt(
            "check_out",
            checkIn
          );


        if (bookingError) {

          console.error(
            "Booking availability error:",
            bookingError
          );

          continue;
        }


        /* Count booked rooms */

        const bookedRooms =
          (bookings || []).reduce(
            (
              total,
              booking
            ) =>
              total +
              Number(
                booking.rooms || 1
              ),
            0
          );


        const remainingRooms =
          Number(
            room.available_rooms
          ) -
          bookedRooms;


        if (remainingRooms > 0) {

          availableHotelIds.push(
            room.hotel_id
          );
        }
      }


      /* Remove duplicates */

      const uniqueHotelIds =
        [
          ...new Set(
            availableHotelIds
          )
        ];


      /* Get available hotels */

      const availableHotels =
        cityResults.filter(
          (hotel) =>
            uniqueHotelIds.includes(
              hotel.id
            )
        );


      setSearchResults(
        availableHotels
      );

    } catch (error) {

      console.error(
        "Search error:",
        error
      );

      alert(
        "Something went wrong while searching."
      );
    }
  }


  return (
    <div>

      {/* =========================
          HERO SECTION
      ========================= */}

      <section className="hero">

        <div className="hero-content">

          <h1>
            Find Your Perfect Stay
          </h1>

          <p>
            Discover comfortable hotels
            at the best prices.
          </p>


          {/* =========================
              SEARCH BOX
          ========================= */}

          <div className="search-box">

            <div className="search-field">

              <label>
                City
              </label>

              <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) =>
                  setCity(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="search-field">

              <label>
                Check-in
              </label>

              <input
                type="date"
                value={checkIn}
                onChange={(e) =>
                  setCheckIn(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="search-field">

              <label>
                Check-out
              </label>

              <input
                type="date"
                value={checkOut}
                onChange={(e) =>
                  setCheckOut(
                    e.target.value
                  )
                }
              />

            </div>


            <button
              className="search-button"
              onClick={handleSearch}
            >
              Search Hotels
            </button>

          </div>

        </div>

      </section>


      {/* =========================
          HOTEL SECTION
      ========================= */}

      <section
        className="hotels-section"
        id="hotels"
      >

        <div className="section-header">

          <h1>
            {city
              ? `Hotels in ${city}`
              : "Popular Hotels"}
          </h1>

          <p>
            Choose from our available
            hotels and rooms.
          </p>

        </div>


        {/* Loading */}

        {loading ? (

          <div className="loading">
            Loading hotels...
          </div>

        ) : searchResults.length === 0 ? (

          <div className="no-hotels">

            <h2>
              No hotels found
            </h2>

            <p>
              Try another city or
              different dates.
            </p>

          </div>

        ) : (

          <div className="hotel-grid">

            {searchResults.map(
              (hotel) => (

                <HotelCard
                  key={hotel.id}
                  id={hotel.id}
                  name={hotel.name}
                  city={hotel.city}
                  price={
                    hotel.price_per_night
                  }
                  rating={hotel.rating}
                  image={hotel.image_url}
                />

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}


/* =========================
   MAIN APP
========================= */

function App() {

  return (
    <>

      <Navbar />

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* HOTEL DETAILS */}

        <Route
          path="/hotel/:id"
          element={
            <HotelDetails />
          }
        />


        {/* BOOKING */}

        <Route
          path="/booking/:hotelId/:roomId"
          element={
            <Booking />
          }
        />


        {/* BOOKING SUCCESS */}

        <Route
          path="/booking-success"
          element={
            <BookingSuccess />
          }
        />


        {/* LOGIN */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        {/* MY BOOKINGS */}

        <Route
          path="/my-bookings"
          element={
            <MyBookings />
          }
        />


        {/* ADMIN */}

        <Route
          path="/admin"
          element={
            <Admin />
          }
        />

      </Routes>

    </>
  );
}


export default App;