import { Outlet } from 'react-router-dom';
import Navbar from '../layout/navbar';
import Footer from '../layout/footer';
import { useAuth } from "../context/AuthContext";
import { FavoriteProvider } from '../context/favoriteContext';

export default function Layout({ activeModal, setActiveModal }) {
  const { user, logout } = useAuth();
  return (
    <>
    {/*content layout */}
      <FavoriteProvider>
        <Navbar user={user} logout={logout} activeModal={activeModal} setActiveModal={setActiveModal}/>
          <main className='pt-20'><Outlet /></main>
        <Footer />
      </FavoriteProvider>
    </>
  );
}
