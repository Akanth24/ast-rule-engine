import Link from "next/link";
import { useRouter } from "next/router"; // Import the router
import "../assets/css/Navbar.css";

function Navbar() {
  const router = useRouter(); // Access the router object to get the current path

  return (
    <>
      <div className="d-flex flex-column">
        <nav
          className="navbar navbar-expand-lg sticky-top p-1 wow fadeIn"
          data-wow-delay="0.1s"
        >
          <Link
            href={"/homePage"}
            className="navbar-brand text-light d-flex align-items-center px-4 px-lg-5"
          >
            <div className="nav-item text-light nav-link ">AST Rule Engine</div>
          </Link>
          <button
            type="button"
            className="navbar-toggler me-4"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="navbar-nav ms-auto me-2 p-2" style={{ gap: 10 }}>
              <Link
                href="/homePage"
                className={`nav-item nav-link btn ${
                  router.pathname === "/homePage"
                    ? "focus-ring focus-ring-light active"
                    : ""
                }`}
                style={{ fontSize: "19px" }}
              >
                Home
              </Link>

              <Link
                href="/createRule"
                className={`nav-item nav-link btn ${
                  router.pathname === "/createRule"
                    ? "focus-ring focus-ring-light active"
                    : ""
                }`}
                style={{ fontSize: "19px" }}
              >
                Create Rule
              </Link>

              <Link
                href="/combineRules"
                className={`nav-item nav-link btn ${
                  router.pathname === "/combineRules"
                    ? "focus-ring focus-ring-light active"
                    : ""
                }`}
                style={{ fontSize: "19px" }}
              >
                Combine Rules
              </Link>

              <Link
                href="/evaluateRule"
                className={`nav-item nav-link btn ${
                  router.pathname === "/evaluateRule"
                    ? "focus-ring focus-ring-light active"
                    : ""
                }`}
                style={{ fontSize: "19px" }}
              >
                Evaluate Rule
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

export default Navbar;
