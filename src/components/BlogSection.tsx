import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';

interface BlogPost {
  id: number;
  headline: string;
  image: string;
  featured?: boolean;
}

const BlogSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();
  
  const blogs: BlogPost[] = [
    { id: 1, headline: 'Headline', image: '/assets/img/blog-img.webp', featured: true },
    { id: 2, headline: 'Headline', image: '/assets/img/blog-img1.webp' },
    { id: 3, headline: 'Headline', image: '/assets/img/blog-img2.webp' }
  ];

  return (
    <section className="blog-sec">
      <div className="container">
        <h2 
          ref={titleRef}
          className="text-center mb-5 fw-bold"
          style={getAnimationStyle(titleVisible, 0)}
        >
          Latest News
        </h2>
        <div 
          ref={contentRef}
          className="row g-3 mb-3 m-mb-0"
        >
          {/* Featured Large Post */}
          <div className="col-lg-6" style={getAnimationStyle(contentVisible, 0)}>
            <div 
              style={{ backgroundImage: `url('${blogs[0].image}')` }} 
              className="image-wrapper"
            >
              <div className="blog-card">
                <a href="#">{blogs[0].headline}</a>
              </div>
            </div>
          </div>

          {/* Right Side Smaller Posts */}
          <div className="col-lg-6" style={getAnimationStyle(contentVisible, 0.1)}>
            {blogs.slice(1).map((blog, index) => (
              <div 
                key={blog.id}
                style={{ backgroundImage: `url('${blog.image}')` }}
                className={`image-wrapper image-wrapper-1 ${index === 0 ? 'mb-3 m-mb-2' : ''}`}
              >
                <div className="blog-card">
                  <a href="#">{blog.headline}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
        <a 
          style={{ textDecoration: 'underline' }} 
          className="fw-semibold fs-5 text-end d-block" 
          href="#"
        >
          More news
        </a>
      </div>
    </section>
  );
};

export default BlogSection;
