export interface ArticleSection {
  h2?: string;
  paragraphs: string[];
}

export interface Article {
  id: number;
  title: string;
  description: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  blockquote: string;
  sections: ArticleSection[];
}

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Innovations in Telemedicine: Transforming Healthcare in Saudi',
    description: 'Telemedicine is revolutionising how patients interact with healthcare providers, offering remote consultations and cutting-edge digital tools.',
    image: '/assets/img/blog-img.webp',
    author: 'Dr. Ahmed Al-Rashidi',
    date: 'March 10, 2026',
    readTime: '5 min read',
    blockquote: 'Preventive medicine is gaining momentum in Saudi Arabia, with new initiatives transforming how citizens approach health and wellness across the Kingdom.',
    sections: [
      {
        h2: 'The Rise of Digital Health',
        paragraphs: [
          'In recent years, the Kingdom of Saudi Arabia has witnessed a remarkable transformation in healthcare delivery, driven by technological advancement and a national commitment to Vision 2030. Patients across the country now have access to high-quality medical consultations without leaving their homes.',
          'The Ministry of Health has launched numerous initiatives to improve access to quality healthcare across all regions, particularly in rural and underserved communities where traditional in-person services were difficult to reach.',
        ],
      },
      {
        h2: 'Technology Meets Healthcare',
        paragraphs: [
          'Digital health platforms are playing a pivotal role in reshaping patient experiences. Video consultations, AI-assisted triage, and remote monitoring devices allow physicians to assess and manage chronic conditions with unprecedented precision and efficiency.',
          'At Jedaani Hospitals, we have integrated AI-driven diagnostics and patient monitoring tools into our telemedicine platform, enabling our specialists to provide world-class care to patients regardless of their physical location.',
        ],
      },
      {
        h2: 'Looking Ahead',
        paragraphs: [
          'As Saudi Arabia continues to invest in its healthcare infrastructure, the potential for telemedicine to reduce costs, improve outcomes, and expand access is enormous. We are committed to staying at the forefront of this transformation, ensuring every patient receives the care they deserve.',
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Advances in Cardiac Care: New Treatment Options for Heart Patients',
    description: 'Recent breakthroughs in cardiac surgery and interventional cardiology are saving more lives with less invasive procedures.',
    image: '/assets/img/blog-img1.webp',
    author: 'Dr. Sara Al-Otaibi',
    date: 'February 28, 2026',
    readTime: '6 min read',
    blockquote: 'Cardiovascular disease remains the leading cause of mortality worldwide, yet advances in interventional cardiology are offering hope and longer lives to millions of patients every year.',
    sections: [
      {
        h2: 'Minimally Invasive Breakthroughs',
        paragraphs: [
          'Transcatheter procedures have revolutionized cardiac care, allowing surgeons to repair or replace heart valves through tiny incisions rather than open-heart surgery. Patients who were once considered too frail for surgery can now receive life-saving treatment.',
          'The recovery times for these procedures have decreased dramatically, with many patients returning home within two to three days and resuming normal activities within weeks rather than months.',
        ],
      },
      {
        h2: 'Advanced Diagnostics',
        paragraphs: [
          'High-resolution cardiac imaging, including 3D echocardiography and cardiac MRI, provides cardiologists with an unprecedented view of the heart\'s structure and function. This precision allows for earlier detection and more targeted interventions.',
          'At our Cardiac Centre of Excellence, these imaging technologies are combined with genetic screening to identify patients at risk decades before symptoms appear, enabling a truly preventive approach to heart disease.',
        ],
      },
      {
        h2: 'Patient-Centered Recovery',
        paragraphs: [
          'Post-procedure cardiac rehabilitation programs have been shown to reduce re-hospitalization rates by up to 30%. Our multidisciplinary teams work closely with each patient to design personalized recovery plans that address both physical and psychological wellbeing.',
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Mental Health Awareness: Breaking the Stigma in Modern Healthcare',
    description: 'Mental health awareness has grown significantly, leading to better support systems and compassionate care pathways for patients.',
    image: '/assets/img/blog-img2.webp',
    author: 'Dr. Layla Al-Hamdan',
    date: 'February 15, 2026',
    readTime: '4 min read',
    blockquote: 'Mental health is not a luxury — it is a fundamental pillar of overall wellbeing that deserves the same attention, resources, and compassion as any physical ailment.',
    sections: [
      {
        h2: 'Changing the Conversation',
        paragraphs: [
          'Across Saudi Arabia, cultural attitudes toward mental health are shifting. Younger generations are increasingly open about seeking professional help, and healthcare institutions are responding with expanded psychiatric and counselling services.',
          'Public campaigns, endorsed by the Ministry of Health and supported by leading hospitals, have helped normalize discussions around anxiety, depression, and burnout — conditions that affect millions of Saudis each year.',
        ],
      },
      {
        h2: 'Comprehensive Mental Health Services',
        paragraphs: [
          'Our psychiatric department offers a full spectrum of services, from crisis intervention and inpatient stabilization to outpatient therapy, group counselling, and telepsychiatry. We believe that accessible mental healthcare is a right, not a privilege.',
          'Evidence-based therapies, including cognitive behavioral therapy (CBT) and dialectical behavior therapy (DBT), are delivered by our certified clinical psychologists and psychiatrists in a safe, confidential environment.',
        ],
      },
      {
        h2: 'Supporting Families and Communities',
        paragraphs: [
          'Mental illness rarely affects only the individual. Our family support programs help loved ones understand conditions, communicate effectively, and participate constructively in the recovery journey, strengthening the entire support network around each patient.',
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Pediatric Care Excellence: What Every Parent Should Know',
    description: 'Our pediatric department now offers comprehensive services for children of all ages, from newborns to teenagers.',
    image: '/assets/img/blog-img.webp',
    author: 'Dr. Omar Al-Ghamdi',
    date: 'January 30, 2026',
    readTime: '5 min read',
    blockquote: 'Every child deserves the best possible start in life. Excellence in pediatric care means not only treating illness but nurturing development, building resilience, and partnering with families at every stage.',
    sections: [
      {
        h2: 'A Child-Centered Environment',
        paragraphs: [
          'Our pediatric wards are designed with children and families in mind. From colorful, calming interiors to child-life specialists who help young patients understand and cope with medical procedures, every detail is crafted to reduce anxiety and promote healing.',
          'Parents are encouraged to stay with their children throughout treatment. We recognize that parental presence is not just comforting — it is clinically beneficial, improving compliance, reducing stress hormones, and accelerating recovery.',
        ],
      },
      {
        h2: 'Neonatal Intensive Care',
        paragraphs: [
          'Our Level III Neonatal Intensive Care Unit (NICU) provides the highest level of care for premature and critically ill newborns. Our specialized neonatologists and nurses work around the clock with state-of-the-art equipment to give every baby the best chance at a healthy life.',
          'Family-integrated care models in our NICU actively involve parents in their baby\'s daily care, from kangaroo care to feeding support, helping build bonds and confidence even in the most challenging circumstances.',
        ],
      },
      {
        h2: 'Preventive and Developmental Health',
        paragraphs: [
          'Regular developmental screenings, vaccination programs, and nutritional counselling are the cornerstones of our preventive pediatrics approach. Catching developmental delays or health concerns early makes an enormous difference in long-term outcomes.',
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'Nutrition and Wellness: A Complete Guide to Healthy Living',
    description: 'Proper nutrition plays a fundamental role in disease prevention and overall wellness, guided by our expert dietitians.',
    image: '/assets/img/blog-img1.webp',
    author: 'Dietitian Fatima Al-Zahrani',
    date: 'January 12, 2026',
    readTime: '7 min read',
    blockquote: 'Food is medicine. Understanding the profound connection between what we eat and how we feel is the foundation of preventive healthcare and long-term vitality.',
    sections: [
      {
        h2: 'The Science of Nutrition',
        paragraphs: [
          'Modern nutritional science has moved far beyond counting calories. Research now shows that the quality of dietary fat, the type of carbohydrates consumed, and the diversity of gut microbiome all play crucial roles in disease risk, energy levels, and mental health.',
          'Our clinical dietitians use evidence-based frameworks to design individualized nutrition plans that account for each patient\'s medical history, lifestyle, cultural preferences, and metabolic profile.',
        ],
      },
      {
        h2: 'Managing Chronic Conditions Through Diet',
        paragraphs: [
          'For patients with diabetes, hypertension, or cardiovascular disease, dietary intervention can be as powerful as medication. Our specialized metabolic nutrition programs have helped hundreds of patients reduce or eliminate their dependence on chronic medications through sustained lifestyle change.',
          'Anti-inflammatory dietary patterns, rich in whole grains, legumes, healthy fats, and vegetables, have demonstrated remarkable efficacy in reducing inflammatory markers and improving quality of life across a wide range of conditions.',
        ],
      },
      {
        h2: 'Building Sustainable Habits',
        paragraphs: [
          'The most effective nutritional strategy is one that patients can maintain for life. Our wellness team focuses on gradual, achievable changes rather than dramatic overhauls, supporting patients with regular follow-ups, cooking workshops, and community support groups.',
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'Robotic Surgery: The Future of Minimally Invasive Procedures',
    description: 'Robotic-assisted surgery is revolutionizing complex procedures with greater precision, faster recovery, and reduced patient risk.',
    image: '/assets/img/blog-img2.webp',
    author: 'Dr. Khalid Al-Mansouri',
    date: 'December 20, 2025',
    readTime: '6 min read',
    blockquote: 'The surgeon\'s hands are extended by technology, but it is still human judgment, training, and compassion that determine the outcome. Robotic systems amplify skill — they do not replace it.',
    sections: [
      {
        h2: 'How Robotic Surgery Works',
        paragraphs: [
          'Robotic surgical systems translate the surgeon\'s hand movements into precise, scaled motions performed by robotic arms holding miniaturized instruments. A high-definition 3D camera provides a magnified view of the operative field, far exceeding what the naked eye can perceive.',
          'The da Vinci Surgical System and its successors have enabled complex procedures — from prostatectomy to cardiac valve repair — to be performed through incisions smaller than a centimeter, drastically reducing blood loss and infection risk.',
        ],
      },
      {
        h2: 'Benefits for Patients',
        paragraphs: [
          'Clinical studies consistently demonstrate that robotic-assisted procedures result in shorter hospital stays, reduced postoperative pain, lower complication rates, and faster return to daily activities compared to traditional open surgery.',
          'For oncology patients in particular, the precision of robotic dissection allows surgeons to remove tumors with clear margins while preserving surrounding healthy tissue and critical nerve structures — improving both survival rates and quality of life.',
        ],
      },
      {
        h2: 'Our Robotic Surgery Programme',
        paragraphs: [
          'Our robotic surgery programme is staffed by surgeons who have completed rigorous training and credentialing. We are committed to expanding robotic capabilities across urology, gynecology, colorectal, and thoracic surgery, bringing cutting-edge care to our patients.',
        ],
      },
    ],
  },
];
