

interface FooterLink {
  label: string;
  href: string;
}

const Footer = () => {
  const footerLinks: FooterLink[] = [
    { label: 'About us', href: '#' },
    { label: 'Branches', href: '#' },
    { label: 'Pharmacies', href: '#' },
    { label: 'Departments', href: '#' },
    { label: 'Doctors', href: '#' }
  ];

  return (
    <footer className="footer">
      <div className="container">
        <a href="#" className="log">
          <img 
            src="/assets/img/footer-logo.webp" 
            className="d-block mb-5" 
            width="284" 
            height="100" 
            alt="Logo" 
          />
        </a>
        <div className="footer-wrapper">
          {[1, 2, 3].map((column) => (
            <ul key={`column-${column}`} className="footer-menu">
              {footerLinks.map((link) => (
                <li key={`${column}-${link.label}`}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
