import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { supabase } from "../lib/supabase";


function Booking() {

  const { hotelId, roomId } = useParams();

  const navigate = useNavigate();


  // ================= USER =================

  const [user, setUser] = useState(null);


  // ================= FORM =================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [guests, setGuests] = useState(1);

  const [loading, setLoading] = useState(false);


  // ================= GET LOGGED-IN USER =================

  useEffect(() => {

    getUser();

  }, []);


  async function getUser() {

    const {
      data: { user }
    } = await supabase.auth.getUser();

    setUser(user);


    // Automatically use logged-in email

    if (user?.email) {
      setEmail(user.email);
    }

  }


  // ================= CALCULATE NIGHTS =================

  function calculateNights() {

    if (!checkIn || !checkOut) {
      return 0;
    }


    const start =
      new Date(checkIn);

    const end =
      new Date(checkOut);


    const difference =
      end - start;


    return difference /
      (1000 * 60 * 60 * 24);
  }


  // ================= CONFIRM BOOKING =================

  
 async function handleBooking(e) {
  e.preventDefault();

  if (!user) {
    alert("Please login before booking.");
    navigate("/login");
    return;
  }

  if (!checkIn || !checkOut) {
    alert("Please select check-in and check-out dates.");
    return;
  }

  if (new Date(checkOut) <= new Date(checkIn)) {
    alert("Check-out must be after check-in.");
    return;
  }

  const nights = calculateNights();

  setLoading(true);

  // 1. Get room information
  const {
    data: room,
    error: roomError
  } = await supabase
    .from("rooms")
    .select("price, capacity, available_rooms")
    .eq("id", roomId)
    .single();

  if (roomError) {
    console.error("Room error:", roomError);
    alert("Could not find the selected room.");
    setLoading(false);
    return;
  }

  // 2. Check guest capacity
  if (Number(guests) > Number(room.capacity)) {
    alert(
      `This room can accommodate only ${room.capacity} guests.`
    );
    setLoading(false);
    return;
  }

  // 3. Find bookings that overlap the selected dates
  const {
    data: existingBookings,
    error: bookingCheckError
  } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, rooms")
    .eq("room_id", roomId)
    .lt("check_in", checkOut)
    .gt("check_out", checkIn);

  if (bookingCheckError) {
    console.error(
      "Availability check error:",
      bookingCheckError
    );

    alert(
      "Could not check room availability."
    );

    setLoading(false);
    return;
  }

  // 4. Calculate how many rooms are already booked
  const bookedRooms = existingBookings.reduce(
    (total, booking) =>
      total + Number(booking.rooms || 1),
    0
  );

  // 5. Calculate remaining rooms
  const remainingRooms =
    Number(room.available_rooms) -
    bookedRooms;

  console.log("Total rooms:", room.available_rooms);
  console.log("Booked rooms:", bookedRooms);
  console.log("Remaining rooms:", remainingRooms);

  // 6. Check availability
  if (remainingRooms < 1) {
    alert(
      "Sorry, all rooms of this type are already booked for the selected dates."
    );

    setLoading(false);
    return;
  }

  // 7. Calculate total price
  const totalPrice =
    Number(room.price) * Number(nights);

  // 8. Create booking
  const { error } = await supabase
    .from("bookings")
    .insert([
      {
        hotel_id: Number(hotelId),
        room_id: Number(roomId),
        user_id: user.id,
        guest_name: name,
        email: email,
        phone: phone,
        check_in: checkIn,
        check_out: checkOut,
        guests: Number(guests),
        rooms: 1,
        total_price: totalPrice
      }
    ]);

  if (error) {
    console.error(
      "Booking error:",
      error
    );

    alert(
      "Booking failed. Please try again."
    );

    setLoading(false);
    return;
  }

  setLoading(false);

  navigate("/booking-success", {
    state: {
      booking: {
        name,
        email,
        checkIn,
        checkOut,
        guests,
        nights,
        totalPrice
      }
    }
  });
}

  const nights =
    calculateNights();


  // ================= PAGE =================

  return (

    <div className="booking-page">

      <div className="booking-container">


        {/* ================= BOOKING FORM ================= */}

        <div className="booking-form">

          <h1>
            Complete Your Booking
          </h1>


          <form
            onSubmit={handleBooking}
          >


            {/* NAME */}

            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />


            {/* EMAIL */}

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />


            {/* PHONE */}

            <label>
              Phone
            </label>

            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              required
            />


            {/* CHECK IN */}

            <label>
              Check-in
            </label>

            <input
              type="date"
              value={checkIn}
              onChange={(e) =>
                setCheckIn(e.target.value)
              }
              required
            />


            {/* CHECK OUT */}

            <label>
              Check-out
            </label>

            <input
              type="date"
              value={checkOut}
              onChange={(e) =>
                setCheckOut(e.target.value)
              }
              required
            />


            {/* GUESTS */}

            <label>
              Number of Guests
            </label>

            <input
              type="number"
              min="1"
              value={guests}
              onChange={(e) =>
                setGuests(
                  Number(e.target.value)
                )
              }
              required
            />


            {/* CONFIRM BUTTON */}

            <button
              type="submit"
              className="confirm-button"
              disabled={loading}
            >

              {loading
                ? "Confirming..."
                : "Confirm Booking"}

            </button>


          </form>

        </div>


        {/* ================= BOOKING SUMMARY ================= */}

        <div className="booking-summary">

          <h2>
            Booking Summary
          </h2>


          <p>
            Hotel ID: {hotelId}
          </p>


          <p>
            Room ID: {roomId}
          </p>


          <p>
            Guests: {guests}
          </p>


          <p>
            Nights: {nights}
          </p>


          {nights > 0 && (

            <p>
              Price will be calculated
              using the selected room.
            </p>

          )}

        </div>


      </div>

    </div>

  );
}


export default Booking;