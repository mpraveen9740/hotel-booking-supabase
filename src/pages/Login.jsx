import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";


function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSignup, setIsSignup] = useState(false);

  const [loading, setLoading] = useState(false);


  async function handleSubmit(e) {

    e.preventDefault();

    setLoading(true);


    if (isSignup) {

      const {
        error
      } = await supabase.auth.signUp({

        email: email,

        password: password

      });


      if (error) {

        alert(error.message);

        setLoading(false);

        return;

      }


      alert(
        "Account created successfully!"
      );

      navigate("/");

    } else {

      const {
        error
      } = await supabase.auth.signInWithPassword({

        email: email,

        password: password

      });


      if (error) {

        alert(error.message);

        setLoading(false);

        return;

      }


      alert(
        "Login successful!"
      );

      navigate("/");

    }


    setLoading(false);

  }


  return (

    <div className="login-page">

      <div className="login-card">

        <h1>
          {isSignup
            ? "Create Account"
            : "Welcome Back"}
        </h1>


        <p>
          {isSignup
            ? "Create your StayEasy account"
            : "Login to your StayEasy account"}
        </p>


        <form
          onSubmit={handleSubmit}
        >

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


          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            minLength="6"
            required
          />


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Login"}

          </button>

        </form>


        <div className="login-switch">

          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}


          <button
            type="button"
            onClick={() =>
              setIsSignup(!isSignup)
            }
          >

            {isSignup
              ? " Login"
              : " Sign Up"}

          </button>

        </div>


      </div>

    </div>

  );
}


export default Login;