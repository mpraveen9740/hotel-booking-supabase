import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";


function MyBookings() {

  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");


  useEffect(() => {

    fetchBookings();

  }, []);


  async function fetchBookings() {

    setLoading(true);

    setErrorMessage("");


    // ================= GET USER =================

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();


    if (userError) {

      setErrorMessage(
        userError.message
      );

      setLoading(false);

      return;

    }


    if (!user) {

      navigate("/login");

      return;

    }


    // ================= GET BOOKINGS =================

    const {
      data: bookingData,
      error: bookingError
    } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false
      });


    if (bookingError) {

      console.error(
        "Booking error:",
        bookingError
      );

      setErrorMessage(
        bookingError.message
      );

      setLoading(false);

      return;

    }


    // ================= GET HOTEL + ROOM DETAILS =================

    const enrichedBookings =
      await Promise.all(

        bookingData.map(
          async (booking) => {

            // Get hotel

            const {
              data: hotel
            } = await supabase
              .from("hotels")
              .select(
                "name, city, image_url"
              )
              .eq(
                "id",
                booking.hotel_id
              )
              .single();


            // Get room

            const {
              data: room
            } = await supabase
              .from("rooms")
              .select(
                "room_type, price"
              )
              .eq(
                "id",
                booking.room_id
              )
              .single();


            return {

              ...booking,

              hotel,

              room

            };

          }
        )

      );


    setBookings(
      enrichedBookings
    );

    setLoading(false);

  }


  // ================= LOADING =================

  if (loading) {

    return (

      <div className="my-bookings-page">

        <h1>
          Loading your bookings...
        </h1>

      </div>

    );

  }


  // ================= ERROR =================

  if (errorMessage) {

    return (

      <div className="my-bookings-page">

        <div className="no-bookings">

          <h2>
            Unable to load bookings
          </h2>

          <p>
            {errorMessage}
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
          >
            Back to Home
          </button>

        </div>

      </div>

    );

  }


  // ================= PAGE =================

  return (

    <div className="my-bookings-page">

      <div className="my-bookings-container">


        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>


        <h1>
          My Bookings
        </h1>


        {bookings.length === 0 ? (

          <div className="no-bookings">

            <h2>
              No bookings yet
            </h2>

            <p>
              You haven't made any hotel
              bookings yet.
            </p>


            <button
              onClick={() =>
                navigate("/")
              }
            >
              Explore Hotels
            </button>

          </div>

        ) : (

          <div className="my-bookings-list">


            {bookings.map(
              (booking) => (

                <div
                  className="booking-history-card"
                  key={booking.id}
                >


                  {/* HOTEL IMAGE */}

                  <img
                    src={
                      booking.hotel?.image_url
                    }
                    alt={
                      booking.hotel?.name ||
                      "Hotel"
                    }
                  />


                  {/* DETAILS */}

                  <div className="booking-history-content">


                    <h2>
                      {booking.hotel?.name ||
                        "Hotel"}
                    </h2>


                    <p>
                      📍{" "}
                      {booking.hotel?.city ||
                        "Location unavailable"}
                    </p>


                    <p>
                      🛏️{" "}
                      {booking.room?.room_type ||
                        "Room"}
                    </p>


                    <p>
                      📅 Check-in:{" "}
                      {booking.check_in}
                    </p>


                    <p>
                      📅 Check-out:{" "}
                      {booking.check_out}
                    </p>


                    <p>
                      👥 Guests:{" "}
                      {booking.guests}
                    </p>


                    <p>
                      🏨 Rooms:{" "}
                      {booking.rooms}
                    </p>


                    <h3>
                      ₹{booking.total_price}
                    </h3>


                    <p className="booking-id">
                      Booking ID: #{booking.id}
                    </p>


                  </div>


                </div>

              )
            )}


          </div>

        )}


      </div>

    </div>

  );

}


export default MyBookings;