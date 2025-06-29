import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth(); // Now safely destructured
  
  return (
    <nav>
      {/* ... navbar content ... */}
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
}