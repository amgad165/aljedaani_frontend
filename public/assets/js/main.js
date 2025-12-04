var siteUrl;
var templateUrl;

jQuery(document).ready(function ($) {
    siteUrl = $('#siteUrl').val();
    templateUrl = $('#templateUrl').val();
});
jQuery(document).ready(function ($) {
    const doctorsSection = document.getElementById("doctors-section");
    const container = document.getElementById("doctors-list");
    const pagination = document.querySelector(".pagination");
    const profileSection = document.getElementById("profile-section");

    let doctors = [];
    let filteredDoctors = [];
    let currentPage = 1;
    const itemsPerPage = 8;

    const branchSelect = $("#branch");
    const specialitySelect = $("#speciality");
    const doctorSelect = $("#doctor");
    const searchBtn = document.querySelector(".form .icon");
    const sortBtn = document.querySelector(".sort-btn");
    let sortAsc = true;

    // 👉 Initialize Select2 with clear option
    branchSelect.select2({placeholder: "Select Branch", allowClear: true});
    specialitySelect.select2({placeholder: "Select Specialty", allowClear: true});
    doctorSelect.select2({placeholder: "Select Doctor", allowClear: true});

    // 👉 Show skeleton placeholders
    function showSkeleton() {
        container.innerHTML = "";
        for (let i = 0; i < itemsPerPage; i++) {
            container.insertAdjacentHTML("beforeend", `
                <div class="col-lg-3 col-md-6">
                    <div class="team-card mb-4">
                        <div class="skeleton skeleton-badge"></div>
                        <div class="skeleton skeleton-avatar mx-auto"></div>
                        <div class="skeleton skeleton-line skeleton-name"></div>
                        <div class="skeleton skeleton-line skeleton-speciality"></div>
                        <div class="skeleton skeleton-pill"></div>
                        <div class="skeleton skeleton-pill"></div>
                        <div class="skeleton skeleton-line skeleton-text"></div>
                        <div class="skeleton skeleton-line skeleton-text"></div>
                        <div class="skeleton skeleton-btn"></div>
                        <div class="skeleton skeleton-btn"></div>
                    </div>
                </div>
            `);
        }
    }


    // 👉 Render doctors on page
    function renderPage(page) {
        container.innerHTML = "";
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageDoctors = filteredDoctors.slice(start, end);

        if (pageDoctors.length === 0) {
            container.innerHTML = `<p class="text-center">No results found</p>`;
            pagination.innerHTML = "";
            return;
        }

        pageDoctors.forEach(doc => {
            container.insertAdjacentHTML("beforeend", `
                    <div class="col-lg-3 col-md-6">
                        <div class="team-card mb-4">
                            <div class="sec-badge badge-1 ${doc.statusClass}">${doc.status}</div>
                            <img src="${doc.image}" style="max-width: 116px;"
                                class="d-block mx-auto img-fluid" width="116" height="116" alt="${doc.name}" loading="lazy">
                            <div class="info">
                                <div class="dc-name">${doc.name}</div>
                                <div class="dc-speciality">${doc.speciality}</div>
                            </div>
                            <div class="detail">
                                <div class="button">
                                    <a href="#" class="sec-badge location">
                                        <img src="./assets/img/icons/location-icon.svg" width="16" height="16" loading="lazy" alt="Icon"> 
                                        ${doc.location}
                                    </a>
                                    <a href="#" class="sec-badge sign">${doc.department}</a>
                                </div>
                                <ul class="card-list">
                                    <li>${doc.experience}</li>
                                    <li>${doc.degree}</li>
                                </ul>
                            </div>
                            <div class="buttons1">
                                <a href="#" class="primary-button book-btn" 
                                   style="${doc.available ? '' : 'background-color: rgba(229,231,234,1);color:#9EA2AE;'}">
                                   Book now
                                </a>
                                <a style="background-color: #15C9FA;" href="#" class="primary-button learn-btn">Learn more</a>
                            </div>
                        </div>
                    </div>
                `);
        });

        // 👉 Attach events to buttons
        container.querySelectorAll(".book-btn, .learn-btn").forEach((btn, index) => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const doc = filteredDoctors[(currentPage - 1) * itemsPerPage + index];
                showProfile(doc);
            });
        });
    }

    // 👉 Pagination
    function renderPagination() {
        const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
        if (totalPages <= 1) {
            pagination.innerHTML = "";
            return;
        }

        let paginationHTML = `
                <li><a href="#" class="prev"><img src="./assets/img/icons/primary-angle.svg" width="6" height="12" alt="Prev"></a></li>
            `;

        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `<li><a href="#" class="page-link ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</a></li>`;
            }
        } else {
            paginationHTML += `<li><a href="#" class="page-link ${currentPage === 1 ? "active" : ""}" data-page="1">1</a></li>`;

            if (currentPage > 3) paginationHTML += `<li><span class="dots">...</span></li>`;

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                paginationHTML += `<li><a href="#" class="page-link ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</a></li>`;
            }

            if (currentPage < totalPages - 2) paginationHTML += `<li><span class="dots">...</span></li>`;

            paginationHTML += `<li><a href="#" class="page-link ${currentPage === totalPages ? "active" : ""}" data-page="${totalPages}">${totalPages}</a></li>`;
        }

        paginationHTML += `
                <li style="transform: rotate(180deg);"><a href="#" class="next"><img src="./assets/img/icons/primary-angle.svg" width="6" height="12" alt="Next"></a></li>
            `;

        pagination.innerHTML = paginationHTML;

        pagination.querySelectorAll(".page-link").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                currentPage = parseInt(link.dataset.page);
                renderPage(currentPage);
                renderPagination();
            });
        });

        pagination.querySelector(".prev").addEventListener("click", (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderPage(currentPage);
                renderPagination();
            }
        });

        pagination.querySelector(".next").addEventListener("click", (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderPage(currentPage);
                renderPagination();
            }
        });
    }

    // 👉 Apply filters
    function applyFilter() {
        const branch = branchSelect.val();
        const speciality = specialitySelect.val();
        const doctorName = doctorSelect.val();

        filteredDoctors = doctors.filter(doc => {
            return (
                (!branch || doc.location === branch) &&
                (!speciality || doc.speciality === speciality) &&
                (!doctorName || doc.name === doctorName)
            );
        });

        currentPage = 1;
        renderPage(currentPage);
        renderPagination();
    }

    // 👉 Sort by Name
    function sortByName() {
        filteredDoctors.sort((a, b) => {
            if (a.name < b.name) return sortAsc ? -1 : 1;
            if (a.name > b.name) return sortAsc ? 1 : -1;
            return 0;
        });

        currentPage = 1;
        renderPage(currentPage);
        renderPagination();

        sortAsc = !sortAsc;
        sortBtn.innerHTML = sortAsc
            ? `<img src="./assets/img/icons/sort-icon.svg" width="24" height="24" alt="Sort Icon" loading="lazy"> Sort By Name`
            : `<img src="./assets/img/icons/sort-icon2.svg" width="24" height="24" alt="Sort Icon" loading="lazy"> Sort By Name`;
    }

    // 👉 Show Profile
    function showProfile(doc) {
        doctorsSection.style.display = "none";
        profileSection.style.display = "block";

        profileSection.innerHTML = `
                    <div class="team-sec profile-sec pt-0">
                    <div class="profile-wrapper position-relative">
                        <div class="row gy-lg-0 gx-lg-2 g-5">
                            <div class="col-lg-3">
                                <div class="team-card">
                                    <img src="${doc.image}" style="border-radius: 12px;max-width: 280px;" class="d-block mx-auto img-fluid" width="280" height="362" alt="${doc.name}" loading="lazy">
                                    <div class="info">
                                        <div class="dc-name">${doc.name}</div>
                                        <div class="dc-speciality">${doc.speciality}</div>
                                    </div>
                                    <div style="background-color: #F8F8F8;border-radius: 12px;padding: 8px;" class="mb-3">
                                        <div class="detail">
                                            <div class="button">
                                                <a href="#" class="sec-badge location">
                                                    <img src="./assets/img/icons/location-icon.svg" width="16" height="16" loading="lazy" alt="Icon">${doc.location}
                                                </a>
                                                <a href="#" class="sec-badge sign">${doc.department}</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="buttons1">
                                        <a href="#" class="primary-button">Book now</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-9">
                                <div class="tabs">
                                    <div class="tab-buttons">
                                        <button class="tab-btn active" data-tab="tab1">Outpatient Services</button>
                                        <button class="tab-btn" data-tab="tab2">Inpatient Services</button>
                                    </div>
                                    <div class="tab-content">
                                        <div id="tab1" class="tab-pane active">
                                            <ul>
                                                <li>Acne treatment:</li>
                                            </ul>
                                            <p>We offer effective solutions to get rid of acne and its effects, using the
                                                latest topical treatments and advanced techniques.</p>
                                            <ul>
                                                <li>Eczema and Psoriasis Treatment:</li>
                                            </ul>
                                            <p>We rely on the latest topical and biological treatments to control eczema and
                                                psoriasis to improve patients' quality of life.</p>
                                            <ul>
                                                <li>Vitiligo Treatment:</li>
                                            </ul>
                                            <p>We have experience in treating vitiligo using the latest treatment
                                                technologies to achieve the best possible results.</p>
                                            <ul>
                                                <li>Hair Disease Treatment:</li>
                                            </ul>
                                            <p>Diagnosis and treatment of hair problems, dermatological and cosmetic, such
                                                as hair loss and alopecia, using the latest treatment methods, including
                                                mesotherapy, stem cells, and traditional treatment.</p>
                                            <ul>
                                                <li>Treatment of Warts and Skin Viruses:</li>
                                            </ul>
                                            <p>Removal of warts and skin tags and treatment of infectious skin viruses with
                                                the latest available methods.</p>
                                            <ul>
                                                <li>Treatment of Scars and Wound Marks:</li>
                                            </ul>
                                            <p>We offer effective solutions to improve the appearance of scars and wound
                                                marks and reduce them.</p>
                                            <ul>
                                                <li>Improving Skin Radiance:</li>
                                            </ul>
                                            <p>We help you get radiant and healthy skin, through skin lightening treatments,
                                                chemical peels, and other cosmetic procedures.</p>
                                            <ul>
                                                <li>Treatment of Sexually Transmitted Diseases:</li>
                                            </ul>
                                            <p>Diagnosis and treatment of sexually transmitted diseases confidentially and
                                                effectively.</p>
                                            <ul>
                                                <li>Examinations and Tests:</li>
                                            </ul>
                                            <p>Conducting the necessary examinations and tests to accurately diagnose skin
                                                and venereal diseases.</p>
                                            <ul>
                                                <li>Consultations and Advice:</li>
                                            </ul>
                                            <p>Providing consultations and guidance to patients on how to prevent skin and
                                                venereal diseases and maintain skin health.</p>
                                            <ul>
                                                <li>Treatment of Chronic Skin Diseases:</li>
                                            </ul>
                                            <p> Treatment of all types of eczema, psoriasis, and lichen planus, using the
                                                latest medical recommendations, including biological therapy.</p>
                                        </div>
                                        <div id="tab2" class="tab-pane">
                                            <ul>
                                                <li>Acne treatment 1:</li>
                                            </ul>
                                            <p>We offer effective solutions to get rid of acne and its effects, using the
                                                latest topical treatments and advanced techniques.</p>
                                            <ul>
                                                <li>Eczema and Psoriasis Treatment:</li>
                                            </ul>
                                            <p>We rely on the latest topical and biological treatments to control eczema and
                                                psoriasis to improve patients' quality of life.</p>
                                            <ul>
                                                <li>Vitiligo Treatment:</li>
                                            </ul>
                                            <p>We have experience in treating vitiligo using the latest treatment
                                                technologies to achieve the best possible results.</p>
                                            <ul>
                                                <li>Hair Disease Treatment:</li>
                                            </ul>
                                            <p>Diagnosis and treatment of hair problems, dermatological and cosmetic, such
                                                as hair loss and alopecia, using the latest treatment methods, including
                                                mesotherapy, stem cells, and traditional treatment.</p>
                                            <ul>
                                                <li>Treatment of Warts and Skin Viruses:</li>
                                            </ul>
                                            <p>Removal of warts and skin tags and treatment of infectious skin viruses with
                                                the latest available methods.</p>
                                            <ul>
                                                <li>Treatment of Scars and Wound Marks:</li>
                                            </ul>
                                            <p>We offer effective solutions to improve the appearance of scars and wound
                                                marks and reduce them.</p>
                                            <ul>
                                                <li>Improving Skin Radiance:</li>
                                            </ul>
                                            <p>We help you get radiant and healthy skin, through skin lightening treatments,
                                                chemical peels, and other cosmetic procedures.</p>
                                            <ul>
                                                <li>Treatment of Sexually Transmitted Diseases:</li>
                                            </ul>
                                            <p>Diagnosis and treatment of sexually transmitted diseases confidentially and
                                                effectively.</p>
                                            <ul>
                                                <li>Examinations and Tests:</li>
                                            </ul>
                                            <p>Conducting the necessary examinations and tests to accurately diagnose skin
                                                and venereal diseases.</p>
                                            <ul>
                                                <li>Consultations and Advice:</li>
                                            </ul>
                                            <p>Providing consultations and guidance to patients on how to prevent skin and
                                                venereal diseases and maintain skin health.</p>
                                            <ul>
                                                <li>Treatment of Chronic Skin Diseases:</li>
                                            </ul>
                                            <p> Treatment of all types of eczema, psoriasis, and lichen planus, using the
                                                latest medical recommendations, including biological therapy.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
            `;

        // Back button
        profileSection.querySelector(".back-btn").addEventListener("click", () => {
            profileSection.style.display = "none";
            doctorsSection.style.display = "block";
        });
    }

    // 👉 Load doctors
    function loadDoctors() {
        fetch(templateUrl + "/assets/data/doctors-list.json")
            .then(response => response.json())
            .then(data => {
                console.log(data)
                doctors = data;
                filteredDoctors = doctors;

                // Populate filters
                const branches = [...new Set(doctors.map(d => d.location))];
                const specialities = [...new Set(doctors.map(d => d.speciality))];
                const doctorNames = [...new Set(doctors.map(d => d.name))];

                branches.forEach(b => branchSelect.append(new Option(b, b)));
                specialities.forEach(s => specialitySelect.append(new Option(s, s)));
                doctorNames.forEach(n => doctorSelect.append(new Option(n, n)));

                renderPage(currentPage);
                renderPagination();
            })
            .catch(error => console.error("Error loading doctors:", error));
    }

    // 👉 Events
    branchSelect.on("change", applyFilter);
    specialitySelect.on("change", applyFilter);
    doctorSelect.on("change", applyFilter);
    searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        applyFilter();
    });
    sortBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sortByName();
    });

    // Run
    showSkeleton();
    setTimeout(loadDoctors, 2000);
});
$(document).ready(function () {
    const $hamburger = $('#hamburgerBtn');
    const $menuLinks = $('.menu-links');

    $hamburger.on('click', function () {
        // Hamburger icon aur menu ko toggle karta he
        $(this).toggleClass('open'); // hamburger icon toggle (X bnta he) aur active hota he
        $menuLinks.toggleClass('open'); // menu open/close toggle (display: none/flex)
    });
});
// counter sec
document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".number");

    const animateCounter = (counter) => {
        const target = +counter.getAttribute("data-target");
        let current = 0;
        const increment = target / 100; // speed adjust karne ke liye change karo

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target; // exact final value
            }
        };

        updateCounter();
    };

    // Intersection Observer to start animation when visible
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                obs.unobserve(entry.target); // ek hi baar chale
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        observer.observe(counter);
    });
});
// review slider
jQuery(document).ready(function ($) {

    $('.content-wrapper-1').slick({
        arrows: false,
        dots: false,
        infinite: false,
        infinite: true,
        speed: 1500,
        slidesToShow: 1,
        slidesToScroll: 1
    });

    $('.pagination li').click(function () {
        var index = $(this).index();
        $('.content-wrapper-1').slick('slickGoTo', index);
    });

    $('.content-wrapper-1').on('afterChange', function (event, slick, currentSlide) {
        $('.pagination li').removeClass('active')
            .eq(currentSlide).addClass('active');
    });


    $('.review-slider').slick({
        slidesToShow: 2,
        slidesToScroll: 1,
        arrows: true,
        dots: false,
        infinite: true,
        centerMode: false,
        variableWidth: true,
        responsive: [
            {
                breakpoint: 992, // tablet
                settings: {
                    slidesToShow: 1,
                    variableWidth: true
                }
            },
            {
                breakpoint: 576, // mobile
                settings: {
                    slidesToShow: 1,
                    autoplay: true,
                    autoplaySpeed: 3000,
                    variableWidth: false
                }
            }
        ]
    });

    $('.brand-slider').slick({
        slidesToShow: 2,
        slidesToScroll: 1,
        arrows: false,
        dots: false,
        infinite: true,
        speed: 3000,
        autoplay: true,
        autoplaySpeed: 0,
        cssEase: 'linear',
        pauseOnHover: true,
        variableWidth: true
    });

});
/* Team Profile Tab */
const buttons = document.querySelectorAll(".tab-btn");
const panes = document.querySelectorAll(".tab-pane");
buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        // remove active classes
        buttons.forEach(b => b.classList.remove("active"));
        panes.forEach(p => p.classList.remove("active"));

        // add active on clicked button + related pane
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");

        // save state to localStorage
        localStorage.setItem("activeTab", btn.dataset.tab);
    });
});
// on page refresh -> show saved active tab
// const activeTab = localStorage.getItem("activeTab") || "tab1";
// document.querySelector(`.tab-btn[data-tab="${activeTab}"]`).classList.add("active");
// document.getElementById(activeTab).classList.add("active");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
// ✅ page load hone par hamesha first tab active
// window.addEventListener("DOMContentLoaded", () => {
//   tabButtons.forEach(b => b.classList.remove("active"));
//   tabContents.forEach(c => c.classList.remove("active"));
//
//   tabButtons[0].classList.add("active");
//   tabContents[0].classList.add("active");
// });
// ✅ tab click hone par switch kare
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    $('#slider-1, #slider-2, #slider-3, #slider-4').slick('setPosition');
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});
jQuery(document).ready(function ($) {
    $('.team-slider').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      infinite: true,
      arrows: true,
      dots: false,
      speed: 400,
      responsive: [
        {
          breakpoint: 992, 
          settings: { slidesToShow: 2, arrows:false }
        },
        {
          breakpoint: 576,
          settings: { slidesToShow: 1, arrows:false,autoplay: true,autoplaySpeed: 2000 }
        }
      ]
    });
    $('#slider-1').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      infinite: true,
      arrows: true,
      dots: false,
      speed: 400,
      responsive: [
        {
          breakpoint: 992, 
          settings: { slidesToShow: 2, arrows:false }
        },
        {
          breakpoint: 576,
          settings: { slidesToShow: 1, arrows:false,autoplay: true,autoplaySpeed: 2000 }
        }
      ]
    });
    $('#slider-2').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      infinite: true,
      arrows: true,
      dots: false,
      speed: 400,
      responsive: [
        {
          breakpoint: 992, 
          settings: { slidesToShow: 2, arrows:false }
        },
        {
          breakpoint: 576,
          settings: { slidesToShow: 1, arrows:false,autoplay: true,autoplaySpeed: 2000 }
        }
      ]
    });
    $('#slider-3').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      infinite: true,
      arrows: true,
      dots: false,
      speed: 400,
      responsive: [
        {
          breakpoint: 992, 
          settings: { slidesToShow: 2, arrows:false }
        },
        {
          breakpoint: 576,
          settings: { slidesToShow: 1, arrows:false,autoplay: true,autoplaySpeed: 2000 }
        }
      ]
    });
    $('#slider-4').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      infinite: true,
      arrows: true,
      dots: false,
      speed: 400,
      responsive: [
        {
          breakpoint: 992, 
          settings: { slidesToShow: 2, arrows:false }
        },
        {
          breakpoint: 576,
          settings: { slidesToShow: 1, arrows:false,autoplay: true,autoplaySpeed: 2000 }
        }
      ]
    });
  
    $(window).on('load resize', function(){
      $('#slider-1, #slider-2, #slider-3, #slider-4').slick('setPosition');
    });
});
$(document).ready(function () {
    // Custom select dropdown removed - using Select2 instead
});


