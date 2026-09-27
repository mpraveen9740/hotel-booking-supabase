import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";


function HotelDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);

  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);


  // ================= GET HOTEL =================

  useEffect(() => {

    fetchHotel();

  }, [id]);


  async function fetchHotel() {

    setLoading(true);


    // Get hotel

    const { data: hotelData, error: hotelError } =
      await supabase
        .from("hotels")
        .select("*")
        .eq("id", id)
        .single();


    if (hotelError) {

      console.error(
        "Hotel error:",
        hotelError
      );

      setHotel(null);

      setLoading(false);

      return;
    }


    setHotel(hotelData);


    // Get rooms belonging to this hotel

    const { data: roomData, error: roomError } =
      await supabase
        .from("rooms")
        .select("*")
        .eq("hotel_id", id);


    if (roomError) {

      console.error(
        "Room error:",
        roomError
      );

      setRooms([]);

    } else {

      setRooms(roomData);

    }


    setLoading(false);
  }


  // ================= LOADING =================

  if (loading) {

    return (

      <div className="details-page">

        <h1>
          Loading hotel...
        </h1>

      </div>

    );

  }


  // ================= HOTEL NOT FOUND =================

  if (!hotel) {

    return (

      <div className="details-page">

        <h1>
          Hotel Not Found
        </h1>


        <button
          onClick={() => navigate("/")}
        >
          Back to Hotels
        </button>

      </div>

    );

  }


  // ================= HOTEL DETAILS =================

  return (

    <div className="details-page">


      <button
        className="back-button"
        onClick={() => navigate("/")}
      >
        ← Back to Hotels
      </button>


      <img
        src={hotel.image_url}
        alt={hotel.name}
        className="details-image"
      />


      <div className="details-info">


        <h1>
          {hotel.name}
        </h1>


        <p>
          📍 {hotel.city}
        </p>


        <p>
          📌 {hotel.location}
        </p>


        <p>
          ⭐ {hotel.rating}
        </p>


        <p className="details-description">
          {hotel.description}
        </p>


        <h2>
          Available Rooms
        </h2>


        {rooms.length === 0 ? (

          <p>
            No rooms available.
          </p>

        ) : (

          <div className="rooms-list">

            {rooms.map((room) => (

              <div
                className="room-card"
                key={room.id}
              >


                <div>

                  <h3>
                    {room.room_type}
                  </h3>


                  <p>
                    👥 Up to {room.capacity} guests
                  </p>


                  <p>
                    🏨 Available rooms:{" "}
                    {room.available_rooms}
                  </p>


                  <h3>
                    ₹{room.price} / night
                  </h3>

                </div>


                <button
                  className="book-button"
                  onClick={() =>
                    navigate(
                      `/booking/${hotel.id}/${room.id}`
                    )
                  }
                >
                  Book Now
                </button>


              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}


export default HotelDetails;