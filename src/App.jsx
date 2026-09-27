import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import HotelCard from "./components/HotelCard";
import HotelDetails from "./pages/HotelDetails";
import Booking from "./pages/Booking";

import { supabase } from "./lib/supabase";
import BookingSuccess from "./pages/BookingSuccess";

import Login from "./pages/Login";
import MyBookings from "./pages/MyBookings";
import Admin from "./pages/Admin";
// ================= HOME PAGE =================

function Home() {

  const [city, setCity] = useState("");

  const [checkIn, setCheckIn] = useState("");

  const [checkOut, setCheckOut] = useState("");

  const [hotels, setHotels] = useState([]);

  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(true);


  // ================= GET HOTELS =================

  useEffect(() => {

    fetchHotels();

  }, []);


  async function fetchHotels() {

    const { data, error } = await supabase
      .from("hotels")
      .select("*");


    if (error) {

      console.error(
        "Error fetching hotels:",
        error
      );

      setLoading(false);

      return;
    }


    setHotels(data);

    setSearchResults(data);

    setLoading(false);
  }


  // ================= SEARCH =================

 async function handleSearch() {
  if (checkIn && checkOut) {
    if (new Date(checkOut) <= new Date(checkIn)) {
      alert("Check-out must be after check-in.");
      return;
    }
  }

  // First filter hotels by city
  const cityResults = hotels.filter((hotel) => {
    return (
      city.trim() === "" ||
      hotel.city
        .toLowerCase()
        .includes(city.toLowerCase())
    );
  });

  // If no dates are selected, just show city results
  if (!checkIn || !checkOut) {
    setSearchResults(cityResults);
    return;
  }

  try {
    // Get rooms belonging to the filtered hotels
    const hotelIds = cityResults.map(
      (hotel) => hotel.id
    );

    if (hotelIds.length === 0) {
      setSearchResults([]);
      return;
    }

    const {
      data: rooms,
      error: roomsError
    } = await supabase
      .from("rooms")
      .select(
        "id, hotel_id, available_rooms"
      )
      .in("hotel_id", hotelIds);

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

    // Check availability for each room
    const availableHotelIds = [];

    for (const room of rooms || []) {
      const {
        data: bookings,
        error: bookingError
      } = await supabase
        .from("bookings")
        .select("rooms")
        .eq("room_id", room.id)
        .lt("check_in", checkOut)
        .gt("check_out", checkIn);

      if (bookingError) {
        console.error(
          "Booking availability error:",
          bookingError
        );

        continue;
      }

      const bookedRooms =
        (bookings || []).reduce(
          (total, booking) =>
            total +
            Number(booking.rooms || 1),
          0
        );

      const remainingRooms =
        Number(room.available_rooms) -
        bookedRooms;

      if (remainingRooms > 0) {
        availableHotelIds.push(
          room.hotel_id
        );
      }
    }

    // Remove duplicate hotel IDs
    const uniqueHotelIds = [
      ...new Set(availableHotelIds)
    ];

    const availableHotels =
      cityResults.filter((hotel) =>
        uniqueHotelIds.includes(hotel.id)
      );

    setSearchResults(availableHotels);

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

    <>

      <Navbar />


      {/* ================= HERO ================= */}

      <section className="hero">

        <h1>
          Find Your Perfect Stay
        </h1>

        <p>
          Comfortable hotels at great prices.
        </p>


        {/* ================= SEARCH BOX ================= */}

        <div className="search-box">

          <input
            type="text"
            placeholder="Where are you going?"
            value={city}
            onChange={(e) =>
              setCity(e.target.value)
            }
          />


          <input
            type="date"
            value={checkIn}
            onChange={(e) =>
              setCheckIn(e.target.value)
            }
          />


          <input
            type="date"
            value={checkOut}
            onChange={(e) =>
              setCheckOut(e.target.value)
            }
          />


          <button
            onClick={handleSearch}
          >
            Search
          </button>

        </div>

      </section>


      {/* ================= HOTELS ================= */}

   <section
  className="hotels"
  id="hotels"
>

        <h1>

          {city
            ? `Hotels in ${city}`
            : "Popular Hotels"}

        </h1>


        {/* LOADING */}

        {loading ? (

          <p>
            Loading hotels...
          </p>


        ) : searchResults.length === 0 ? (

          <p>
            No hotels found.
          </p>


        ) : (

          <div className="hotel-grid">

            {searchResults.map((hotel) => (

              <HotelCard

                key={hotel.id}

                id={hotel.id}

                name={hotel.name}

                city={hotel.city}

                price={hotel.price_per_night}

                rating={hotel.rating}

                image={hotel.image_url}

              />

            ))}

          </div>

        )}

      </section>

    </>

  );
}


// ================= MAIN APP =================

function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* HOTEL DETAILS */}

        <Route
          path="/hotel/:id"
          element={<HotelDetails />}
        />


        {/* BOOKING */}

        <Route
          path="/booking/:hotelId/:roomId"
          element={<Booking />}
        />
<Route
  path="/booking-success"
  element={<BookingSuccess />}
/>
<Route
  path="/login"
  element={<Login />}
/>
<Route
  path="/my-bookings"
  element={<MyBookings />}
/>
<Route
  path="/admin"
  element={<Admin />}
/>
      </Routes>

    </BrowserRouter>

  );
}


export default App;