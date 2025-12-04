

interface Gallery {
  id: number;
  title: string;
  image: string;
}

const GallerySection = () => {
  const galleries: Gallery[] = [
    { id: 1, title: 'Al Safa Hospital', image: '/assets/img/gallery-img.webp' },
    { id: 2, title: 'Al Safa Hospital', image: '/assets/img/gallery-img.webp' },
    { id: 3, title: 'Al Safa Hospital', image: '/assets/img/gallery-img.webp' }
  ];

  return (
    <section className="gallery-sec">
      <div className="container">
        <div className="content-wrapper">
          <h2 className="text-center mb-5 fw-exbold title">Gallery</h2>
          <div className="row g-3">
            {galleries.map((gallery) => (
              <div key={gallery.id} className="col-lg-4 col-sm-6">
                <div 
                  style={{ backgroundImage: `url('${gallery.image}')` }} 
                  className="main-wrapper"
                >
                  <div className="content-bar">
                    <span className="title">{gallery.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;