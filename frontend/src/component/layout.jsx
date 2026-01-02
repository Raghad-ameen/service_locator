import { Outlet } from 'react-router-dom';
import Navbar from '../layout/navbar';
import Footer from '../layout/footer';

export default function Layout({ user, setUser, activeModal, setActiveModal }) {
  return (
    <>
    {/*content layout */}
      <Navbar user={user} setUser={setUser} activeModal={activeModal} setActiveModal={setActiveModal} />
      <main className='pt-20'><Outlet /></main>
      <Footer />
    </>
  );
}
