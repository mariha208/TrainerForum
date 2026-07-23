/* ═══════════════════════════════════════════════════
   WORLD TRAINER FORUM — AUTHENTICATION MODAL JS
   Connected Real-Time Firestore Session Integration
═══════════════════════════════════════════════════ */

'use strict';

const SERVER_ORIGIN = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL)
  ? process.env.NEXT_PUBLIC_API_URL
  : (typeof window !== 'undefined' && window.location && window.location.origin ? window.location.origin : '');

function openAuthModal(mode) {
  let modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.innerHTML = `
    <div class="auth-overlay" onclick="closeAuthModal()"></div>
    <div class="auth-container">
      <button class="auth-close" onclick="closeAuthModal()">✕</button>
      <div id="auth-content" class="auth-content"></div>
    </div>
  `;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderAuthView(mode, 'Organization'); // default role
}

function closeAuthModal() {
  let modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function renderAuthView(mode, role) {
  const content = document.getElementById('auth-content');
  if (!content) return;

  if (mode === 'login') {
    content.innerHTML = buildLoginView(role);
  } else {
    content.innerHTML = buildRegisterView(role);
  }
}

function buildLoginView(role) {
  return `
    <div class="auth-header">
      <h2>Welcome Back</h2>
      <p>Log in to your World Trainer Forum account</p>
    </div>
    
    <div class="auth-role-tabs">
      <button class="auth-role-tab ${role === 'Organization' ? 'active' : ''}" onclick="renderAuthView('login', 'Organization')">Organization</button>
      <button class="auth-role-tab ${role === 'Trainer' ? 'active' : ''}" onclick="renderAuthView('login', 'Trainer')">Trainer</button>
    </div>
    
    <div class="auth-form-body am-grid-1">
      <div class="am-form-group">
        <label>Email Address</label>
        <input type="email" id="loginEmail" placeholder="you@example.com">
      </div>
      <div class="am-form-group">
        <label>Password</label>
        <input type="password" id="loginPassword" placeholder="••••••••">
      </div>
      <div class="am-opts">
        <label class="am-checkbox-label">
          <input type="checkbox" class="am-checkbox"> Remember me
        </label>
        <a href="#" class="am-link">Forgot Password?</a>
      </div>
    </div>
    
    <div class="auth-footer">
      <button class="btn am-btn-primary" onclick="handleLogin('${role}')">Sign In</button>
      <p class="am-switch">Don't have an account? <a href="#" onclick="renderAuthView('register', '${role}')">Create Account</a></p>
    </div>
  `;
}

function buildRegisterView(role) {
  const isOrg = role === 'Organization';

  let formFields = '';
  if (isOrg) {
    formFields = `
      <div class="am-grid-1">
        <div class="am-form-group"><label>First Name</label><input type="text" id="orgFirstName" placeholder="John"></div>
        <div class="am-form-group"><label>Last Name</label><input type="text" id="orgLastName" placeholder="Doe"></div>
        <div class="am-form-group"><label>Organization Name</label><input type="text" id="orgName" placeholder="Acme Corp"></div>
      </div>
      <div class="am-grid-1">
        <div class="am-form-group"><label>Email Address</label><input type="email" id="orgEmail" placeholder="you@company.com"></div>
        <div class="am-form-group"><label>Password</label><input type="password" id="orgPassword" placeholder="••••••••"></div>
        <div class="am-form-group"><label>Phone Number</label><input type="tel" id="orgPhone" placeholder="+91 XXXX XXXXX"></div>
        <div class="am-form-group"><label>Mobile Number</label><input type="tel" id="orgMobile" placeholder="+91 XXXX XXXXX"></div>
      </div>
      <div class="am-grid-1">
        <div class="am-form-group">
          <label>Event Budget</label>
          <div class="am-select-wrap">
            <select id="orgEventBudget">
              <option value="" disabled selected>Select Budget...</option>
              <option>Under ₹50,000</option>
              <option>₹50,000 - ₹1,00,000</option>
              <option>₹1,00,000 - ₹5,00,000</option>
              <option>₹5,00,000 - ₹10,00,000</option>
              <option>Above ₹10,00,000</option>
            </select>
          </div>
        </div>
        <div class="am-form-group">
          <label>Event Type</label>
          <div class="am-select-wrap">
            <select id="orgEventType">
              <option value="" disabled selected>Select Event...</option>
              <option>Corporate Training</option>
              <option>Leadership Training</option>
              <option>Sales Training</option>
              <option>Cybersecurity Training</option>
              <option>AI Training</option>
              <option>Technical Workshop</option>
              <option>Keynote Speaking</option>
              <option>Conference</option>
              <option>Webinar</option>
              <option>Team Building</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div class="am-form-group"><label>Event Location</label><input type="text" id="orgEventLocation" placeholder="e.g. Mumbai or Online"></div>
      </div>
      <div class="am-grid-1">
        <div class="am-form-group">
          <label>Tell Us About Your Event / Training Requirements</label>
          <textarea rows="4" id="orgEventRequirement" placeholder="Describe your needs, audience size, specific topics..."></textarea>
        </div>
      </div>
    `;
  } else {
    const cats = ['Business Coaching','Leadership Development','Strategy & Management','Entrepreneurship','Corporate Training','Sales & Marketing','Finance & Accounting','Change Management','AI & Machine Learning','Cybersecurity','Software Development','Data & Analytics','Cloud Computing','Digital Marketing','UI/UX Design','Blockchain & Web3','Public Speaking','Emotional Intelligence','Communication Skills','Problem Solving','Time Management','Conflict Resolution','Personality Development','Goal Setting','Fitness & Exercise','Yoga & Meditation','Nutrition & Diet','Sports Coaching','Mental Health & Mindfulness','Life Coaching','Sleep & Recovery','Functional Training','English Language','Hindi & Regional','European Languages','Academic Tutoring','Writing & Copywriting','Interview Preparation','Test & Exam Prep','Corporate L&D','Music','Dance','Acting & Theatre','Visual Arts & Design','Photography','Video & Filmmaking','Podcasting','Creative Writing','Career Mentoring','Resume & LinkedIn','Motivational Speaking','Work-Life Balance','Professional Certifications','Personal Finance','Networking Skills','Mindset & NLP'].sort();
    const optionsHtml = cats.map(c => `<option>${c}</option>`).join('');

    formFields = `
      <div class="am-grid-1">
        <div class="am-form-group"><label>First Name <span style="color:#e74c3c">*</span></label><input type="text" id="trainerFirstName" placeholder="First Name"></div>
        <div class="am-form-group"><label>Last Name <span style="color:#e74c3c">*</span></label><input type="text" id="trainerLastName" placeholder="Last Name"></div>
      </div>
      <div class="am-form-group"><label>Email Address <span style="color:#e74c3c">*</span></label><input type="email" id="trainerEmail" placeholder="you@example.com"></div>
      <div class="am-grid-1">
        <div class="am-form-group"><label>Password <span style="color:#e74c3c">*</span></label><input type="password" id="trainerPassword" placeholder="••••••••"></div>
        <div class="am-form-group"><label>Phone Number <span style="color:#e74c3c">*</span></label><input type="tel" id="trainerPhone" placeholder="+91 XXXXX XXXXX"></div>
      </div>
      <div class="am-form-group"><label>Professional Title <span style="color:#e74c3c">*</span></label><input type="text" id="trainerTitle" placeholder="e.g. Senior Business Coach"></div>
      
      <div class="am-grid-1">
        <div class="am-form-group">
          <label>Expertise Category 1 <span style="color:#e74c3c">*</span></label>
          <div class="am-select-wrap">
            <select id="trainerExpertiseCategory1" onchange="const t = document.getElementById('trainerExpertiseOther1'); if(this.value==='Other'){t.style.display='block';}else{t.style.display='none';}">
              <option value="" disabled selected>Select Category 1...</option>
              ${optionsHtml}
              <option value="Other">Other</option>
            </select>
          </div>
          <input type="text" id="trainerExpertiseOther1" placeholder="Specify your category" style="display:none; margin-top:8px;">
        </div>
      </div>
      <div class="am-grid-1">
        <div class="am-form-group">
          <label>Expertise Category 2</label>
          <div class="am-select-wrap">
            <select id="trainerExpertiseCategory2" onchange="const t = document.getElementById('trainerExpertiseOther2'); if(this.value==='Other'){t.style.display='block';}else{t.style.display='none';}">
              <option value="" selected>None</option>
              ${optionsHtml}
              <option value="Other">Other</option>
            </select>
          </div>
          <input type="text" id="trainerExpertiseOther2" placeholder="Specify your category" style="display:none; margin-top:8px;">
        </div>
        <div class="am-form-group">
          <label>Expertise Category 3</label>
          <div class="am-select-wrap">
            <select id="trainerExpertiseCategory3" onchange="const t = document.getElementById('trainerExpertiseOther3'); if(this.value==='Other'){t.style.display='block';}else{t.style.display='none';}">
              <option value="" selected>None</option>
              ${optionsHtml}
              <option value="Other">Other</option>
            </select>
          </div>
          <input type="text" id="trainerExpertiseOther3" placeholder="Specify your category" style="display:none; margin-top:8px;">
        </div>
      </div>
      <div class="am-grid-1">
        <div class="am-form-group"><label>Years of Experience <span style="color:#e74c3c">*</span></label><input type="number" id="trainerYearsOfExperience" placeholder="5" min="1"></div>
        <div class="am-form-group"><label>Country <span style="color:#e74c3c">*</span></label><input type="text" id="trainerCountry" placeholder="India"></div>
        <div class="am-form-group"><label>City <span style="color:#e74c3c">*</span></label><input type="text" id="trainerCity" placeholder="Bangalore"></div>
      </div>
      <div class="am-grid-1">
        <div class="am-form-group"><label>LinkedIn Profile</label><input type="url" id="trainerLinkedIn" placeholder="https://linkedin.com/in/..."></div>
        <div class="am-form-group"><label>Website (Optional)</label><input type="url" id="trainerWebsite" placeholder="https://..."></div>
      </div>
      <div class="am-grid-1">
        <div class="am-form-group">
          <label>Short Bio</label>
          <textarea rows="3" id="trainerBio" placeholder="Tell us briefly about your experience and focus area..."></textarea>
        </div>
      </div>
    `;
  }

  return `
    <div class="auth-header">
      <h2>Create Account</h2>
      <p>Join the world's premium marketplace for expert trainers.</p>
    </div>
    
    <div class="auth-role-tabs">
      <button class="auth-role-tab ${role === 'Organization' ? 'active' : ''}" onclick="renderAuthView('register', 'Organization')">I'm Organization</button>
      <button class="auth-role-tab ${role === 'Trainer' ? 'active' : ''}" onclick="renderAuthView('register', 'Trainer')">I'm Trainer</button>
    </div>
    
    <div class="auth-form-body">
      ${formFields}
      
      <div class="am-consent">
        <label class="am-checkbox-label">
          <input type="checkbox" class="am-checkbox"> I agree to receive communications regarding inquiries, bookings, and platform updates.
        </label>
        <label class="am-checkbox-label">
          <input type="checkbox" class="am-checkbox"> I accept the <a href="#" class="am-link">Terms of Service</a> and <a href="#" class="am-link">Privacy Policy</a>.
        </label>
      </div>
    </div>
    
    <div class="auth-footer">
      <button class="btn am-btn-primary" onclick="handleRegistration('${role}')">CREATE ACCOUNT</button>
      <p class="am-switch">Already have an account? <a href="#" onclick="renderAuthView('login', '${role}')">Sign in</a></p>
    </div>
  `;
}

// ── ACTIVE REGISTER SUBMISSION HANDLER ───────────────────────────────────────
window._registrationPayload = {};

window.handleRegistration = function (role) {
  if (role === 'Organization') {
    const email = document.getElementById("orgEmail")?.value.trim();
    const password = document.getElementById("orgPassword")?.value;
    const firstName = document.getElementById("orgFirstName")?.value.trim() || "";
    const lastName = document.getElementById("orgLastName")?.value.trim() || "";
    
    if (!email || !password || !firstName) {
      alert("Please fill out your Email, Password, and First Name fields.");
      return;
    }
    
    window._registrationPayload = {
      email,
      password,
      firstName,
      lastName,
      role: 'client',
      phoneNumber: document.getElementById("orgPhone")?.value || "",
      city: document.getElementById("orgEventLocation")?.value || "",
      bio: document.getElementById("orgEventRequirement")?.value || ""
    };
    
    // Organizations don't select membership, they just register directly
    completeRegistration();
  } else {
    // Trainer flow
    const email = document.getElementById("trainerEmail")?.value.trim();
    const password = document.getElementById("trainerPassword")?.value;
    const firstName = document.getElementById("trainerFirstName")?.value.trim() || "";
    const lastName = document.getElementById("trainerLastName")?.value.trim() || "";
    const phone = document.getElementById("trainerPhone")?.value.trim() || "";
    const title = document.getElementById("trainerTitle")?.value.trim() || "";
    const exp = document.getElementById("trainerYearsOfExperience")?.value.trim() || "";
    const country = document.getElementById("trainerCountry")?.value.trim() || "";
    const city = document.getElementById("trainerCity")?.value.trim() || "";

    const getCat = (idx) => {
      const sel = document.getElementById(`trainerExpertiseCategory${idx}`);
      if (!sel) return "";
      const val = sel.value;
      if (val === "Other") return document.getElementById(`trainerExpertiseOther${idx}`)?.value || "";
      return val === "None" ? "" : val;
    };

    const cat1 = getCat(1);
    const cat2 = getCat(2);
    const cat3 = getCat(3);

    if (!email || !password || !firstName || !lastName || !phone || !title || !cat1 || !exp || !country || !city) {
      alert("Please fill out all compulsory fields (marked with *).");
      return;
    }

    window._registrationPayload = {
      email,
      password,
      firstName,
      lastName,
      role: 'trainer',
      professionalTitle: document.getElementById("trainerTitle")?.value || "Expert Instructor",
      expertiseCategory: cat1,
      expertiseCategory1: cat1,
      expertiseCategory2: cat2,
      expertiseCategory3: cat3,
      yearsOfExperience: parseInt(document.getElementById("trainerYearsOfExperience")?.value) || 0,
      city: document.getElementById("trainerCity")?.value || "",
      phoneNumber: document.getElementById("trainerPhone")?.value || "",
      linkedinProfile: document.getElementById("trainerLinkedIn")?.value || "",
      website: document.getElementById("trainerWebsite")?.value || "",
      bio: document.getElementById("trainerBio")?.value || ""
    };

    // Move to Membership Plan Selection
    renderMembershipPlanSelection();
  }
};

function renderMembershipPlanSelection() {
  const content = document.getElementById('auth-content');
  if (!content) return;

  content.innerHTML = `
    <div class="auth-header">
      <h2>Choose Your Membership</h2>
      <p>Select a plan that fits your growth.</p>
    </div>
    
    <div class="auth-form-body" style="display:flex;gap:15px;flex-direction:column;">
      <div class="plan-select-card" style="border:1px solid var(--border);padding:15px;border-radius:10px;cursor:pointer;transition:0.2s;" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='var(--border)'" onclick="selectPlan('FREE')">
        <h3 style="margin-bottom:5px;font-size:1.1rem">Starter Plan (Free)</h3>
        <p style="font-size:0.85rem;color:var(--tm)">Basic listing only.</p>
      </div>
      <div class="plan-select-card" style="border:1px solid var(--gold);padding:15px;border-radius:10px;cursor:pointer;background:rgba(245,200,66,0.05);transition:0.2s;" onmouseover="this.style.background='rgba(245,200,66,0.1)'" onmouseout="this.style.background='rgba(245,200,66,0.05)'" onclick="selectPlan('STANDARD')">
        <h3 style="margin-bottom:5px;font-size:1.1rem;color:var(--gold)">Professional Plan (₹999/mo)</h3>
        <p style="font-size:0.85rem;color:var(--tm)">Full profile visibility, custom banner, and search presence.</p>
      </div>
      <div class="plan-select-card" style="border:2px solid var(--gold);padding:15px;border-radius:10px;cursor:pointer;background:rgba(245,200,66,0.1);transition:0.2s;" onmouseover="this.style.background='rgba(245,200,66,0.2)'" onmouseout="this.style.background='rgba(245,200,66,0.1)'" onclick="selectPlan('PREMIUM')">
        <div style="font-size:0.7rem;font-weight:bold;background:var(--gold);color:#000;display:inline-block;padding:2px 8px;border-radius:10px;margin-bottom:5px">RECOMMENDED</div>
        <h3 style="margin-bottom:5px;font-size:1.1rem;color:var(--gold)">Elite Featured Plan (₹2499/mo)</h3>
        <p style="font-size:0.85rem;color:var(--tm)">Homepage top placement, maximum visibility, premium badge.</p>
      </div>
    </div>
  `;
}

window.selectPlan = function(planType) {
  window._registrationPayload.membershipType = planType;
  if (planType === 'FREE') {
    completeRegistration();
  } else {
    renderPaymentMock(planType);
  }
}

function renderPaymentMock(planType) {
  const content = document.getElementById('auth-content');
  const price = planType === 'STANDARD' ? '₹999' : '₹2499';
  content.innerHTML = `
    <div class="auth-header">
      <h2>Payment Details</h2>
      <p>Complete your subscription for the ${planType} plan. Total: <strong style="color:var(--gold)">${price}/mo</strong>.</p>
    </div>
    
    <div class="auth-form-body">
      <div class="am-form-group">
        <label>Card Number (Mock)</label>
        <input type="text" placeholder="1234 5678 9101 1121" value="4242 4242 4242 4242">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="am-form-group">
          <label>Expiry Date</label>
          <input type="text" placeholder="MM/YY" value="12/26">
        </div>
        <div class="am-form-group">
          <label>CVC</label>
          <input type="password" placeholder="123" value="123">
        </div>
      </div>
      <div class="am-form-group" style="margin-top:10px;">
        <label>Name on Card</label>
        <input type="text" placeholder="John Doe" value="${window._registrationPayload.firstName} ${window._registrationPayload.lastName}">
      </div>
      
      <button class="btn am-btn-primary" style="margin-top:20px;width:100%" onclick="processMockPayment()">Pay ${price} & Complete Registration</button>
      <button class="btn btn-ghost" style="margin-top:10px;width:100%" onclick="renderMembershipPlanSelection()">Back to Plans</button>
    </div>
  `;
}

window.processMockPayment = function() {
  alert("Payment Successful!");
  completeRegistration();
}

async function completeRegistration() {
  const payload = window._registrationPayload;
  try {
    const res = await fetch(`${SERVER_ORIGIN}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if (res.ok) {
      // Keep frontend session shape consistent
      const sessionUser = {
        ...data.user,
        trainerEmail: data.user.email,
        name: data.user.firstName + ' ' + data.user.lastName,
        cat: data.user.expertiseCategory,
        pn: data.user.hourlyRate || 0,
        rate: data.user.hourlyRate || 0
      };
      
      localStorage.setItem("currentTrainer", JSON.stringify(sessionUser));
      localStorage.setItem("userSession", JSON.stringify(sessionUser));  // auth token for navbar & auth guard
      localStorage.setItem("authToken", data.token);

      // ── Persist trainer data to fallback keys so card survives logout ──────
      if (sessionUser.role === 'trainer') {
        const snap = JSON.stringify({
          name: sessionUser.name,
          tagline: sessionUser.professionalTitle || '',
          bio: sessionUser.bio || '',
          rate: sessionUser.hourlyRate || sessionUser.pn || 0,
          category: sessionUser.expertiseCategory || sessionUser.cat || '',
          location: [sessionUser.city, sessionUser.country].filter(Boolean).join(', '),
          mode: sessionUser.mode || 'Online',
          languages: sessionUser.languages || [],
          tags: sessionUser.skills || [],
          whatsapp: sessionUser.phoneNumber || '',
          photo: sessionUser.profilePictureUrl || sessionUser.profilePic || '',
          banner: sessionUser.coverBannerUrl || '',
          achievements: sessionUser.achievements || [],
          events: sessionUser.events || [],
        });
        if (sessionUser._id) localStorage.setItem(`tv-trainer-${sessionUser._id}-profile`, snap);
        localStorage.setItem('tv-trainer-1-profile', snap);
        localStorage.setItem('tv-primary-trainer-id', sessionUser._id || '');
      }

      alert("Registration successful!");
      closeAuthModal();

      if (typeof window.updateNavbarAuthUI === "function") {
        window.updateNavbarAuthUI();
      } else {
        window.location.href = 'dashboard.html'; // Redirect to dashboard immediately on new signup
      }
    } else {
      alert(data.error || "Failed to register account.");
    }
  } catch (error) {
    console.error("Registration error: ", error);
    alert("An error occurred during registration.");
  }
}

// ── ACTIVE LOGIN VERIFICATION HANDLER ────────────────────────────────────────
window.handleLogin = async function (role) {
  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;

  if (!email || !password) {
    alert("Please enter your email address and password.");
    return;
  }

  try {
    const res = await fetch(`${SERVER_ORIGIN}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      // Keep frontend session shape consistent
      const sessionUser = {
        ...data.user,
        trainerEmail: data.user.email,
        name: data.user.firstName + ' ' + data.user.lastName,
        cat: data.user.expertiseCategory,
        pn: data.user.hourlyRate || 0,
        rate: data.user.hourlyRate || 0
      };
      
      localStorage.setItem("currentTrainer", JSON.stringify(sessionUser));
      localStorage.setItem("userSession", JSON.stringify(sessionUser));  // auth token for navbar & auth guard
      localStorage.setItem("authToken", data.token);

      // ── Persist trainer data to fallback keys so card survives logout ──────
      if (sessionUser.role === 'trainer') {
        const snap = JSON.stringify({
          name: sessionUser.name,
          tagline: sessionUser.professionalTitle || '',
          bio: sessionUser.bio || '',
          rate: sessionUser.hourlyRate || sessionUser.pn || 0,
          category: sessionUser.expertiseCategory || sessionUser.cat || '',
          location: [sessionUser.city, sessionUser.country].filter(Boolean).join(', '),
          mode: sessionUser.mode || 'Online',
          languages: sessionUser.languages || [],
          tags: sessionUser.skills || [],
          whatsapp: sessionUser.phoneNumber || '',
          photo: sessionUser.profilePictureUrl || sessionUser.profilePic || '',
          banner: sessionUser.coverBannerUrl || '',
          achievements: sessionUser.achievements || [],
          events: sessionUser.events || [],
        });
        if (sessionUser._id) localStorage.setItem(`tv-trainer-${sessionUser._id}-profile`, snap);
        localStorage.setItem('tv-trainer-1-profile', snap);
        localStorage.setItem('tv-primary-trainer-id', sessionUser._id || '');
      }

      alert("Login successful!");
      closeAuthModal();

      if (typeof window.updateNavbarAuthUI === "function") {
        window.updateNavbarAuthUI();
      } else {
        window.location.reload();
      }
    } else {
      alert(data.error || "Login failed.");
    }
  } catch (error) {
    console.error("Login lookup failure: ", error);
    alert("An error occurred during authentication.");
  }
};