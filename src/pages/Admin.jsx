import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

function Admin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      navigate("/login");
      return;
    }

    // Check whether the logged-in user is an admin
    const { data: adminData, error: adminError } =
      await supabase
        .from("admin_users")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminError || !adminData) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    await fetchHotels();
    await fetchBookings();

    setLoading(false);
  }

  async function fetchHotels() {
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .order("id", {
        ascending: true
      });

    if (error) {
      console.error(
        "Hotels error:",
        error
      );
      return;
    }

    setHotels(data || []);
  }

  async function fetchBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.error(
        "Bookings error:",
        error
      );
      return;
    }

    setBookings(data || []);
  }

  if (loading) {
    return (
      <div className="admin-page">
        <h1>Loading Admin Dashboard...</h1>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-denied">
          <h1>Access Denied</h1>

          <p>
            You do not have permission to access
            the admin dashboard.
          </p>

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
    <div className="admin-page">
      <div className="admin-container">

        <div className="admin-header">
          <div>
            <h1>🏨 StayEasy Admin</h1>
            <p>
              Manage your hotel booking system
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
          >
            Back to Website
          </button>
        </div>

        {/* Dashboard Statistics */}

        <div className="admin-stats">

          <div className="admin-stat-card">
            <h3>Total Hotels</h3>
            <strong>{hotels.length}</strong>
          </div>

          <div className="admin-stat-card">
            <h3>Total Bookings</h3>
            <strong>{bookings.length}</strong>
          </div>

        </div>

        {/* Hotels */}

        <section className="admin-section">
          <h2>Hotels</h2>

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hotel</th>
                  <th>City</th>
                  <th>Rating</th>
                  <th>Price / Night</th>
                </tr>
              </thead>

              <tbody>

                {hotels.map((hotel) => (
                  <tr key={hotel.id}>

                    <td>{hotel.id}</td>

                    <td>
                      {hotel.name}
                    </td>

                    <td>
                      {hotel.city}
                    </td>

                    <td>
                      ⭐ {hotel.rating}
                    </td>

                    <td>
                      ₹{hotel.price_per_night}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        </section>

        {/* Bookings */}

        <section className="admin-section">
          <h2>Recent Bookings</h2>

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Guest</th>
                  <th>Email</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>

                {bookings.map((booking) => (
                  <tr key={booking.id}>

                    <td>
                      #{booking.id}
                    </td>

                    <td>
                      {booking.guest_name}
                    </td>

                    <td>
                      {booking.email}
                    </td>

                    <td>
                      {booking.check_in}
                    </td>

                    <td>
                      {booking.check_out}
                    </td>

                    <td>
                      {booking.guests}
                    </td>

                    <td>
                      ₹{booking.total_price}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        </section>

      </div>
    </div>
  );
}

export default Admin;