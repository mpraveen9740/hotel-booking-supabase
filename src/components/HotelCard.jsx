import { useNavigate } from "react-router-dom";

function HotelCard({
  id,
  name,
  city,
  price,
  rating,
  image
}) {
  const navigate = useNavigate();

  return (
    <div className="hotel-card">

      <div className="hotel-image-container">
        <img
          src={image}
          alt={name}
          className="hotel-image"
        />

        <span className="rating-badge">
          ⭐ {rating}
        </span>
      </div>

      <div className="hotel-content">

        <h2>{name}</h2>

        <p className="hotel-location">
          📍 {city}
        </p>

        <div className="hotel-bottom">

          <div>
            <span className="price-label">
              Starting from
            </span>

            <h3>
              ₹{price}
              <span>/night</span>
            </h3>
          </div>

          <button
            onClick={() =>
              navigate(`/hotel/${id}`)
            }
          >
            View Hotel
          </button>

        </div>

      </div>

    </div>
  );
}

export default HotelCard;