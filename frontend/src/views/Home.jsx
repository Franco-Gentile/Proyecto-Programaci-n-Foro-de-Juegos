import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';

const posts = [
  {
    id: 1,
    username: 'Charanguito_21',
    avatar: '🐐',
    timeAgo: 'Hace 2 hs',
    content: 'Por fin sale el GTA VI 😭',
    tag: 'GTA VI',
    imageUrl: '/absolute-cinema.jpg',
  },
  {
    id: 2,
    username: 'Charanguito_21',
    avatar: '🎮',
    timeAgo: 'Hace 2 hs',
    content: 'Por fin sale el GTA VI 😭',
    tag: 'GTA VI',
    imageUrl: null,
  },
  {
    id: 3,
    username: 'GamerPro99',
    avatar: '🎯',
    timeAgo: 'Hace 5 hs',
    content: '¿Alguien para jugar al CS2 Ranked? Soy Global 🔫',
    tag: 'CSGO',
    imageUrl: null,
  },
];

function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 forum-main-layout">
        <div className="container-fluid px-3 px-md-5">
          <div className="row justify-content-center g-4">
            {/* Columna Izquierda: Sidebar Mis juegos */}
            <div className="col-12 col-md-5 col-lg-3 col-xl-3">
              <Sidebar />
            </div>

            {/* Columna Central: Muro del Foro */}
            <div className="col-12 col-md-7 col-lg-7 col-xl-6">
              <div className="forum-feed-wrapper">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    username={post.username}
                    avatar={post.avatar}
                    timeAgo={post.timeAgo}
                    content={post.content}
                    tag={post.tag}
                    imageUrl={post.imageUrl}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
