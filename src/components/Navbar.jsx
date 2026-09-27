import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function getUser() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    setUser(user);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    setUser(null);
    navigate("/");
  }

  function goToHotels() {
    navigate("/");

    setTimeout(() => {
      const hotelsSection =
        document.getElementById("hotels");

      if (hotelsSection) {
        hotelsSection.scrollIntoView({
          behavior: "smooth"
        });
      }
    }, 100);
  }

  return (
    <nav className="navbar">
      <h2>🏨 StayEasy</h2>

      <div className="nav-links">

        <button
          className="nav-link-button"
          onClick={() => navigate("/")}
        >
          Home
        </button>

        <button
          className="nav-link-button"
          onClick={goToHotels}
        >
          Hotels
        </button>

        <button
          className="nav-link-button"
          onClick={() =>
            navigate("/my-bookings")
          }
        >
          Bookings
        </button>

        {user ? (
          <>
            <span className="user-email">
              👤 {user.email}
            </span>

            <button onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}

      </div>
    </nav>
  );
}

export default Navbar;