import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import ThemeStyles from './components/ThemeStyles';
import { injectGlobalStyles } from './utils/globalStyles';
import HomePage from './components/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DepartmentsPage from './pages/DepartmentsPage';
import DepartmentDetailsPage from './pages/DepartmentDetailsPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailsPage from './pages/DoctorDetailsPage';
import BranchesPage from './pages/BranchesPage';
import ContactPage from './pages/ContactPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import ProfilePage from './pages/ProfilePage';
import AboutUsPage from './pages/AboutUsPage';
import TestimonialDetailPage from './pages/TestimonialDetailPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailsPage from './pages/ArticleDetailsPage';
// Admin Pages
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminBranches from './components/admin/AdminBranches';
import AdminDepartments from './components/admin/AdminDepartments';
import AdminDoctors from './components/admin/AdminDoctors';
import AdminTestimonials from './components/admin/AdminTestimonials';
import AdminExcellenceCenters from './components/admin/AdminExcellenceCenters';
import AdminOffers from './components/admin/AdminOffers';
import AdminHeroSliders from './components/admin/AdminHeroSliders';
import AdminDepartmentTabs from './components/admin/AdminDepartmentTabs';
import AdminOtpLogs from './components/admin/AdminOtpLogs';
import AdminPatients from './components/admin/AdminPatients';
import AdminAppointments from './components/admin/AdminAppointments';
import AdminHisPatients from './components/admin/AdminHisPatients';
import AdminHisAppointments from './components/admin/AdminHisAppointments';
import AdminHisRadiology from './components/admin/AdminHisRadiology';
import AdminHisLab from './components/admin/AdminHisLab';
import AdminHisLabCustResults from './components/admin/AdminHisLabCustResults';
import AdminHisLabResultCommons from './components/admin/AdminHisLabResultCommons';
import AdminHisLabPending from './components/admin/AdminHisLabPending';
import AdminHisMedical from './components/admin/AdminHisMedical';
import AdminHisConsultations from './components/admin/AdminHisConsultations';
import AdminHisShifts from './components/admin/AdminHisShifts';
import AdminHisShiftDefines from './components/admin/AdminHisShiftDefines';
import AdminHisShiftDefineDetails from './components/admin/AdminHisShiftDefineDetails';
import AdminHisShiftDefineDetailDeletedRecords from './components/admin/AdminHisShiftDefineDetailDeletedRecords';
import DoctorAvailability from './components/admin/DoctorAvailability';
import PatientDetails from './components/admin/PatientDetails';
import AdminContactSubmissions from './components/admin/AdminContactSubmissions';
import AdminArticles from './components/admin/AdminArticles';
import ProtectedRoute from './components/admin/ProtectedRoute';
import './App.css';

const SUPPORTED_LANGS = ['en', 'ar'] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

interface SeoEntry {
  title: string;
  description: string;
  ogDescription?: string;
  twitterDescription?: string;
}

const ROUTE_SEO: Record<SupportedLang, Record<string, SeoEntry>> = {
  en: {
    '/': {
      title: 'Aljedaani Hospitals',
      description: 'Aljedaani Group of Hospitals - Al Safa Hospital & Ghulail Hospital offering comprehensive medical services, specialist doctors, and exceptional patient care.',
      ogDescription: 'Aljedaani Group of Hospitals offers comprehensive medical services.',
      twitterDescription: 'Aljedaani Group of Hospitals - Al Safa Hospital & Ghulail Hospital.',
    },
    '/doctors': {
      title: 'Doctors | Aljedaani Hospitals',
      description: 'Browse Aljedaani Hospitals doctors and specialists across departments and branches.',
    },
    '/doctors/:id': {
      title: 'Doctor Profile | Aljedaani Hospitals',
      description: 'View doctor profile, specialization, and appointment options at Aljedaani Hospitals.',
    },
    '/departments': {
      title: 'Departments | Aljedaani Hospitals',
      description: 'Explore medical departments and specialties available at Aljedaani Hospitals.',
    },
    '/departments/:id': {
      title: 'Department Details | Aljedaani Hospitals',
      description: 'View department details, available services, and doctors at Aljedaani Hospitals.',
    },
    '/branches': {
      title: 'Branches | Aljedaani Hospitals',
      description: 'Find Aljedaani Hospitals branches, contact details, and available services.',
    },
    '/book-appointment': {
      title: 'Book Appointment | Aljedaani Hospitals',
      description: 'Book your appointment online with Aljedaani Hospitals specialists and departments.',
    },
    '/about': {
      title: 'About Us | Aljedaani Hospitals',
      description: 'Learn about Aljedaani Hospitals mission, values, and healthcare excellence.',
    },
    '/contact': {
      title: 'Contact Us | Aljedaani Hospitals',
      description: 'Contact Aljedaani Hospitals for inquiries, locations, and support.',
    },
    '/articles': {
      title: 'Health Articles | Aljedaani Hospitals',
      description: 'Read health articles and medical insights from Aljedaani Hospitals.',
    },
    '/articles/:id': {
      title: 'Article | Aljedaani Hospitals',
      description: 'Read a health article from Aljedaani Hospitals.',
    },
    default: {
      title: 'Aljedaani Hospitals',
      description: 'Aljedaani Group of Hospitals - trusted healthcare services in Jeddah.',
    },
  },
  ar: {
    '/': {
      title: 'مستشفيات الجدعاني',
      description: 'نرعاكم بخبرة تمتد لأكثر من 30 عام مع نخبة من الاستشاريين والخبراء في جميع التخصصات الطبية مع استخدام أحدث التقنيات.',
      ogDescription: 'نرعاكم بخبرة تمتد لأكثر من 30 عام مع نخبة من الاستشاريين والخبراء. مستشفيات الجدعاني - الصفا وغليل.',
      twitterDescription: 'مستشفيات الجدعاني.',
    },
    '/doctors': {
      title: 'الأطباء | مستشفيات الجدعاني',
      description: 'تصفح قائمة الأطباء والاستشاريين في مستشفيات الجدعاني حسب التخصص والفرع.',
    },
    '/doctors/:id': {
      title: 'ملف الطبيب | مستشفيات الجدعاني',
      description: 'عرض ملف الطبيب والتخصص وخيارات حجز الموعد في مستشفيات الجدعاني.',
    },
    '/departments': {
      title: 'الأقسام الطبية | مستشفيات الجدعاني',
      description: 'استكشف الأقسام الطبية والتخصصات المتوفرة في مستشفيات الجدعاني.',
    },
    '/departments/:id': {
      title: 'تفاصيل القسم | مستشفيات الجدعاني',
      description: 'عرض تفاصيل القسم والخدمات والأطباء في مستشفيات الجدعاني.',
    },
    '/branches': {
      title: 'الفروع | مستشفيات الجدعاني',
      description: 'تعرف على فروع مستشفيات الجدعاني ومعلومات التواصل والخدمات المتوفرة.',
    },
    '/book-appointment': {
      title: 'حجز موعد | مستشفيات الجدعاني',
      description: 'احجز موعدك أونلاين مع أطباء وتخصصات مستشفيات الجدعاني.',
    },
    '/about': {
      title: 'من نحن | مستشفيات الجدعاني',
      description: 'تعرف على رسالة وقيم مستشفيات الجدعاني وتميزنا في الرعاية الصحية.',
    },
    '/contact': {
      title: 'تواصل معنا | مستشفيات الجدعاني',
      description: 'تواصل مع مستشفيات الجدعاني للاستفسارات ومعلومات الفروع والدعم.',
    },
    '/articles': {
      title: 'المقالات الصحية | مستشفيات الجدعاني',
      description: 'اقرأ مقالات صحية ومحتوى توعوي طبي من مستشفيات الجدعاني.',
    },
    '/articles/:id': {
      title: 'مقال صحي | مستشفيات الجدعاني',
      description: 'اقرأ مقالاً صحياً من مستشفيات الجدعاني.',
    },
    default: {
      title: 'مستشفيات الجدعاني',
      description: 'مستشفيات الجدعاني - رعاية صحية موثوقة في جدة.',
    },
  },
};

const getPathWithoutLang = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && SUPPORTED_LANGS.includes(segments[0] as 'en' | 'ar')) {
    const nextPath = `/${segments.slice(1).join('/')}`;
    return nextPath === '/' ? '/' : nextPath;
  }

  return pathname || '/';
};

const withLangPrefix = (pathname: string, lang: string): string => {
  const normalizedPath = getPathWithoutLang(pathname);
  return normalizedPath === '/' ? `/${lang}` : `/${lang}${normalizedPath}`;
};

const isAdminPath = (pathname: string): boolean => pathname === '/admin' || pathname.startsWith('/admin/');

const buildRoutePath = (prefix: string, routePath: string): string => {
  if (routePath === '/') {
    return prefix || '/';
  }

  return `${prefix}${routePath}`;
};

const getSeoRouteKey = (pathname: string): string => {
  if (pathname.startsWith('/doctors/')) return '/doctors/:id';
  if (pathname.startsWith('/departments/')) return '/departments/:id';
  if (pathname.startsWith('/articles/')) return '/articles/:id';
  return pathname;
};

const setMetaContent = (selector: string, value: string): void => {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute('content', value);
  }
};

const setLinkHref = (selector: string, value: string): void => {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute('href', value);
  }
};

function AppRouter() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const langFromPath = location.pathname.split('/').filter(Boolean)[0];

  useEffect(() => {
    if (SUPPORTED_LANGS.includes(langFromPath as 'en' | 'ar') && i18n.language !== langFromPath) {
      i18n.changeLanguage(langFromPath);
    }
  }, [i18n, i18n.language, langFromPath]);

  useEffect(() => {
    if (isAdminPath(location.pathname)) {
      return;
    }

    const hasLangPrefix = SUPPORTED_LANGS.includes(langFromPath as 'en' | 'ar');
    if (!hasLangPrefix) {
      const targetLang = i18n.language === 'ar' ? 'ar' : 'en';
      const localizedPath = withLangPrefix(location.pathname, targetLang);
      navigate(`${localizedPath}${location.search}${location.hash}`, { replace: true });
    }
  }, [i18n.language, langFromPath, location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (isAdminPath(location.pathname)) {
      return;
    }

    const lang: SupportedLang = i18n.language === 'ar' ? 'ar' : 'en';
    const barePath = getPathWithoutLang(location.pathname) || '/';
    const routeKey = getSeoRouteKey(barePath);
    const seoByLang = ROUTE_SEO[lang];
    const seo = seoByLang[routeKey] || seoByLang.default;
    const origin = window.location.origin;
    const localizedPath = withLangPrefix(barePath, lang);
    const canonicalUrl = `${origin}${localizedPath}`;
    const englishUrl = `${origin}${withLangPrefix(barePath, 'en')}`;
    const arabicUrl = `${origin}${withLangPrefix(barePath, 'ar')}`;
    const defaultUrl = `${origin}${barePath}`;

    document.title = seo.title;

    const titleElement = document.getElementById('meta-title');
    if (titleElement) {
      titleElement.textContent = seo.title;
    }

    setMetaContent('meta[name="title"]', seo.title);
    setMetaContent('meta[name="description"]', seo.description);
    setMetaContent('meta[property="og:title"]', seo.title);
    setMetaContent('meta[property="og:description"]', seo.ogDescription || seo.description);
    setMetaContent('meta[name="twitter:title"]', seo.title);
    setMetaContent('meta[name="twitter:description"]', seo.twitterDescription || seo.description);
    setMetaContent('meta[property="og:url"]', canonicalUrl);
    setMetaContent('meta[name="twitter:url"]', canonicalUrl);
    setMetaContent('meta[property="og:locale"]', lang === 'ar' ? 'ar_SA' : 'en_US');
    setMetaContent('meta[property="og:locale:alternate"]', lang === 'ar' ? 'en_US' : 'ar_SA');

    setLinkHref('link[rel="canonical"]', canonicalUrl);
    setLinkHref('link[rel="alternate"][hreflang="en"]', englishUrl);
    setLinkHref('link[rel="alternate"][hreflang="ar"]', arabicUrl);
    setLinkHref('link[rel="alternate"][hreflang="x-default"]', defaultUrl);
  }, [i18n.language, location.pathname]);

  const publicRoutes = [
    { path: '/', element: <HomePage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignUpPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/book-appointment', element: <BookAppointmentPage /> },
    { path: '/profile', element: <ProfilePage /> },
    { path: '/departments', element: <DepartmentsPage /> },
    { path: '/departments/:id', element: <DepartmentDetailsPage /> },
    { path: '/doctors', element: <DoctorsPage /> },
    { path: '/doctors/:id', element: <DoctorDetailsPage /> },
    { path: '/testimonials/:id', element: <TestimonialDetailPage /> },
    { path: '/branches', element: <BranchesPage /> },
    { path: '/contact', element: <ContactPage /> },
    { path: '/about', element: <AboutUsPage /> },
    { path: '/articles', element: <ArticlesPage /> },
    { path: '/articles/:id', element: <ArticleDetailsPage /> },
  ];

  return (
    <>
      <ThemeStyles />
      <Routes>
        {['', '/en', '/ar'].flatMap((prefix) =>
          publicRoutes.map((route) => (
            <Route key={`${prefix}-${route.path}`} path={buildRoutePath(prefix, route.path)} element={route.element} />
          )),
        )}
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/branches" element={
          <ProtectedRoute>
            <AdminBranches />
          </ProtectedRoute>
        } />
        <Route path="/admin/departments" element={
          <ProtectedRoute>
            <AdminDepartments />
          </ProtectedRoute>
        } />
        <Route path="/admin/departments/:departmentId/tabs" element={
          <ProtectedRoute>
            <AdminDepartmentTabs />
          </ProtectedRoute>
        } />
        <Route path="/admin/doctors" element={
          <ProtectedRoute>
            <AdminDoctors />
          </ProtectedRoute>
        } />
        <Route path="/admin/testimonials" element={
          <ProtectedRoute>
            <AdminTestimonials />
          </ProtectedRoute>
        } />
        <Route path="/admin/excellence-centers" element={
          <ProtectedRoute>
            <AdminExcellenceCenters />
          </ProtectedRoute>
        } />
        <Route path="/admin/offers" element={
          <ProtectedRoute>
            <AdminOffers />
          </ProtectedRoute>
        } />
        <Route path="/admin/hero-sliders" element={
          <ProtectedRoute>
            <AdminHeroSliders />
          </ProtectedRoute>
        } />
        <Route path="/admin/articles" element={
          <ProtectedRoute>
            <AdminArticles />
          </ProtectedRoute>
        } />
        <Route path="/admin/otp-logs" element={
          <ProtectedRoute>
            <AdminOtpLogs />
          </ProtectedRoute>
        } />
        <Route path="/admin/patients" element={
          <ProtectedRoute>
            <AdminPatients />
          </ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute>
            <AdminAppointments />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-patients" element={
          <ProtectedRoute>
            <AdminHisPatients />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-appointments" element={
          <ProtectedRoute>
            <AdminHisAppointments />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-radiology" element={
          <ProtectedRoute>
            <AdminHisRadiology />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-lab" element={
          <ProtectedRoute>
            <AdminHisLab />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-lab-cust-results" element={
          <ProtectedRoute>
            <AdminHisLabCustResults />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-lab-result-commons" element={
          <ProtectedRoute>
            <AdminHisLabResultCommons />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-lab-pending" element={
          <ProtectedRoute>
            <AdminHisLabPending />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-medical" element={
          <ProtectedRoute>
            <AdminHisMedical />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-consultations" element={
          <ProtectedRoute>
            <AdminHisConsultations />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-shifts" element={
          <ProtectedRoute>
            <AdminHisShifts />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-shift-defines" element={
          <ProtectedRoute>
            <AdminHisShiftDefines />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-shift-define-details" element={
          <ProtectedRoute>
            <AdminHisShiftDefineDetails />
          </ProtectedRoute>
        } />
        <Route path="/admin/his-shift-define-detail-deleted-records" element={
          <ProtectedRoute>
            <AdminHisShiftDefineDetailDeletedRecords />
          </ProtectedRoute>
        } />
        <Route path="/admin/contact-submissions" element={
          <ProtectedRoute>
            <AdminContactSubmissions />
          </ProtectedRoute>
        } />
        <Route path="/admin/doctor-availability" element={
          <ProtectedRoute>
            <DoctorAvailability />
          </ProtectedRoute>
        } />
        <Route path="/admin/patients/:id" element={
          <ProtectedRoute>
            <PatientDetails />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    injectGlobalStyles();
  }, []);

  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    // Update direction for RTL languages
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <AuthProvider>
      <Router>
        <AppRouter />
      </Router>
    </AuthProvider>
  );
}

export default App;
