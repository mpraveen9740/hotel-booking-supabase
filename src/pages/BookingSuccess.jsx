import { useLocation, useNavigate } from "react-router-dom";

function BookingSuccess() {

  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;


  // If someone opens the page directly
  if (!booking) {

    return (
      <div className="success-page">

        <div className="success-card">

          <h1>Booking Not Found</h1>

          <button
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>

        </div>

      </div>
    );

  }


  return (

    <div className="success-page">

      <div className="success-card">

        <div className="success-icon">
          ✓
        </div>


        <h1>
          Booking Confirmed!
        </h1>


        <p className="success-message">
          Your hotel booking has been successfully
          confirmed.
        </p>


        <div className="booking-details">

          <div>
            <strong>Guest Name</strong>
            <span>{booking.name}</span>
          </div>


          <div>
            <strong>Email</strong>
            <span>{booking.email}</span>
          </div>


          <div>
            <strong>Check-in</strong>
            <span>{booking.checkIn}</span>
          </div>


          <div>
            <strong>Check-out</strong>
            <span>{booking.checkOut}</span>
          </div>


          <div>
            <strong>Guests</strong>
            <span>{booking.guests}</span>
          </div>


          <div>
            <strong>Nights</strong>
            <span>{booking.nights}</span>
          </div>


          <div className="total-price">

            <strong>Total Price</strong>

            <span>
              ₹{booking.totalPrice}
            </span>

          </div>

        </div>


        <button
          className="home-button"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>

      </div>

    </div>

  );
}

export default BookingSuccess;