const SPACE_ID = "7lako8sg3fm1";
const ACCESS_TOKEN = "rJTt5UZc9XzJ63xCvk3mr5Scp32HkudTPWX_ChogDkg";

const client = contentful.createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN,
});

console.log("Contentful client initialized:", client);



// === Helper Functions ===
function updateTextContent(selector, text) {
  const element = document.querySelector(selector);
  if (element && text) {
    element.textContent = text;
  } else if (element) {
    element.textContent = ''; 
  }
}

function updateImage(selector, imageField) {
  const element = document.querySelector(selector);
  if (element && imageField?.fields?.file?.url) {
    element.src = 'https:' + imageField.fields.file.url; 
    element.alt = imageField.fields.description || imageField.fields.title || ''; 
  } else if (element) {
    element.style.display = 'none';
  }
}

function updateLink(selector, url) {
    const element = document.querySelector(selector);
    if (element && url) {
        element.href = url;
    } else if (element) {
         element.style.display = 'none'; 
    }
}

function updateRichText(selector, richTextField) {
    const element = document.querySelector(selector);
    if (element && richTextField?.content) {
         element.innerHTML = contentfulRichTextRenderer.documentToHtmlString(richTextField);
    } else if (element) {
         element.innerHTML = '';
    }
}


// === Fetch and Render Content ===
async function loadHomepageContent() {
  try {
    // 'include' fetches linked entries (features, testimonials, etc.) up to 10 levels deep.
    const response = await client.getEntries({
      content_type: 'homePage',
      include: 10, // Adjust depth if needed, max 10
      limit: 1     // We only expect one entry
    });

    if (!response.items || response.items.length === 0) {
      console.error("No 'Home Page Configuration' entry found.");
      return;
    }

    const pageConfig = response.items[0].fields;
    console.log("Fetched Page Config:", pageConfig); // For debugging

    // --- Update Static Content ---
    if (pageConfig.pageTitle) document.title = pageConfig.pageTitle; 

    updateTextContent('#home h1', pageConfig.heroHeadline);
    updateTextContent('#home p.mx-auto', pageConfig.heroDescription);
    updateImage('#home img[alt="hero"]', pageConfig.heroImage);
    updateLink('#home a:has(svg[clip-path*="clip0_2005_10818"])', pageConfig.heroGithubButtonLink);
    updateLink('#home a:not(:has(svg))', pageConfig.heroDownloadButtonLink);

    updateTextContent('#about h2', pageConfig.aboutSectionHeadline);
    updateTextContent('#about div > p.mb-10', pageConfig.aboutSectionDescription); 
    updateImage('#about img[alt="about image"]:nth-of-type(1)', pageConfig.aboutImage1);
    updateImage('#about img[alt="about image"]:nth-of-type(2)', pageConfig.aboutImage2);
    updateTextContent('#about span.text-5xl', pageConfig.aboutExperienceYears);

    updateTextContent('#pricing + section h2 span:first-of-type', pageConfig.ctaHeadlinePart1); 
    updateTextContent('#pricing + section h2 span:last-of-type', pageConfig.ctaHeadlinePart2);
    updateTextContent('#pricing + section p', pageConfig.ctaDescription);
    updateLink('#pricing + section a', pageConfig.ctaButtonLink);

    // --- Render Repeatable Content ---
    renderFeatures(pageConfig.features);
    renderPricingPlans(pageConfig.pricingPlans);
    renderTestimonials(pageConfig.testimonials); 
    renderFaqs(pageConfig.faqs);
    renderTeamMembers(pageConfig.teamMembers);
    renderBlogPosts(pageConfig.recentBlogPosts);
    renderBrands(pageConfig.brands);

  } catch (error) {
    console.error("Error fetching content from Contentful:", error);
  }
}




function renderFeatures(features) {
  const container = document.querySelector('#features-container'); // We need to add this ID in HTML
  if (!container || !features || features.length === 0) {
    console.warn('Features container not found or no features to render.');
    if(container) container.innerHTML = '<p>No features available right now.</p>'; // Provide feedback
    return;
  }

  container.innerHTML = ''; // Clear existing static content

  features.forEach(feature => {
    const fields = feature.fields;
    const featureHTML = `
      <div class="w-full px-4 md:w-1/2 lg:w-1/4">
        <div class="wow fadeInUp group mb-12" data-wow-delay=".1s">
          <div class="relative z-10 mb-10 flex h-[70px] w-[70px] items-center justify-center rounded-[14px] bg-primary">
            <span class="absolute left-0 top-0 -z-[1] mb-8 flex h-[70px] w-[70px] rotate-[25deg] items-center justify-center rounded-[14px] bg-primary bg-opacity-20 duration-300 group-hover:rotate-45"></span>
            ${fields.iconSvg ? `
            <div class="icon-svg w-8 h-8 text-white" aria-hidden="true">
              ${fields.iconSvg}
            </div>` : ''}
            
          </div>
          <h4 class="mb-3 text-xl font-bold text-dark dark:text-white">
            ${fields.title || 'Feature Title'}
          </h4>
          <p class="mb-8 text-body-color dark:text-dark-6 lg:mb-9">
            ${fields.description || ''}
          </p>
          ${fields.learnMoreLink ? `
          <a href="${fields.learnMoreLink}" class="text-base font-medium text-dark hover:text-primary dark:text-white dark:hover:text-primary">
            Learn More
          </a>` : ''}
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', featureHTML);
  });
  // Re-initialize WOW.js if needed after adding dynamic content
   new WOW().init();
}

function renderPricingPlans(plans) {
   const container = document.querySelector('#pricing-plans-container'); // Add this ID in HTML
   if (!container || !plans || plans.length === 0) return;
   container.innerHTML = '';
   plans.forEach(plan => {
       const fields = plan.fields;
       const featuresHTML = fields.featuresList?.map(feature => `<p class="text-base text-body-color dark:text-dark-6">${feature}</p>`).join('') || '';
       const planHTML = `
        <div class="w-full px-4 md:w-1/2 lg:w-1/3">
          <div class="relative z-10 mb-10 overflow-hidden rounded-xl bg-white px-8 py-10 shadow-pricing dark:bg-dark-2 sm:p-12 lg:px-6 lg:py-10 xl:p-14">
            ${fields.isRecommended ? `<p class="absolute right-[-50px] top-[60px] inline-block -rotate-90 rounded-bl-md rounded-tl-md bg-primary px-5 py-2 text-base font-medium text-white">Recommended</p>` : ''}
            <span class="mb-5 block text-xl font-medium text-dark dark:text-white">
              ${fields.planName || ''}
            </span>
            <h2 class="mb-11 text-4xl font-semibold text-dark dark:text-white xl:text-[42px] xl:leading-[1.21]">
              <span class="text-xl font-medium">$</span>
              <span class="-ml-1 -tracking-[2px]">${fields.price?.toFixed(2) || '0.00'}</span>
              <span class="text-base font-normal text-body-color dark:text-dark-6">
                ${fields.period || ''}
              </span>
            </h2>
            <div class="mb-[50px]">
              <h5 class="mb-5 text-lg font-medium text-dark dark:text-white">
                Features
              </h5>
              <div class="flex flex-col gap-[14px]">
                ${featuresHTML}
              </div>
            </div>
            <a href="${fields.buttonLink || '#'}" class="inline-block rounded-md bg-primary px-7 py-3 text-center text-base font-medium text-white transition hover:bg-blue-dark">
              ${fields.buttonText || 'Get Started'}
            </a>
          </div>
        </div>
       `;
       container.insertAdjacentHTML('beforeend', planHTML);
   });
}

 function renderTestimonials(testimonials) {
    const container = document.querySelector('#testimonial-swiper-wrapper'); // Target Swiper wrapper
    if (!container || !testimonials || testimonials.length === 0) return;
    container.innerHTML = ''; // Clear static slides

    testimonials.forEach(testimonial => {
        const fields = testimonial.fields;
        // Generate star rating HTML
        let starsHTML = '';
        for (let i = 0; i < 5; i++) {
            if (i < (fields.rating || 0)) {
                starsHTML += '<img src="./assets/images/testimonials/icon-star.svg" alt="star icon"/>';
            } else {
                
            }
        }

        const testimonialHTML = `
         <div class="swiper-slide">
            <div class="rounded-xl bg-white px-4 py-[30px] shadow-testimonial dark:bg-dark sm:px-[30px]">
              <div class="mb-[18px] flex items-center gap-[2px]">
                ${starsHTML}
              </div>
              <p class="mb-6 text-base text-body-color dark:text-dark-6">
                “${fields.quote || ''}”
              </p>
              <a href="#" class="flex items-center gap-4">
                <div class="h-[50px] w-[50px] overflow-hidden rounded-full">
                  ${fields.authorImage?.fields?.file?.url ? `
                  <img
                    src="https:${fields.authorImage.fields.file.url}"
                    alt="${fields.authorImage.fields.description || fields.authorName}"
                    class="h-full w-full object-cover"
                  />` : '<div class="h-full w-full bg-gray-300"></div>' /* Placeholder */}
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-dark dark:text-white">
                    ${fields.authorName || ''}
                  </h3>
                  <p class="text-xs text-body-secondary">${fields.authorTitle || ''}</p>
                </div>
              </a>
            </div>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', testimonialHTML);
    });

    // IMPORTANT: Re-initialize or update Swiper AFTER adding slides
    if (window.testimonialSwiper && typeof window.testimonialSwiper.update === 'function') {
        window.testimonialSwiper.update(); // Update existing instance
         window.testimonialSwiper.slideTo(0); // Go to first slide
    } else {
         // Re-initialize if the instance was lost or not global
        window.testimonialSwiper = new Swiper(".testimonial-carousel", { /* Swiper options from index.html */ });
    }
 }

function renderFaqs(faqs) {
    const container = document.querySelector('#faqs-container');
    if (!container || !faqs || faqs.length === 0) {
        if(container) container.innerHTML = ''; // Clear container even if no FAQs
        return;
    }
    container.innerHTML = ''; // Clear static FAQs

    faqs.forEach((faq, index) => {
      const fields = faq.fields;
      const faqHTML = `
      <div class="w-full px-4 lg:w-1/2">
        <div class="mb-12 flex lg:mb-[70px]">
          {/* Icon */}
          <div class="mr-4 flex h-[50px] w-full max-w-[50px] items-center justify-center rounded-xl bg-primary text-white sm:mr-6 sm:h-[60px] sm:max-w-[60px]">
            <svg width="32" height="32" viewBox="0 0 34 34" class="fill-current"><path d="M17.0008 0.690674C7.96953 0.690674 0.691406 7.9688 0.691406 17..."></path><path d="M17.9039 6.32194C16.3633 6.05631 14.8227 6.48131..."></path><path d="M17.0531 24.8625H16.8937C16.3625 24.8625..."></path></svg>
          </div>
          {/* Content */}
          <div class="w-full">
            <h3 class="mb-6 text-xl font-semibold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
              ${fields.question || ''}
              ${console.log('Rendering FAQ:', fields.question, fields.answer)}
            </h3>
            {/* UPDATED: Directly output Long Text answer */}
            <div class="text-base text-body-color dark:text-dark-6">
              ${fields.answer || '<p>Answer not available.</p>'}
            </div>
          </div>
        </div>
      </div>
      `;
      container.insertAdjacentHTML('beforeend', faqHTML);
    });
  }

  function renderTeamMembers(members) {
      const container = document.querySelector('#team-members-container'); // Add ID
      if (!container || !members || members.length === 0) return;
      container.innerHTML = '';

      members.forEach(member => {
          const fields = member.fields;
          const memberHTML = `
          <div class="w-full px-4 sm:w-1/2 lg:w-1/4 xl:w-1/4">
             <div class="group mb-8 rounded-xl bg-white px-5 pb-10 pt-12 shadow-testimonial dark:bg-dark dark:shadow-none">
                 <div class="relative z-10 mx-auto mb-5 h-[120px] w-[120px]">
                     <img src="${fields.image?.fields?.file?.url ? 'https:' + fields.image.fields.file.url : 'placeholder.jpg'}" alt="${fields.name || 'Team Member'}" class="h-[120px] w-[120px] rounded-full object-cover">
                     <span class="absolute bottom-0 left-0 -z-10 h-10 w-10 rounded-full bg-secondary opacity-0 transition-all group-hover:opacity-100"></span>
                     <span class="absolute right-0 top-0 -z-10 opacity-0 transition-all group-hover:opacity-100">
                         <svg width="45" height="53" viewBox="0 0 45 53" fill="none" xmlns="http://www.w3.org/2000/svg">...</svg>
                     </span>
                 </div>
                 <div class="text-center">
                     <h4 class="mb-1 text-lg font-semibold text-dark dark:text-white">${fields.name || ''}</h4>
                     <p class="mb-5 text-sm text-body-color dark:text-dark-6">${fields.title || ''}</p>
                     <div class="flex items-center justify-center gap-5">
                         ${fields.facebookLink ? `<a href="${fields.facebookLink}" target="_blank" class="text-dark-6 hover:text-primary"><svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="fill-current"
                    >
                      <path
                        d="M13.3315 7.25625H11.7565H11.194V6.69375V4.95V4.3875H11.7565H12.9377C13.2471 4.3875 13.5002 4.1625 13.5002 3.825V0.84375C13.5002 0.534375 13.2752 0.28125 12.9377 0.28125H10.8846C8.66272 0.28125 7.11584 1.85625 7.11584 4.19062V6.6375V7.2H6.55334H4.64084C4.24709 7.2 3.88147 7.50937 3.88147 7.95937V9.98438C3.88147 10.3781 4.19084 10.7438 4.64084 10.7438H6.49709H7.05959V11.3063V16.9594C7.05959 17.3531 7.36897 17.7188 7.81897 17.7188H10.4627C10.6315 17.7188 10.7721 17.6344 10.8846 17.5219C10.9971 17.4094 11.0815 17.2125 11.0815 17.0437V11.3344V10.7719H11.6721H12.9377C13.3033 10.7719 13.5846 10.5469 13.6408 10.2094V10.1813V10.1531L14.0346 8.2125C14.0627 8.01562 14.0346 7.79063 13.8658 7.56562C13.8096 7.425 13.5565 7.28437 13.3315 7.25625Z"
                        fill=""
                      />
                    </svg></a>` : ''}
                         ${fields.twitterLink ? `<a href="${fields.twitterLink}" target="_blank" class="text-dark-6 hover:text-primary"><svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="fill-current"
                    >
                      <path
                        d="M16.4647 4.83752C16.565 4.72065 16.4343 4.56793 16.2859 4.62263C15.9549 4.74474 15.6523 4.82528 15.2049 4.875C15.7552 4.56855 16.0112 4.13054 16.2194 3.59407C16.2696 3.46467 16.1182 3.34725 15.9877 3.40907C15.458 3.66023 14.8864 3.84658 14.2854 3.95668C13.6913 3.3679 12.8445 3 11.9077 3C10.1089 3 8.65027 4.35658 8.65027 6.02938C8.65027 6.26686 8.67937 6.49818 8.73427 6.71966C6.14854 6.59919 3.84286 5.49307 2.24098 3.79696C2.13119 3.68071 1.93197 3.69614 1.86361 3.83792C1.68124 4.21619 1.57957 4.63582 1.57957 5.07762C1.57957 6.12843 2.15446 7.05557 3.02837 7.59885C2.63653 7.58707 2.2618 7.51073 1.91647 7.38116C1.74834 7.31808 1.5556 7.42893 1.57819 7.59847C1.75162 8.9004 2.80568 9.97447 4.16624 10.2283C3.89302 10.2978 3.60524 10.3347 3.30754 10.3347C3.23536 10.3347 3.16381 10.3324 3.0929 10.3281C2.91247 10.3169 2.76583 10.4783 2.84319 10.6328C3.35357 11.6514 4.45563 12.3625 5.73809 12.3847C4.62337 13.1974 3.21889 13.6816 1.69269 13.6816C1.50451 13.6816 1.42378 13.9235 1.59073 14.0056C2.88015 14.6394 4.34854 15 5.90878 15C11.9005 15 15.1765 10.384 15.1765 6.38067C15.1765 6.24963 15.1732 6.11858 15.1672 5.98877C15.6535 5.66205 16.0907 5.27354 16.4647 4.83752Z"
                        fill=""
                      />
                    </svg></a>` : ''}
                         ${fields.instagramLink ? `<a href="${fields.instagramLink}" target="_blank" class="text-dark-6 hover:text-primary"><svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="fill-current"
                    >
                      <path
                        d="M9.02429 11.8066C10.5742 11.8066 11.8307 10.5501 11.8307 9.00018C11.8307 7.45022 10.5742 6.19373 9.02429 6.19373C7.47433 6.19373 6.21783 7.45022 6.21783 9.00018C6.21783 10.5501 7.47433 11.8066 9.02429 11.8066Z"
                        fill=""
                      />
                      <path
                        d="M12.0726 1.5H5.92742C3.48387 1.5 1.5 3.48387 1.5 5.92742V12.0242C1.5 14.5161 3.48387 16.5 5.92742 16.5H12.0242C14.5161 16.5 16.5 14.5161 16.5 12.0726V5.92742C16.5 3.48387 14.5161 1.5 12.0726 1.5ZM9.02419 12.6774C6.96774 12.6774 5.34677 11.0081 5.34677 9C5.34677 6.99194 6.99194 5.32258 9.02419 5.32258C11.0323 5.32258 12.6774 6.99194 12.6774 9C12.6774 11.0081 11.0565 12.6774 9.02419 12.6774ZM14.1048 5.66129C13.8629 5.92742 13.5 6.07258 13.0887 6.07258C12.7258 6.07258 12.3629 5.92742 12.0726 5.66129C11.8065 5.39516 11.6613 5.05645 11.6613 4.64516C11.6613 4.23387 11.8065 3.91935 12.0726 3.62903C12.3387 3.33871 12.6774 3.19355 13.0887 3.19355C13.4516 3.19355 13.8387 3.33871 14.1048 3.60484C14.3468 3.91935 14.5161 4.28226 14.5161 4.66935C14.4919 5.05645 14.3468 5.39516 14.1048 5.66129Z"
                        fill=""
                      />
                      <path
                        d="M13.1135 4.06433C12.799 4.06433 12.5329 4.33046 12.5329 4.64498C12.5329 4.95949 12.799 5.22562 13.1135 5.22562C13.428 5.22562 13.6942 4.95949 13.6942 4.64498C13.6942 4.33046 13.4522 4.06433 13.1135 4.06433Z"
                        fill=""
                      />
                    </svg></a>` : ''}
                     </div>
                 </div>
             </div>
           </div>
          `;
           container.insertAdjacentHTML('beforeend', memberHTML);
      });
  }

  function renderBlogPosts(posts) {
     const container = document.querySelector('#blog-posts-container'); // Add ID
     if (!container || !posts || posts.length === 0) return;
     container.innerHTML = '';

     posts.forEach(post => {
        const fields = post.fields;
        const postDate = fields.publishDate ? new Date(fields.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : '';
        const postHTML = `
         <div class="w-full px-4 md:w-1/2 lg:w-1/3">
             <div class="wow fadeInUp group mb-10" data-wow-delay=".1s">
                 <div class="mb-8 overflow-hidden rounded-[5px]">
                     <a href="${fields.link || '#'}" class="block">
                         <img src="${fields.image?.fields?.file?.url ? 'https:'+fields.image.fields.file.url : 'placeholder.jpg'}" alt="${fields.title || 'Blog post image'}" class="w-full transition group-hover:rotate-6 group-hover:scale-125 object-cover h-60">
                     </a>
                 </div>
                 <div>
                     ${postDate ? `<span class="mb-6 inline-block rounded-[5px] bg-primary px-4 py-0.5 text-center text-xs font-medium leading-loose text-white">${postDate}</span>` : ''}
                     <h3>
                         <a href="${fields.link || '#'}" class="mb-4 inline-block text-xl font-semibold text-dark hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl lg:text-xl xl:text-2xl">
                             ${fields.title || ''}
                         </a>
                     </h3>
                     <p class="max-w-[370px] text-base text-body-color dark:text-dark-6">
                         ${fields.excerpt || ''}
                     </p>
                 </div>
             </div>
         </div>
        `;
        container.insertAdjacentHTML('beforeend', postHTML);
     });
      new WOW().init(); // Re-init WOW
  }

   function renderBrands(brands) {
     const container = document.querySelector('#brands-container'); // Add ID
     if (!container || !brands || brands.length === 0) return;
     container.innerHTML = ''; // Clear static brands

     brands.forEach(brand => {
        const fields = brand.fields;
         // Determine which logo to show based on current theme (needs theme check logic)
         // Simple approach: show dark logo by default, use JS to switch if dark mode is active
        const logoDarkUrl = fields.logoDark?.fields?.file?.url ? 'https:' + fields.logoDark.fields.file.url : '';
        const logoLightUrl = fields.logoLight?.fields?.file?.url ? 'https:' + fields.logoLight.fields.file.url : '';

        const brandHTML = `
          <a href="${fields.link || '#'}" target="_blank" rel="noopener noreferrer" class="brand-logo">
             <img src="${logoDarkUrl}" alt="${fields.name || 'brand logo'}" class="dark-logo brand-logo-light-mode h-8">
             <img src="${logoLightUrl}" alt="${fields.name || 'brand logo'}" class="light-logo brand-logo-dark-mode dark:block h-8">
          </a>
        `;
         container.insertAdjacentHTML('beforeend', brandHTML);
     });
      // Add logic here or in theme switcher to toggle logo visibility based on dark mode class on <html>
      function checkBrandLogos() {
         const isDarkMode = document.documentElement.classList.contains('dark');
         document.querySelectorAll('.brand-logo').forEach(logoLink => {
            logoLink.querySelector('.dark-logo').style.display = isDarkMode ? 'none' : 'block';
            logoLink.querySelector('.light-logo').style.display = isDarkMode ? 'block' : 'none';
         });
      }
      checkBrandLogos(); // Call initially
      // Also call checkBrandLogos() inside the themeSwitch function in main.js
   }

// --- Trigger fetch on page load ---
document.addEventListener('DOMContentLoaded', loadHomepageContent);





(function () {
  "use strict";

  // ======= Selectors =======
  const ud_header = document.querySelector(".ud-header");
  const header_logo = document.querySelector(".header-logo"); // Get logo element once
  const backToTop = document.querySelector(".back-to-top");
  const themeSwitcher = document.getElementById('themeSwitcher');
  const navbarToggler = document.querySelector("#navbarToggler");
  const navbarCollapse = document.querySelector("#navbarCollapse");

  // ======= NEW: Function to Update Logo Source =======
  function updateLogoSource() {
    // Check if logo element exists first
    if (!header_logo) {
        console.warn("Header logo element not found.");
        return;
    }

    const isSticky = ud_header && ud_header.classList.contains("sticky"); // Check if header exists
    const isDarkMode = document.documentElement.classList.contains("dark");

    if (isDarkMode) {
      // Dark mode: Always show white logo
      header_logo.src = "assets/images/logo/logo-white.svg";
    } else {
      // Light mode: Show white on top, dark when sticky
      if (isSticky) {
        header_logo.src = "assets/images/logo/logo.svg";
      } else {
        header_logo.src = "assets/images/logo/logo-white.svg";
      }
    }
  }
  // ======= End NEW Function =======
  function updateBrandLogosVisibility() {
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Update logos in the main brands section
    const brandLinks = document.querySelectorAll('#brands-container a'); // Uses the ID we added
    brandLinks.forEach(link => {
      // Select images using the NEW classes we added
      const lightModeLogo = link.querySelector('.brand-logo-light-mode');
      const darkModeLogo = link.querySelector('.brand-logo-dark-mode');

      if (lightModeLogo) {
        lightModeLogo.style.display = isDarkMode ? 'none' : 'block'; // Show if NOT dark mode
      }
      if (darkModeLogo) {
        darkModeLogo.style.display = isDarkMode ? 'block' : 'none'; // Show if dark mode
      }
    });

    // Update the "Made with TailGrids" logo specifically
    const madeWithLogoContainer = document.querySelector('a[href="https://tailgrids.com/"]'); // Selector remains the same
    if (madeWithLogoContainer) {
        // Select images using the NEW classes
        const lightModeLogo = madeWithLogoContainer.querySelector('.brand-logo-light-mode');
        const darkModeLogo = madeWithLogoContainer.querySelector('.brand-logo-dark-mode');

         if (lightModeLogo) {
            lightModeLogo.style.display = isDarkMode ? 'none' : 'block';
         }
         if (darkModeLogo) {
            darkModeLogo.style.display = isDarkMode ? 'block' : 'none';
         }
    }
  }


  // ======= Sticky Header and Logo Change on Scroll =======
  window.onscroll = function () {
    // Check if header exists before accessing offsetTop
    if (!ud_header) return;
    const sticky = ud_header.offsetTop;

    if (window.pageYOffset > sticky) {
      ud_header.classList.add("sticky");
    } else {
      ud_header.classList.remove("sticky");
    }

    // === Update logo based on theme and sticky state ===
    updateLogoSource(); // MODIFIED: Call the dedicated function

    // === Show or hide the back-to-top button ===
    if (
      document.body.scrollTop > 50 ||
      document.documentElement.scrollTop > 50
    ) {
      backToTop.style.display = "flex";
    } else {
      backToTop.style.display = "none";
    }
  };

  // ===== Responsive Navbar Toggler =====
   if (navbarToggler && navbarCollapse) { // Check if elements exist
     navbarToggler.addEventListener("click", () => {
       navbarToggler.classList.toggle("navbarTogglerActive");
       navbarCollapse.classList.toggle("hidden");
     });
   }

  // ===== Close navbar-collapse when a link is clicked =====
  document
    .querySelectorAll("#navbarCollapse ul li:not(.submenu-item) a")
    .forEach((e) =>
      e.addEventListener("click", () => {
        // Check if elements exist before modifying
        if (navbarToggler) navbarToggler.classList.remove("navbarTogglerActive");
        if (navbarCollapse) navbarCollapse.classList.add("hidden");
      })
    );

  // ===== Sub-menu =====
  const submenuItems = document.querySelectorAll(".submenu-item");
  submenuItems.forEach((el) => {
    const link = el.querySelector("a");
    const submenu = el.querySelector(".submenu");
    if (link && submenu) { // Check if elements exist
      link.addEventListener("click", () => {
        submenu.classList.toggle("hidden");
      });
    }
  });

  // ===== Faq accordion (Example structure) =====
  // const faqs = document.querySelectorAll(".single-faq");
  // faqs.forEach((el) => {
  //   const btn = el.querySelector(".faq-btn");
  //   const icon = el.querySelector(".icon");
  //   const content = el.querySelector(".faq-content");
  //   if(btn && icon && content) { // Check elements exist
  //      btn.addEventListener("click", () => {
  //        icon.classList.toggle("rotate-180");
  //        content.classList.toggle("hidden");
  //      });
  //   }
  // });

  // ===== wow js =====
  // Ensure WOW is defined before initializing
  if (typeof WOW !== 'undefined') {
    try {
      new WOW().init();
    } catch (e) {
      console.error("WOW.js initialization failed:", e);
    }
  } else {
    console.warn('WOW.js library not found or loaded after main.js');
  }


  // ====== scroll top js ======
  function scrollTo(element, to = 0, duration = 500) {
    if (!element) return; // Prevent errors if element doesn't exist
    const start = element.scrollTop;
    const change = to - start;
    const increment = 20;
    let currentTime = 0;

    const animateScroll = () => {
      currentTime += increment;
      const val = Math.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };
    animateScroll();
  }

  // Easing function
  Math.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  // Attach scroll to top only if button exists
  if(backToTop) {
     backToTop.onclick = () => {
       scrollTo(document.documentElement);
     };
  }


  /* ========  Theme Switcher Logic ========= */

  // Theme Vars
  const userTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Initial Theme Check
  const themeCheck = () => {
    // ... (logic to add/remove 'dark' class) ...
    if (userTheme === 'dark' || (!userTheme && systemTheme)) {
      document.documentElement.classList.add('dark');
    } else {
       document.documentElement.classList.remove('dark');
    }
    updateHeaderLogoSource();
    updateBrandLogosVisibility(); // Ensure this call is here
  };

  // Manual Theme Switch
  const themeSwitch = () => {
    // ... (logic to toggle 'dark' class and localStorage) ...
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    updateHeaderLogoSource();
    updateBrandLogosVisibility(); // Ensure this call is here
  };

  // ... (rest of theme switcher setup) ...
  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', themeSwitch);
  }
  themeCheck();

})(); // End of IIFE
