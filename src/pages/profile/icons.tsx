// Icons components
export const CalendarIcon = () => (
  <img src="/assets/images/profile/Calendar_dashboard.png" alt="Calendar" style={{ width: '24px', height: '24px' }} />
);

export const DocumentIcon = () => (
  <img src="/assets/images/profile/Calendar_dashboard.png" alt="Document" style={{ width: '24px', height: '24px' }} />
);

export const PhoneIcon = ({ color = "#061F42" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.5 12.69V14.94C16.5008 15.1489 16.4581 15.3556 16.3745 15.547C16.2908 15.7384 16.168 15.9102 16.0141 16.0515C15.8601 16.1927 15.6784 16.3004 15.4806 16.3678C15.2828 16.4352 15.0731 16.4607 14.865 16.4425C12.5572 16.1893 10.3403 15.4007 8.3925 14.1375C6.58053 12.9856 5.04395 11.449 3.89254 9.637C2.625 7.68002 1.83618 5.45251 1.5875 3.135C1.56941 2.9275 1.59468 2.71855 1.66163 2.52138C1.72857 2.32421 1.83565 2.14299 1.97608 1.98918C2.11651 1.83537 2.28743 1.71244 2.47793 1.62834C2.66843 1.54424 2.87417 1.50082 3.0825 1.50075H5.3325C5.69655 1.49718 6.04942 1.62531 6.32567 1.86158C6.60192 2.09786 6.78263 2.42621 6.835 2.78625C6.93206 3.50575 7.10737 4.21236 7.3575 4.89375C7.45851 5.16286 7.47992 5.45503 7.41934 5.73591C7.35876 6.01679 7.21868 6.27431 7.0155 6.48L6.0615 7.434C7.12719 9.31002 8.68998 10.8728 10.566 11.9385L11.52 10.9845C11.7257 10.7813 11.9832 10.6413 12.2641 10.5807C12.545 10.5201 12.8372 10.5415 13.1063 10.6425C13.7876 10.8926 14.4942 11.0679 15.2137 11.165C15.5776 11.2178 15.9091 11.4017 16.1461 11.6822C16.383 11.9627 16.5091 12.3205 16.5 12.69Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MailIcon = ({ color = "#061F42" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H15C15.825 3 16.5 3.675 16.5 4.5V13.5C16.5 14.325 15.825 15 15 15H3C2.175 15 1.5 14.325 1.5 13.5V4.5C1.5 3.675 2.175 3 3 3Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 4.5L9 9.75L1.5 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IdCardIcon = ({ color = "#061F42" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="3" width="15" height="12" rx="2" stroke={color} strokeWidth="1.5"/>
    <circle cx="6" cy="8" r="2" stroke={color} strokeWidth="1.5"/>
    <path d="M4 12.5C4 11.5 4.8 10.5 6 10.5C7.2 10.5 8 11.5 8 12.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10.5 7H13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10.5 10H13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const BirthdayIcon = ({ color = "#061F42" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12.375V15.75C3 16.1642 3.33579 16.5 3.75 16.5H14.25C14.6642 16.5 15 16.1642 15 15.75V12.375" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.25 8.25H15.75V12.375H2.25V8.25Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 6V1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 1.5C9.41421 1.5 9.75 1.83579 9.75 2.25C9.75 2.66421 9.41421 3 9 3C8.58579 3 8.25 2.66421 8.25 2.25C8.25 1.83579 8.58579 1.5 9 1.5Z" fill={color}/>
    <path d="M5.25 8.25V6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12.75 8.25V6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const HomeIcon = ({ color = "#061F42" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.25 6.75L9 1.5L15.75 6.75V15C15.75 15.3978 15.592 15.7794 15.3107 16.0607C15.0294 16.342 14.6478 16.5 14.25 16.5H3.75C3.35218 16.5 2.97064 16.342 2.68934 16.0607C2.40804 15.7794 2.25 15.3978 2.25 15V6.75Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.75 16.5V9H11.25V16.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const EyeIcon = ({ color = "#A4A5A5" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const ChevronDownIcon = ({ color = "#D1D1D6" }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
