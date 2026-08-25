import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import PostCard from '../components/PostCard'

const posts = [
  {
    id: 1,
    username: 'Charanguito_21',
    timeAgo: 'Hace 2 hs',
    content: 'Por fin sale el GTA VI',
    tag: 'GTA VI',
    imageUrl: 'https://placehold.co/600x300/9b59b6/ffffff?text=ABSOLUTE+CINEMA',
  },
  {
    id: 2,
    username: 'Charanguito_21',
    timeAgo: 'Hace 2 hs',
    content: 'Por fin sale el GTA VI',
    tag: 'GTA VI',
    imageUrl: null,
  },
  {
    id: 3,
    username: 'GamerPro99',
    timeAgo: 'Hace 5 hs',
    content: 'Alguien para jugar al CS2Ranked? Soy Global',
    tag: 'CSGO',
    imageUrl: null,
  },
]

function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1">
        <div className="container-fluid px-3 px-md-4 py-4">
          <div className="row g-4">
            <div className="col-lg-3 d-none d-lg-block">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-12">
              <div className="hero-section text-center mb-4 py-4">
                <h1 className="hero-title">Games</h1>
                <p className="hero-subtitle">Tu foro de juegos favorito</p>
                <a href="/register" className="btn btn-cta btn-lg mt-2">
                  Unete ahora
                </a>
              </div>

              <div className="posts-section">
                <h4 className="section-title mb-3">Publicaciones recientes</h4>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    username={post.username}
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
  )
}

export default Home
