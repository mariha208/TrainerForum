# World Trainer Forum — Batch Generator 2 (All Remaining Pages)
$base = "c:\Users\The Mars\Desktop\trainers"

# ─── Shared page template ───────────────────────────────
function MakePage($file, $title, $desc, $bc, $heroLabel, $h1, $h1g, $heroDesc, $btn1t, $btn1h, $btn2t, $btn2h, $body) {
  $html = @"
<!DOCTYPE html>
<html lang="en" class="dark-mode">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$title</title>
  <meta name="description" content="$desc">
  <meta name="robots" content="index, follow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css"><link rel="stylesheet" href="css/pages.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <div id="nav-inject"></div>
  <main class="sp-page">
    <nav class="sp-breadcrumb">$bc</nav>
    <section class="sp-hero"><div class="sp-hero-inner">
      <span class="sp-hero-label">$heroLabel</span>
      <h1>$h1 <span class="gld">$h1g</span></h1>
      <p class="sp-hero-desc">$heroDesc</p>
      <div class="sp-hero-ctas">
        <a href="$btn1h" class="btn btn-gold btn-lg">$btn1t</a>
        <a href="$btn2h" class="btn btn-ghost btn-lg">$btn2t</a>
      </div>
    </div></section>
    $body
  </main>
  <div id="footer-inject"></div>
  <script src="js/shared.js"></script>
</body>
</html>
"@
  Set-Content -Path "$base\$file" -Value $html -Encoding UTF8
  Write-Host "Created: $file"
}

function Bc($items) {
  $out = '<a href="index.html">Home</a>'
  foreach ($it in $items) {
    $out += '<span class="bc-sep">›</span>'
    if ($it.href) { $out += "<a href='$($it.href)'>$($it.label)</a>" }
    else { $out += "<span class='bc-cur'>$($it.label)</span>" }
  }
  return $out
}

function Cta($h,$p,$b1,$b1h,$b2,$b2h) {
  return "<section class='sp-cta-band'><h2>$h</h2><p>$p</p><div class='sp-cta-btns'><a href='$b1h' class='btn btn-gold btn-lg'>$b1</a><a href='$b2h' class='btn btn-ghost btn-lg'>$b2</a></div></section>"
}

function Cards($items,$cols=3) {
  $d = @('','sp-reveal-d1','sp-reveal-d2','sp-reveal-d3')
  $html = "<div class='sp-grid-$cols' style='margin-bottom:52px;'>"
  $i=0; foreach ($x in $items) { $html += "<div class='sp-card sp-reveal $($d[$i%$cols])'><div class='sp-card-icon'><i class='$($x.i)'></i></div><h3>$($x.h)</h3><p>$($x.p)</p></div>"; $i++ }
  $html += '</div>'
  return $html
}

function Stats($items) {
  $html = "<div class='sp-stats sp-reveal'>"
  foreach ($x in $items) { $html += "<div class='sp-stat'><span class='sp-stat-num'>$($x.n)</span><span class='sp-stat-lbl'>$($x.l)</span></div>" }
  $html += '</div>'
  return $html
}

function Steps($items) {
  $html = "<div class='sp-steps sp-reveal'>"
  $i=1; foreach ($x in $items) { $html += "<div class='sp-step'><div class='sp-step-num'>0$i</div><h3>$($x.h)</h3><p>$($x.p)</p></div>"; $i++ }
  $html += '</div>'
  return $html
}

function Sec($label,$title,$gold,$sub,$content,$alt=$false) {
  $cls = if ($alt) { "sp-section sp-section--alt" } else { "sp-section" }
  return "<section class='$cls'><div class='sp-container'><div class='sp-section-hdr center sp-reveal'><span class='sp-section-label'>$label</span><h2 class='sp-section-title'>$title <span class='a'>$gold</span></h2>$(if($sub){"<p class='sp-section-sub'>$sub</p>"})</div>$content</div></section>"
}

function Faqs($items) {
  $html = "<section class='sp-section sp-section--alt'><div class='sp-container'><div class='sp-section-hdr center sp-reveal'><span class='sp-section-label'>FAQs</span><h2 class='sp-section-title'>Common <span class='a'>Questions</span></h2></div><div class='sp-faq-list' style='max-width:720px;margin:0 auto;'>"
  foreach ($x in $items) { $html += "<div class='sp-faq-item'><button class='sp-faq-q'>$($x.q) <i class='fa-solid fa-chevron-down sp-faq-arrow'></i></button><div class='sp-faq-a'>$($x.a)</div></div>" }
  $html += '</div></div></section>'
  return $html
}

# ════════════════════════════════════════════════════════
# TRAINER PAGES
# ════════════════════════════════════════════════════════

# Community Forum
$body = (Sec "Global Trainer Network" "Join the World's Largest" "Trainer Community" "A dedicated space for trainers, coaches, mentors, and L&D professionals to connect, share insights, and grow together." `
  (Cards @(
    @{i='fa-solid fa-comments';h='Discussion Boards';p='Topic-specific forums covering training design, facilitation, client acquisition, pricing strategy, and industry trends.'},
    @{i='fa-solid fa-lightbulb';h='Knowledge Exchange';p='Share training activities, exercises, and program blueprints. Learn from 50,000+ practitioners worldwide.'},
    @{i='fa-solid fa-handshake';h='Referral Network';p='Connect with fellow trainers for subcontracting opportunities, co-facilitation projects, and client referrals.'},
    @{i='fa-solid fa-trophy';h='Monthly Challenges';p='Participate in monthly training design challenges, case study competitions, and community showcases.'},
    @{i='fa-solid fa-microphone';h='Expert AMAs';p='Monthly Ask-Me-Anything sessions with leading trainers, coaches, and L&D industry experts.'},
    @{i='fa-solid fa-globe';h='Regional Chapters';p='Connect with trainers in your city, state, or country through 80+ active regional chapter groups.'}
  ))) +
  (Cta "Be Part of a Thriving Global Community" "Connect with 50,000+ training professionals who are changing how the world learns." "Join the Community" "dashboard.html" "Browse Success Stories" "success-stories.html")

MakePage "community-forum.html" "Community Forum | World Trainer Forum — Global Trainer Network" "Join World Trainer Forum's community forum — the world's largest network of professional trainers, coaches, mentors, and L&D experts. Share insights, find collaborators, and grow your practice." `
  (Bc @(@{label='Community Forum'})) "Global Trainer Network" "Community Forum for" "Professional Trainers" "Connect with 50,000+ trainers, coaches, mentors, and L&D professionals in the world's most active training community." "Join the Community" "dashboard.html" "Explore Resources" "trainer-resources.html" $body

# Success Stories
$body = (Sec "Real Trainer Impact" "Trainers Whose Lives" "Changed on This Platform" "" `
  (Stats @(@{n='50K+';l='Active Trainers'}, @{n='₹2.4L';l='Avg Monthly Earnings (Top Tier)'}, @{n='18×';l='Avg Booking Growth in 90 Days'}, @{n='62';l='Countries with Active Trainers'}))) +
  "<section class='sp-section'><div class='sp-container'><div class='sp-grid-3'>" +
  "<div class='sp-testi sp-reveal'><div class='sp-testi-stars'>★★★★★</div><p class='sp-testi-quote'>Within 60 days of listing my profile, I had 12 corporate clients. World Trainer Forum completely transformed my freelance training career.</p><div class='sp-testi-author'><div class='sp-testi-av' style='background:#2d5fa8;'>PK</div><div><div class='sp-testi-name'>Priya Krishnamurthy</div><div class='sp-testi-role'>Leadership Trainer, Chennai</div></div></div></div>" +
  "<div class='sp-testi sp-reveal sp-reveal-d1'><div class='sp-testi-stars'>★★★★★</div><p class='sp-testi-quote'>I went from 3 clients to 47 in one year. The platform's visibility and verification badge made corporate clients trust me immediately.</p><div class='sp-testi-author'><div class='sp-testi-av' style='background:#276749;'>AR</div><div><div class='sp-testi-name'>Anand Rao</div><div class='sp-testi-role'>Sales Coach, Bangalore</div></div></div></div>" +
  "<div class='sp-testi sp-reveal sp-reveal-d2'><div class='sp-testi-stars'>★★★★★</div><p class='sp-testi-quote'>As a new trainer, this platform gave me credibility, structure, and access to clients I could never have reached on my own.</p><div class='sp-testi-author'><div class='sp-testi-av' style='background:#744210;'>SM</div><div><div class='sp-testi-name'>Sanya Mehta</div><div class='sp-testi-role'>Soft Skills Trainer, Mumbai</div></div></div></div>" +
  "<div class='sp-testi sp-reveal sp-reveal-d1'><div class='sp-testi-stars'>★★★★★</div><p class='sp-testi-quote'>My earnings tripled in 8 months. The analytics dashboard showed me exactly which services to focus on for maximum revenue.</p><div class='sp-testi-author'><div class='sp-testi-av' style='background:#5b21b6;'>RV</div><div><div class='sp-testi-name'>Rahul Verma</div><div class='sp-testi-role'>Tech Trainer, Hyderabad</div></div></div></div>" +
  "<div class='sp-testi sp-reveal sp-reveal-d2'><div class='sp-testi-stars'>★★★★★</div><p class='sp-testi-quote'>Listing here opened international doors. I now run programs for organizations in the UAE, UK, and Singapore from India.</p><div class='sp-testi-author'><div class='sp-testi-av' style='background:#0e7490;'>NK</div><div><div class='sp-testi-name'>Neha Khurana</div><div class='sp-testi-role'>Executive Coach, Delhi</div></div></div></div>" +
  "<div class='sp-testi sp-reveal sp-reveal-d3'><div class='sp-testi-stars'>★★★★★</div><p class='sp-testi-quote'>The verification process gave me confidence in my own expertise. Clients book me without hesitation now — the badge does the selling.</p><div class='sp-testi-author'><div class='sp-testi-av' style='background:#b45309;'>AJ</div><div><div class='sp-testi-name'>Arjun Joshi</div><div class='sp-testi-role'>HR Trainer, Pune</div></div></div></div>" +
  "</div></div></section>" +
  (Cta "Ready to Write Your Success Story?" "Join 50,000+ trainers who are growing their practice on World Trainer Forum." "Start Your Journey" "dashboard.html" "Get Verified" "become-verified.html")

MakePage "success-stories.html" "Trainer Success Stories | World Trainer Forum — Real Results, Real Growth" "Read inspiring success stories from professional trainers who built thriving practices on World Trainer Forum. From 3 clients to 47, from local to global — real results from real trainers." `
  (Bc @(@{label='Success Stories'})) "Real Trainer Impact" "Success Stories That" "Inspire Action" "Discover how trainers across India and the globe have built thriving, high-income practices on World Trainer Forum." "Share Your Story" "contact.html" "List Your Profile" "dashboard.html" $body

# Verification Process
$body = (Sec "Why Verification Matters" "The Standard That" "Clients Trust" "Our rigorous verification process ensures every trainer on our platform meets the highest standards of expertise, professionalism, and integrity." `
  (Steps @(
    @{h='Profile & Document Submission';p='Submit your qualifications, certifications, work experience, client references, and sample training materials through our secure portal.'},
    @{h='Expert Review & Assessment';p='Our verification team — comprising senior L&D professionals — reviews your submission within 5 business days and may request a 30-minute video interview.'},
    @{h='Verified Badge Awarded';p='Upon approval, your profile receives the coveted Verified Trainer badge, boosting your search ranking and client trust significantly.'}
  ))) +
  (Sec "What We Verify" "The Verification" "Criteria" "" `
  (Cards @(
    @{i='fa-solid fa-graduation-cap';h='Qualifications & Certifications';p='Academic credentials, professional certifications (ICF, ATD, HRCI, etc.), and domain-specific training qualifications verified against issuing bodies.'},
    @{i='fa-solid fa-briefcase';h='Professional Experience';p='Minimum 3 years of training, coaching, or domain experience verified through employment records, client references, and portfolio review.'},
    @{i='fa-solid fa-star';h='Expertise Demonstration';p='Sample training materials, session recordings, and/or a live 30-minute demonstration session evaluated by our expert review panel.'},
    @{i='fa-solid fa-shield-halved';h='Background Check';p='Basic identity verification and professional conduct check to ensure client safety and platform integrity.'},
    @{i='fa-solid fa-comments';h='Client References';p='At least 3 verified client references who confirm your professionalism, content quality, and delivery effectiveness.'},
    @{i='fa-solid fa-rotate';h='Annual Re-verification';p='Verification is renewed annually to ensure our standards are maintained as trainer careers evolve.'}
  ))) +
  (Faqs @(
    @{q='How long does the verification process take?';a='The standard process takes 5–7 business days after all documents are submitted. Express verification (48 hours) is available for experienced trainers with complete portfolios.'},
    @{q='What happens if my application is not approved?';a='You receive detailed feedback on areas for improvement. You can reapply after 30 days with additional supporting materials.'},
    @{q='Is verification mandatory to list on the platform?';a='No — you can create a basic profile without verification. However, verified trainers receive 4× more inquiries and appear higher in search results.'}
  )) +
  (Cta "Start Your Verification Today" "Earn the badge that corporate clients trust. Apply for verification in minutes." "Apply for Verification" "become-verified.html" "Learn About Benefits" "trainer-resources.html")

MakePage "verification-process.html" "Trainer Verification Process | World Trainer Forum — Get Your Verified Badge" "Learn about World Trainer Forum's rigorous trainer verification process. Get verified to build trust, rank higher in search, and attract premium corporate clients." `
  (Bc @(@{label='Verification Process'})) "Trust & Credibility" "How Trainer Verification" "Works" "Our verification process ensures clients always work with qualified, professional, and trustworthy trainers. Here's what it involves." "Apply for Verification" "become-verified.html" "Trainer Resources" "trainer-resources.html" $body

# Become Verified
$body = "<section class='sp-section'><div class='sp-container'><div class='sp-split sp-reveal'><div>" +
  "<span class='sp-section-label'>Why Get Verified?</span><h2 class='sp-section-title'>The Badge That <span class='a'>Opens Doors</span></h2>" +
  "<p style='color:var(--ts);line-height:1.8;margin-bottom:24px;'>Verified trainers on World Trainer Forum earn more, attract better clients, and build stronger reputations. Here's what verification unlocks:</p>" +
  "<ul class='sp-check-list'><li><i class='fa-solid fa-circle-check'></i>4× more profile views and inquiries from corporate clients</li><li><i class='fa-solid fa-circle-check'></i>Priority placement in search results and category listings</li><li><i class='fa-solid fa-circle-check'></i>Access to premium corporate RFPs and enterprise accounts</li><li><i class='fa-solid fa-circle-check'></i>Verified badge on all communications and proposals</li><li><i class='fa-solid fa-circle-check'></i>Eligibility for Trainer of the Year awards and press features</li><li><i class='fa-solid fa-circle-check'></i>Access to Trainer Academy premium content and events</li></ul></div>" +
  "<div class='sp-info-panel'><h3 style='font-family:Cormorant Garamond,serif;font-size:1.5rem;color:var(--tp);margin-bottom:20px;'>Apply for Verification</h3><form onsubmit='return false;'><div class='sp-form-grid' style='margin-bottom:16px;'><div class='sp-form-group'><label class='sp-form-label'>Full Name</label><input class='sp-form-input' type='text' placeholder='Dr. Priya Sharma'></div><div class='sp-form-group'><label class='sp-form-label'>Email</label><input class='sp-form-input' type='email' placeholder='priya@example.com'></div><div class='sp-form-group full'><label class='sp-form-label'>Training Specialization</label><input class='sp-form-input' type='text' placeholder='Leadership, Executive Coaching, Sales...'></div><div class='sp-form-group full'><label class='sp-form-label'>Years of Training Experience</label><select class='sp-form-select'><option>1–3 years</option><option>3–5 years</option><option>5–10 years</option><option>10+ years</option></select></div><div class='sp-form-group full'><label class='sp-form-label'>Certifications / Qualifications</label><textarea class='sp-form-textarea' style='min-height:80px;' placeholder='ICF PCC, ATD CPTD, MBA, etc.'></textarea></div></div><button class='btn btn-gold' style='width:100%;padding:14px;'>Submit Application →</button></form></div></div></div></section>" +
  (Sec "Verification Tiers" "Choose Your" "Verification Level" "" `
  "<div class='sp-price-grid'><div class='sp-price-card'><div class='sp-price-tier'>Essential</div><div class='sp-price-amt'>Free</div><div class='sp-price-sub'>For new trainers</div><div class='sp-price-feature'><i class='fa-solid fa-check'></i>Identity Verification</div><div class='sp-price-feature'><i class='fa-solid fa-check'></i>Basic Profile Badge</div><div class='sp-price-feature'><i class='fa-solid fa-check'></i>Document Review</div><a href='dashboard.html' class='btn btn-outline' style='width:100%;margin-top:20px;'>Get Started</a></div><div class='sp-price-card featured'><div class='sp-price-tier'>Verified Pro</div><div class='sp-price-amt'>₹2,999</div><div class='sp-price-sub'>One-time fee · Most Popular</div><div class='sp-price-feature'><i class='fa-solid fa-check'></i>Full Background & Credential Check</div><div class='sp-price-feature'><i class='fa-solid fa-check'></i>Expert Panel Review</div><div class='sp-price-feature'><i class='fa-solid fa-check'></i>Priority Search Placement</div><div class='sp-price-feature'><i class='fa-solid fa-check'></i>Corporate RFP Access</div><a href='dashboard.html' class='btn btn-gold' style='width:100%;margin-top:20px;'>Apply Now</a></div><div class='sp-price-card'><div class='sp-price-tier'>Elite</div><div class='sp-price-amt'>₹7,999</div><div class='sp-price-sub'>Annual · For top performers</div><div class='sp-price-feature'><i class='fa-solid fa-check'></i>All Pro Features</div><div class='sp-price-feature'><i class='fa-solid fa-check'></i>Featured in Homepage</div><div class='sp-price-feature'><i class='fa-solid fa-check'></i>Media & Press Features</div><div class='sp-price-feature'><i class='fa-solid fa-check'></i>Annual Awards Eligibility</div><a href='contact.html' class='btn btn-outline' style='width:100%;margin-top:20px;'>Contact Us</a></div></div>") +
  (Cta "Ready to Become a Verified Trainer?" "Earn the trust signal that makes clients choose you over the competition." "Apply Now" "dashboard.html" "Learn About the Process" "verification-process.html")

MakePage "become-verified.html" "Become a Verified Trainer | World Trainer Forum — Earn the Trust Badge" "Apply for trainer verification on World Trainer Forum and earn the badge that attracts premium corporate clients. Verified trainers get 4× more inquiries and priority search placement." `
  (Bc @(@{label='Become Verified'})) "Trust & Credibility" "Become a Verified" "Professional Trainer" "Get the verification badge that corporate clients trust — and unlock premium opportunities, priority placement, and elite trainer benefits." "Apply for Verification" "dashboard.html" "View Verification Process" "verification-process.html" $body

# Trainer Academy
$body = (Sec "Structured Learning" "Master the Art and" "Science of Training" "A comprehensive online learning platform designed to help trainers at every level grow their expertise, business, and impact." `
  (Cards @(
    @{i='fa-solid fa-palette';h='Training Design Mastery';p='Create engaging, outcome-focused programs using modern instructional design frameworks like ADDIE, SAM, and backwards design.'},
    @{i='fa-solid fa-person-chalkboard';h='Advanced Facilitation Skills';p='Master group dynamics, difficult participant management, virtual facilitation, and high-energy delivery techniques.'},
    @{i='fa-solid fa-briefcase';h='Training Business Development';p='Build a profitable training business — from pricing and proposals to client acquisition, retention, and scaling.'},
    @{i='fa-solid fa-film';h='Digital Content Creation';p='Design compelling training videos, interactive e-learning modules, and blended learning programs using modern tools.'},
    @{i='fa-solid fa-chart-bar';h='Measurement & ROI';p='Evaluate training effectiveness using Kirkpatrick Model, ROI methodology, and data-driven impact reporting.'},
    @{i='fa-solid fa-robot';h='AI for Trainers';p='Leverage artificial intelligence to create content faster, personalize learning, and automate administrative tasks.'}
  ))) +
  (Stats @(@{n='120+';l='Courses Available'}, @{n='85%';l='Completion Rate'}, @{n='4.9★';l='Learner Rating'}, @{n='Lifetime';l='Access Included'})) +
  (Cta "Start Learning Today" "Join thousands of trainers upgrading their skills through World Trainer Forum Academy." "Explore Courses" "learning-center.html" "View Certifications" "certification-support.html")

MakePage "trainer-academy.html" "Trainer Academy | World Trainer Forum — Professional Development for Trainers" "Level up your training career with World Trainer Forum Academy. 120+ courses on training design, facilitation, business development, AI tools, and professional certification prep." `
  (Bc @(@{label='Trainer Academy'})) "Professional Development" "Trainer Academy for" "Skill Excellence" "A comprehensive learning platform built for trainers — designed to accelerate your expertise, credibility, and income." "Explore Courses" "learning-center.html" "Get Certified" "certification-support.html" $body

# Learning Center
$body = (Sec "Resource Library" "Your Learning" "Hub Awaits" "Curated content for trainers at every career stage — from foundational concepts to advanced strategic topics." `
  "<div class='sp-grid-3' style='margin-bottom:52px;'><div class='sp-blog-card sp-reveal'><div class='sp-blog-thumb'>📚</div><div class='sp-blog-body'><div class='sp-blog-cat'>Training Design</div><h3 class='sp-blog-title'>The Complete Guide to Writing Learning Objectives That Drive Behavior Change</h3><p class='sp-blog-desc'>Master Bloom's Taxonomy and action verb frameworks to write learning objectives that actually predict on-the-job performance change.</p><div class='sp-blog-meta'><span>8 min read</span><a href='#' style='color:var(--gold);'>Read →</a></div></div></div><div class='sp-blog-card sp-reveal sp-reveal-d1'><div class='sp-blog-thumb'>🎯</div><div class='sp-blog-body'><div class='sp-blog-cat'>Facilitation</div><h3 class='sp-blog-title'>10 Techniques to Handle Difficult Participants Without Losing Control of Your Room</h3><p class='sp-blog-desc'>Practical scripts and de-escalation strategies for managing resistant, domineering, or disengaged learners in any training environment.</p><div class='sp-blog-meta'><span>12 min read</span><a href='#' style='color:var(--gold);'>Read →</a></div></div></div><div class='sp-blog-card sp-reveal sp-reveal-d2'><div class='sp-blog-thumb'>💰</div><div class='sp-blog-body'><div class='sp-blog-cat'>Business Growth</div><h3 class='sp-blog-title'>How to Price Your Training Services: The Framework Top Trainers Use</h3><p class='sp-blog-desc'>Stop undercharging. Learn the value-based pricing strategy that helps trainers command premium rates without losing clients.</p><div class='sp-blog-meta'><span>10 min read</span><a href='#' style='color:var(--gold);'>Read →</a></div></div></div><div class='sp-blog-card sp-reveal sp-reveal-d1'><div class='sp-blog-thumb'>🤖</div><div class='sp-blog-body'><div class='sp-blog-cat'>AI & Technology</div><h3 class='sp-blog-title'>How Smart Trainers Are Using ChatGPT to Create Better Content 10× Faster</h3><p class='sp-blog-desc'>Prompts, workflows, and ethical guidelines for using AI to design training materials, assessments, and e-learning scripts.</p><div class='sp-blog-meta'><span>9 min read</span><a href='#' style='color:var(--gold);'>Read →</a></div></div></div><div class='sp-blog-card sp-reveal sp-reveal-d2'><div class='sp-blog-thumb'>📊</div><div class='sp-blog-body'><div class='sp-blog-cat'>Measurement</div><h3 class='sp-blog-title'>Proving Training ROI: A Step-by-Step Guide to Kirkpatrick Level 4 Evaluation</h3><p class='sp-blog-desc'>The complete methodology for demonstrating business impact from your training programs — with templates and case studies.</p><div class='sp-blog-meta'><span>15 min read</span><a href='#' style='color:var(--gold);'>Read →</a></div></div></div><div class='sp-blog-card sp-reveal sp-reveal-d3'><div class='sp-blog-thumb'>🌐</div><div class='sp-blog-body'><div class='sp-blog-cat'>Virtual Training</div><h3 class='sp-blog-title'>The Virtual Trainer's Playbook: Keeping Learners Engaged Across Time Zones</h3><p class='sp-blog-desc'>Proven engagement techniques, technology tools, and facilitation rhythms for delivering memorable virtual training at global scale.</p><div class='sp-blog-meta'><span>11 min read</span><a href='#' style='color:var(--gold);'>Read →</a></div></div></div></div>") +
  (Cta "Access Your Full Learning Library" "Thousands of articles, guides, and courses — all built by and for professional trainers." "View All Resources" "trainer-resources.html" "Join the Academy" "trainer-academy.html")

MakePage "learning-center.html" "Learning Center | World Trainer Forum — Articles, Guides & Courses for Trainers" "Access World Trainer Forum's free Learning Center — articles, how-to guides, templates, and courses on training design, facilitation, business growth, and professional development." `
  (Bc @(@{label='Learning Center'})) "Knowledge Hub" "Your Learning" "Center" "Hundreds of expert articles, guides, and resources curated for professional trainers, coaches, and L&D specialists." "Browse Articles" "#" "Join Trainer Academy" "trainer-academy.html" $body

# Certification Support
$body = (Sec "Global Certifications" "Navigate Your" "Certification Journey" "Expert guidance on the world's most recognized training and coaching certifications — from ICF to ATD to SHRM." `
  (Cards @(
    @{i='fa-solid fa-certificate';h='ICF Coaching Credentials';p='Guidance on ICF ACC, PCC, and MCC credentials — from mentor coaching hours to portfolio preparation and exam support.'},
    @{i='fa-solid fa-award';h='ATD Certifications';p='Support for the ATD CPTD (Certified Professional in Talent Development) — the gold standard for L&D professionals.'},
    @{i='fa-solid fa-user-tie';h='SHRM Certifications';p='Preparation resources and study guides for SHRM-CP and SHRM-SCP for HR and training professionals.'},
    @{i='fa-solid fa-star';h='HRCI Credentials';p='Support for PHR, SPHR, and GPHR credentials recognized globally in HR and people development.'},
    @{i='fa-solid fa-laptop';h='Digital Learning Certifications';p='eLearning Guild, DevLearn, and instructional design certifications for trainers building digital learning programs.'},
    @{i='fa-solid fa-handshake';h='Coaching Accreditations';p='ICF, EMCC, AC, and BCC accreditation pathways — with mentor matching and supervision support.'}
  ))) +
  (Steps @(
    @{h='Assess Your Readiness';p='Take our free certification readiness assessment to identify your strongest credential path based on experience and goals.'},
    @{h='Get a Certification Mentor';p='Be matched with a certified trainer-mentor who has already earned your target credential and can guide your preparation.'},
    @{h='Study, Apply & Celebrate';p='Access curated study resources, join a peer study group, complete your application, and earn your credential.'}
  )) +
  (Cta "Start Your Certification Journey Today" "Get matched with a certification mentor and fast-track your professional credentials." "Get a Mentor" "find-trainers.html" "Explore Trainer Academy" "trainer-academy.html")

MakePage "certification-support.html" "Certification Support | World Trainer Forum — ICF, ATD, SHRM Guidance" "Get expert support for ICF, ATD, SHRM, HRCI, and other professional training certifications. Mentor matching, study resources, and preparation guidance on World Trainer Forum." `
  (Bc @(@{label='Certification Support'})) "Professional Credentials" "Your Certification" "Support Hub" "Expert guidance, mentor matching, and study resources for the world's most recognized training, coaching, and L&D certifications." "Find a Certification Mentor" "find-trainers.html" "Join Trainer Academy" "trainer-academy.html" $body

# Events & Workshops
$body = (Sec "Upcoming Events" "Live Learning" "Experiences" "Exclusive workshops, masterclasses, conferences, and networking events for World Trainer Forum members." `
  "<div class='sp-grid-3' style='margin-bottom:52px;'>" +
  "<div class='sp-card sp-reveal'><div style='display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;'><div class='sp-card-icon' style='margin:0;'><i class='fa-solid fa-microphone-lines'></i></div><span style='font-size:.7rem;background:rgba(74,222,128,0.1);color:var(--ok);padding:4px 10px;border-radius:999px;border:1px solid rgba(74,222,128,0.2);'>Live Webinar</span></div><h3>The Future of Corporate Training in 2026</h3><p>Industry experts share predictions on AI, virtual reality, and personalized learning — and what it means for your practice.</p><p style='font-size:.78rem;color:var(--gold);margin-top:12px;'><i class='fa-solid fa-calendar'></i> July 15, 2026 · 3:00 PM IST</p></div>" +
  "<div class='sp-card sp-reveal sp-reveal-d1'><div style='display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;'><div class='sp-card-icon' style='margin:0;'><i class='fa-solid fa-users'></i></div><span style='font-size:.7rem;background:rgba(197,160,89,0.1);color:var(--gold);padding:4px 10px;border-radius:999px;border:1px solid rgba(197,160,89,0.2);'>Workshop</span></div><h3>Pricing Your Training Services for Premium Clients</h3><p>Hands-on workshop on value-based pricing, proposal writing, and negotiating contracts with large organizations.</p><p style='font-size:.78rem;color:var(--gold);margin-top:12px;'><i class='fa-solid fa-calendar'></i> July 22, 2026 · 10:00 AM IST</p></div>" +
  "<div class='sp-card sp-reveal sp-reveal-d2'><div style='display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;'><div class='sp-card-icon' style='margin:0;'><i class='fa-solid fa-trophy'></i></div><span style='font-size:.7rem;background:rgba(99,179,237,0.1);color:var(--info);padding:4px 10px;border-radius:999px;border:1px solid rgba(99,179,237,0.2);'>Annual Summit</span></div><h3>World Trainer Forum Global Summit 2026</h3><p>Our flagship annual conference — 3 days of keynotes, workshops, and networking with the world's top L&D professionals.</p><p style='font-size:.78rem;color:var(--gold);margin-top:12px;'><i class='fa-solid fa-calendar'></i> September 10–12, 2026 · Mumbai</p></div>" +
  "</div>") +
  (Cta "Don't Miss Our Next Live Event" "Join thousands of trainers who learn and grow together at World Trainer Forum events." "View All Events" "contact.html" "Join the Community" "community-forum.html")

MakePage "events-workshops.html" "Events & Workshops | World Trainer Forum — Live Learning for Trainers" "Attend exclusive webinars, workshops, masterclasses, and annual conferences for professional trainers on World Trainer Forum. Live events that accelerate your career and business growth." `
  (Bc @(@{label='Events & Workshops'})) "Live Learning" "Events & Workshops" "for Trainers" "Exclusive live learning experiences — webinars, masterclasses, workshops, and our annual summit — designed for professional trainers, coaches, and L&D experts." "View Upcoming Events" "#" "Join the Community" "community-forum.html" $body

# Earnings Program
$body = (Sec "Income Potential" "How Much Can You" "Earn on This Platform" "World Trainer Forum's earnings model is built to maximize your income — with multiple revenue streams and performance incentives." `
  (Stats @(@{n='₹2.4L';l='Avg Monthly Earnings (Top Trainers)'}, @{n='₹50K+';l='Average Session Fee (Senior Trainers)'}, @{n='0%';l='Commission for First 3 Months'}, @{n='10%';l='Platform Commission Thereafter'}))) +
  (Sec "Revenue Streams" "Multiple Ways to" "Earn" "" `
  (Cards @(
    @{i='fa-solid fa-calendar-check';h='1:1 Training Sessions';p='Set your own rates and earn from every individually booked coaching or training session — from ₹1,500 to ₹50,000+ per session.'},
    @{i='fa-solid fa-building';h='Corporate Programs';p='Access large enterprise training contracts through our corporate sales team — often worth ₹5–50 lakhs per engagement.'},
    @{i='fa-solid fa-users';h='Group Workshops';p='Run group workshops for 10–200 participants at premium group rates, with our platform handling registrations and payments.'},
    @{i='fa-solid fa-share-nodes';h='Referral Bonuses';p='Earn ₹2,000–₹10,000 for every new trainer you refer who gets verified and completes their first booking.'},
    @{i='fa-solid fa-video';h='Recorded Programs';p='Create and sell recorded training programs, courses, and resource packs directly through your trainer dashboard.'},
    @{i='fa-solid fa-star';h='Elite Trainer Bonus';p='Top-rated verified trainers with 4.8+ ratings and 100+ sessions qualify for our Elite Trainer bonus pool — paid quarterly.'}
  ))) +
  (Cta "Start Earning Today" "Build a rewarding, high-income training practice on the world's fastest-growing trainer marketplace." "List Your Profile" "dashboard.html" "View Success Stories" "success-stories.html")

MakePage "earnings-program.html" "Trainer Earnings Program | World Trainer Forum — Maximize Your Training Income" "Discover how professional trainers earn on World Trainer Forum. Multiple revenue streams, 0% commission for 3 months, corporate contracts, and elite trainer bonuses." `
  (Bc @(@{label='Earnings Program'})) "Trainer Income" "Maximize Your" "Earning Potential" "World Trainer Forum is built to help trainers earn more — with competitive commission, corporate contracts, referral bonuses, and elite tier incentives." "Start Earning" "dashboard.html" "View Success Stories" "success-stories.html" $body

# Partner Program
$body = (Sec "Partnership Opportunities" "Grow Together With" "World Trainer Forum" "Join our global partner ecosystem and unlock co-marketing, revenue sharing, and joint go-to-market opportunities." `
  (Cards @(
    @{i='fa-solid fa-handshake';h='Trainer Referral Partners';p='Refer clients or trainers to World Trainer Forum and earn generous referral commissions on every successful booking or registration.'},
    @{i='fa-solid fa-building-columns';h='Corporate HR Partners';p='HR consultancies and talent development firms can white-label our platform for their corporate clients — with custom branding options.'},
    @{i='fa-solid fa-university';h='Academic Institution Partners';p='Universities, business schools, and training institutes can co-brand programs and offer exclusive alumni access to our trainer marketplace.'},
    @{i='fa-solid fa-laptop';h='Technology Partners';p='LMS providers, HRMS platforms, and learning technology companies can integrate with our API for seamless trainer marketplace access.'},
    @{i='fa-solid fa-globe';h='Global Distribution Partners';p='Training agencies and staffing firms outside India can license our platform for local market deployment with revenue sharing.'},
    @{i='fa-solid fa-star';h='Content Partners';p='Publishers, thought leaders, and content creators can co-create and distribute training content through our platform and community.'}
  ))) +
  (Cta "Become a Platform Partner" "Join our partner ecosystem and build a revenue-generating relationship with the world's fastest-growing trainer marketplace." "Apply to Partner" "contact.html" "Learn About Affiliates" "affiliate-program.html")

MakePage "partner-program.html" "Partner Program | World Trainer Forum — Co-Grow with Us" "Join World Trainer Forum's partner program as a referral partner, corporate HR partner, academic institution, or technology integrator. Co-market, co-sell, and co-grow with us." `
  (Bc @(@{label='Partner Program'})) "Strategic Partnerships" "Partner With" "World Trainer Forum" "Join our global partner ecosystem — built for training firms, HR consultancies, academic institutions, technology companies, and referral partners." "Become a Partner" "contact.html" "Affiliate Program" "affiliate-program.html" $body

Write-Host "Trainer pages done."

# ════════════════════════════════════════════════════════
# CATEGORY CHIP PAGES
# ════════════════════════════════════════════════════════

$categories = @(
  @{
    file='leadership.html'; title='Leadership Training & Coaching'; desc='Find the best leadership trainers and coaches on World Trainer Forum. Programs for executives, managers, and emerging leaders across all industries.'; label='Leadership'; h1='Leadership Trainers &'; h1g='Coaches Worldwide'; heroDesc='Browse 2,800+ certified leadership trainers and coaches. From first-time managers to C-suite executives — find the expert who will transform your leadership journey.'; b1='Find Leadership Trainers'; b1h='find-trainers.html'; b2='Leadership Programs'; b2h='leadership-training.html';
    bc=(Bc @(@{href='categories.html';label='Categories'},@{label='Leadership'}));
    cards=@(
      @{i='fa-solid fa-crown';h='Executive Leadership';p='Strategic thinking, organizational vision, and enterprise-scale leadership for senior executives and C-suite leaders.'},
      @{i='fa-solid fa-users-gear';h='People Management';p='Build and lead high-performance teams through coaching, delegation, performance management, and conflict resolution.'},
      @{i='fa-solid fa-brain';h='Emotional Intelligence';p='Develop the self-awareness, empathy, and social intelligence that distinguish exceptional leaders from average managers.'},
      @{i='fa-solid fa-chess';h='Strategic Thinking';p='Analyze complex business challenges, think long-term, and make high-quality decisions under pressure and ambiguity.'},
      @{i='fa-solid fa-seedling';h='Leadership Pipeline';p='Identify and develop high-potential talent for future leadership roles through structured succession programs.'},
      @{i='fa-solid fa-earth-americas';h='Cross-Cultural Leadership';p='Lead diverse, global teams with cultural intelligence, inclusive leadership practices, and global mindset.'}
    )
  },
  @{
    file='communication-skills.html'; title='Communication Skills Training'; desc='Master professional communication with certified trainers on World Trainer Forum. Business communication, public speaking, presentation skills, and interpersonal communication programs.'; label='Communication Skills'; h1='Communication Skills'; h1g='Training Programs'; heroDesc='Connect with expert communication trainers who specialize in business writing, presentation skills, executive presence, and workplace communication.'; b1='Find Communication Trainers'; b1h='find-trainers.html'; b2='Public Speaking Training'; b2h='public-speaking.html';
    bc=(Bc @(@{href='categories.html';label='Categories'},@{label='Communication Skills'}));
    cards=@(
      @{i='fa-solid fa-microphone';h='Executive Presentation Skills';p='Command the room with impactful presentations — structure, delivery, storytelling, and handling Q&A with confidence.'},
      @{i='fa-solid fa-pen-to-square';h='Business Writing';p='Write emails, reports, proposals, and business documents that are clear, concise, and persuasive.'},
      @{i='fa-solid fa-comments';h='Interpersonal Communication';p='Build stronger relationships through active listening, assertive communication, and emotional intelligence.'},
      @{i='fa-solid fa-video';h='Virtual Communication';p='Excel in video calls, virtual meetings, and remote collaboration with presence, clarity, and engagement.'},
      @{i='fa-solid fa-users';h='Influencing Without Authority';p='Persuade stakeholders, align diverse teams, and drive decisions without relying on positional power.'},
      @{i='fa-solid fa-shield-halved';h='Difficult Conversation';p='Navigate feedback, conflict, and sensitive workplace conversations with empathy, honesty, and professionalism.'}
    )
  },
  @{
    file='ai-technology.html'; title='AI & Technology Training'; desc='Find certified AI, machine learning, and technology trainers on World Trainer Forum. From AI literacy for business leaders to deep learning for data scientists.'; label='AI & Technology'; h1='AI & Technology'; h1g='Training Experts'; heroDesc='The future belongs to those who understand AI and technology. Find certified trainers in artificial intelligence, machine learning, cloud, data, and digital transformation.'; b1='Find AI & Tech Trainers'; b1h='find-trainers.html'; b2='Technology Programs'; b2h='technology-training.html';
    bc=(Bc @(@{href='categories.html';label='Categories'},@{label='AI & Technology'}));
    cards=@(
      @{i='fa-solid fa-robot';h='Artificial Intelligence & ML';p='AI fundamentals, machine learning, deep learning, and generative AI — for both technical practitioners and business leaders.'},
      @{i='fa-solid fa-cloud';h='Cloud Architecture';p='AWS, Azure, Google Cloud — architecture, deployment, migration, and cost optimization for modern cloud teams.'},
      @{i='fa-solid fa-shield-halved';h='Cybersecurity';p='Threat detection, security architecture, ethical hacking, and compliance training for security teams and employees.'},
      @{i='fa-solid fa-chart-pie';h='Data Science & Analytics';p='Python, R, SQL, Power BI, Tableau — from data fundamentals to advanced predictive modelling and visualization.'},
      @{i='fa-solid fa-code';h='Software Engineering';p='Full stack development, DevOps, agile, and modern software engineering practices for development teams.'},
      @{i='fa-solid fa-gears';h='Digital Transformation';p='Guide organizations through technology change — tools adoption, process automation, and digital culture building.'}
    )
  },
  @{
    file='sales-marketing.html'; title='Sales & Marketing Training'; desc='Find expert sales and marketing trainers on World Trainer Forum. B2B sales, digital marketing, brand strategy, and revenue growth programs for individuals and teams.'; label='Sales & Marketing'; h1='Sales & Marketing'; h1g='Training Programs'; heroDesc='Close more deals, build stronger brands, and grow revenue faster with certified sales and marketing trainers from World Trainer Forum.'; b1='Find Sales Trainers'; b1h='find-trainers.html'; b2='Sales Training Programs'; b2h='sales-training.html';
    bc=(Bc @(@{href='categories.html';label='Categories'},@{label='Sales & Marketing'}));
    cards=@(
      @{i='fa-solid fa-handshake';h='B2B Consultative Selling';p='Master value-based selling, discovery conversations, and solution presentations for complex B2B sales cycles.'},
      @{i='fa-solid fa-bullhorn';h='Digital Marketing';p='SEO, paid media, social media marketing, content strategy, and performance analytics for modern marketers.'},
      @{i='fa-solid fa-chart-line';h='Sales Leadership';p='Build and lead high-performance sales teams — coaching, forecasting, CRM optimization, and revenue operations.'},
      @{i='fa-solid fa-envelope';h='Email Marketing & Automation';p='Build email sequences, automated nurture campaigns, and conversion-optimized newsletters that drive revenue.'},
      @{i='fa-solid fa-globe';h='Brand Strategy';p='Develop compelling brand positioning, messaging architecture, and go-to-market strategies for differentiation.'},
      @{i='fa-solid fa-comments-dollar';h='Negotiation & Closing';p='Win deals without discounting — advanced negotiation frameworks and closing strategies for senior sales professionals.'}
    )
  },
  @{
    file='hr-training.html'; title='HR Training Programs'; desc='Find certified HR trainers on World Trainer Forum. HR strategy, talent acquisition, learning & development, HRBP skills, and HR tech training programs for professionals.'; label='HR Training'; h1='HR Training for'; h1g='People Professionals'; heroDesc='Elevate your HR practice with certified trainers specializing in talent management, HRBP strategy, learning design, organizational development, and HR technology.'; b1='Find HR Trainers'; b1h='find-trainers.html'; b2='Corporate HR Solutions'; b2h='corporate-training.html';
    bc=(Bc @(@{href='categories.html';label='Categories'},@{label='HR Training'}));
    cards=@(
      @{i='fa-solid fa-users';h='Strategic HRBP';p='Transition from transactional HR to a strategic business partner — aligning people strategy with organizational goals.'},
      @{i='fa-solid fa-magnifying-glass';h='Talent Acquisition';p='Modern recruiting — employer branding, structured interviews, assessment design, and candidate experience optimization.'},
      @{i='fa-solid fa-graduation-cap';h='Learning & Development';p='Design, deliver, and measure L&D programs — from needs analysis to evaluation and ROI reporting.'},
      @{i='fa-solid fa-chart-bar';h='HR Analytics & Data';p='Use people data to drive evidence-based decisions on workforce planning, attrition, engagement, and productivity.'},
      @{i='fa-solid fa-scale-balanced';h='Employment Law & Compliance';p='Stay legally compliant with training on labor law, workplace ethics, POSH, and global employment regulations.'},
      @{i='fa-solid fa-building';h='Organizational Development';p='Drive culture change, restructuring, mergers, and workforce transformation with OD principles and frameworks.'}
    )
  },
  @{
    file='public-speaking.html'; title='Public Speaking Training'; desc='Find certified public speaking trainers and coaches on World Trainer Forum. Overcome stage fright, master presentations, and become a confident, compelling speaker.'; label='Public Speaking'; h1='Public Speaking'; h1g='Coaches & Trainers'; heroDesc='Transform your communication into a superpower. Find certified public speaking coaches who help professionals, leaders, and entrepreneurs speak with confidence, clarity, and impact.'; b1='Find Speaking Coaches'; b1h='find-trainers.html'; b2='Communication Skills' ; b2h='communication-skills.html';
    bc=(Bc @(@{href='categories.html';label='Categories'},@{label='Public Speaking'}));
    cards=@(
      @{i='fa-solid fa-microphone';h='Stage Presence & Confidence';p='Overcome stage fright and develop commanding presence — posture, voice, eye contact, and nervous energy management.'},
      @{i='fa-solid fa-person-chalkboard';h='Corporate Presentations';p='Deliver boardroom-level presentations that engage, persuade, and move stakeholders to action.'},
      @{i='fa-solid fa-film';h='Storytelling for Impact';p='Structure compelling narratives that make your audience feel, remember, and act — the core of influential speaking.'},
      @{i='fa-solid fa-video';h='Virtual & Webinar Delivery';p='Captivate online audiences through camera presence, virtual engagement tools, and digital storytelling techniques.'},
      @{i='fa-solid fa-award';h='TEDx & Conference Speaking';p='Prepare for TEDx talks, keynote addresses, and conference presentations with expert speaker coaching and script development.'},
      @{i='fa-solid fa-comments';h='Impromptu Speaking';p='Think on your feet, handle Q&A brilliantly, and speak persuasively without preparation through structured practice.'}
    )
  },
  @{
    file='personal-development.html'; title='Personal Development Training'; desc='Find personal development coaches and trainers on World Trainer Forum. Goal setting, productivity, mindset, confidence, and life skills programs for career and personal growth.'; label='Personal Development'; h1='Personal Development'; h1g='Coaching & Training'; heroDesc='Invest in your most important asset — yourself. Connect with certified personal development coaches and trainers who help you achieve your goals, build confidence, and unlock your potential.'; b1='Find a Coach'; b1h='find-trainers.html'; b2='Executive Coaching'; b2h='executive-coaching.html';
    bc=(Bc @(@{href='categories.html';label='Categories'},@{label='Personal Development'}));
    cards=@(
      @{i='fa-solid fa-brain';h='Mindset & Confidence';p='Overcome limiting beliefs, build unshakeable confidence, and develop the growth mindset that accelerates achievement.'},
      @{i='fa-solid fa-bullseye';h='Goal Setting & Achievement';p='Set compelling goals, create actionable plans, and build systems that ensure you follow through consistently.'},
      @{i='fa-solid fa-clock';h='Productivity & Time Mastery';p='Deep work, priority management, and energy optimization — systems for peak performance without burnout.'},
      @{i='fa-solid fa-heart';h='Emotional Intelligence';p='Develop self-awareness, emotional regulation, and empathy to improve relationships and personal effectiveness.'},
      @{i='fa-solid fa-person-running';h='Habit Formation';p='Build lasting positive habits and break destructive patterns using neuroscience-based behavioral change frameworks.'},
      @{i='fa-solid fa-scale-balanced';h='Work-Life Balance';p='Create boundaries, recover from burnout, and design a sustainable lifestyle that supports both ambition and wellbeing.'}
    )
  },
  @{
    file='business-strategy.html'; title='Business Strategy Training'; desc='Find business strategy trainers and coaches on World Trainer Forum. Strategic planning, competitive analysis, business model innovation, and executive strategy programs.'; label='Business Strategy'; h1='Business Strategy'; h1g='Training Programs'; heroDesc='Sharpen your strategic thinking, master business analysis frameworks, and develop the strategic leadership skills that drive organizational growth and competitive advantage.'; b1='Find Strategy Trainers'; b1h='find-trainers.html'; b2='Executive Coaching'; b2h='executive-coaching.html';
    bc=(Bc @(@{href='categories.html';label='Categories'},@{label='Business Strategy'}));
    cards=@(
      @{i='fa-solid fa-chess-king';h='Strategic Planning';p='Lead your organization through structured strategy development — vision, mission, OKRs, and strategic roadmapping.'},
      @{i='fa-solid fa-chart-line';h='Competitive Analysis';p='Analyze industry dynamics, competitive positioning, and market opportunities using Porter, SWOT, and Blue Ocean frameworks.'},
      @{i='fa-solid fa-lightbulb';h='Business Model Innovation';p='Redesign your business model for the digital age — value proposition, revenue streams, and platform economics.'},
      @{i='fa-solid fa-handshake';h='M&A & Corporate Development';p='Navigate mergers, acquisitions, joint ventures, and strategic partnerships with structured frameworks and financial thinking.'},
      @{i='fa-solid fa-globe';h='Go-to-Market Strategy';p='Launch products, enter new markets, and scale revenue with evidence-based go-to-market planning and execution.'},
      @{i='fa-solid fa-sitemap';h='Organizational Strategy';p='Align structure, culture, people, and processes to your strategic direction for superior execution and results.'}
    )
  },
  @{
    file='finance-training.html'; title='Finance Training Programs'; desc='Find certified finance trainers on World Trainer Forum. Financial modeling, corporate finance, investment analysis, accounting, and business finance programs for professionals.'; label='Finance Training'; h1='Finance Training for'; h1g='Business Professionals'; heroDesc='Build financial acumen with certified finance trainers — from business finance fundamentals to advanced financial modeling, investment analysis, and corporate strategy.'; b1='Find Finance Trainers'; b1h='find-trainers.html'; b2='Business Strategy' ; b2h='business-strategy.html';
    bc=(Bc @(@{href='categories.html';label='Categories'},@{label='Finance Training'}));
    cards=@(
      @{i='fa-solid fa-chart-bar';h='Financial Modeling';p='Build dynamic financial models in Excel — 3-statement, DCF, LBO, and scenario analysis for finance professionals.'},
      @{i='fa-solid fa-building-columns';h='Corporate Finance';p='Capital structure, valuation, cost of capital, M&A analysis, and financial decision-making for business leaders.'},
      @{i='fa-solid fa-coins';h='Investment Analysis';p='Equity research, portfolio management, and investment frameworks for finance professionals and investors.'},
      @{i='fa-solid fa-receipt';h='Accounting & Reporting';p='IFRS, Ind AS, financial statements analysis, and management accounting for non-finance managers and professionals.'},
      @{i='fa-solid fa-file-invoice-dollar';h='Finance for Non-Finance Managers';p='Demystify P&L, balance sheets, cash flow, and budgeting for managers who need financial fluency to lead better.'},
      @{i='fa-solid fa-piggy-bank';h='Personal Finance & Wealth';p='Investment planning, tax optimization, retirement strategy, and wealth creation for individuals and professionals.'}
    )
  },
  @{
    file='health-wellness.html'; title='Health & Wellness Coaching'; desc='Find certified health and wellness coaches on World Trainer Forum. Workplace wellbeing, mental health, fitness, nutrition, and stress management programs for individuals and organizations.'; label='Health & Wellness'; h1='Health & Wellness'; h1g='Coaches & Programs'; heroDesc='Invest in your greatest asset — your health. Find certified wellness coaches, fitness trainers, mental health specialists, and nutrition experts for individual and corporate wellbeing programs.'; b1='Find Wellness Coaches'; b1h='find-trainers.html'; b2='Corporate Wellbeing'; b2h='corporate-training.html';
    bc=(Bc @(@{href='categories.html';label='Categories'},@{label='Health & Wellness'}));
    cards=@(
      @{i='fa-solid fa-heart-pulse';h='Corporate Wellness Programs';p='Reduce burnout, boost productivity, and lower absenteeism with structured employee wellness initiatives for your organization.'},
      @{i='fa-solid fa-brain';h='Mental Health & Resilience';p='Stress management, anxiety reduction, mindfulness, and psychological resilience training for high-pressure professionals.'},
      @{i='fa-solid fa-person-running';h='Fitness & Physical Wellness';p='Certified fitness coaches for workplace wellness challenges, ergonomics, and physical health programs.'},
      @{i='fa-solid fa-apple-whole';h='Nutrition Coaching';p='Evidence-based nutrition guidance for energy management, weight loss, sports performance, and preventive health.'},
      @{i='fa-solid fa-spa';h='Mindfulness & Meditation';p='Mindfulness-based stress reduction, meditation practices, and breathwork for calm, focus, and peak performance.'},
      @{i='fa-solid fa-scale-balanced';h='Work-Life Integration';p='Create sustainable boundaries, recover from overwork, and design a lifestyle that supports both high performance and joy.'}
    )
  }
)

foreach ($cat in $categories) {
  $cardHtml = "<div class='sp-grid-3' style='margin-bottom:52px;'>"
  $idx = 0
  foreach ($c in $cat.cards) {
    $d = @('','sp-reveal-d1','sp-reveal-d2')[$idx % 3]
    $cardHtml += "<div class='sp-card sp-reveal $d'><div class='sp-card-icon'><i class='$($c.i)'></i></div><h3>$($c.h)</h3><p>$($c.p)</p></div>"
    $idx++
  }
  $cardHtml += '</div>'

  $body = (Sec "Core Specializations" "$($cat.label) Specializations" "Available Now" "Browse our curated experts across every $($cat.label.ToLower()) specialty." $cardHtml) +
    (Faqs @(
      @{q="How do I find the best $($cat.label) trainer for me?";a="Use our smart filters to sort by specialty, experience, price, delivery mode, and rating. Read verified client reviews and watch trainer intro videos before booking."},
      @{q="Do you offer corporate $($cat.label) programs?";a="Yes — we have trainers who specialize in corporate group programs for teams of 10 to 1,000+. Contact our corporate team for a customized proposal."},
      @{q="Can sessions be delivered online?";a="Absolutely. All our trainers offer virtual sessions via Zoom, Microsoft Teams, or Google Meet — with the same quality as in-person delivery."}
    )) +
    (Cta "Ready to Find Your $($cat.label) Expert?" "Browse verified trainers and book your first session today." "Find Trainers" "find-trainers.html" "Corporate Programs" "corporate-training.html")

  MakePage $cat.file "$($cat.title) | World Trainer Forum" $cat.desc $cat.bc $cat.label $cat.h1 $cat.h1g $cat.heroDesc $cat.b1 $cat.b1h $cat.b2 $cat.b2h $body
}

Write-Host "Category pages done."

# ════════════════════════════════════════════════════════
# COMPANY PAGES
# ════════════════════════════════════════════════════════

# Careers
$careersBody = @"
<section class="sp-section"><div class="sp-container">
<div class="sp-section-hdr center sp-reveal">
  <span class="sp-section-label">Open Positions</span>
  <h2 class="sp-section-title">Join Our <span class="a">Growing Team</span></h2>
  <p class="sp-section-sub">We're a remote-first, mission-driven team building the world's most trusted trainer marketplace. Come build with us.</p>
</div>
<div style="display:flex;flex-direction:column;gap:14px;margin-bottom:52px;">
  <div class="sp-job-card sp-reveal"><div class="sp-job-icon"><i class="fa-solid fa-code"></i></div><div class="sp-job-info"><div class="sp-job-title">Senior Full Stack Engineer</div><div class="sp-job-dept">Engineering · Remote</div><div class="sp-job-tags"><span class="sp-job-tag">React</span><span class="sp-job-tag">Node.js</span><span class="sp-job-tag">MongoDB</span><span class="sp-job-tag">Full-time</span></div></div><a href="contact.html" class="btn btn-outline btn-sm">Apply Now</a></div>
  <div class="sp-job-card sp-reveal sp-reveal-d1"><div class="sp-job-icon"><i class="fa-solid fa-bullhorn"></i></div><div class="sp-job-info"><div class="sp-job-title">Head of Growth Marketing</div><div class="sp-job-dept">Marketing · Mumbai / Remote</div><div class="sp-job-tags"><span class="sp-job-tag">SEO</span><span class="sp-job-tag">Performance Marketing</span><span class="sp-job-tag">Full-time</span></div></div><a href="contact.html" class="btn btn-outline btn-sm">Apply Now</a></div>
  <div class="sp-job-card sp-reveal sp-reveal-d2"><div class="sp-job-icon"><i class="fa-solid fa-briefcase"></i></div><div class="sp-job-info"><div class="sp-job-title">Enterprise Account Manager</div><div class="sp-job-dept">Sales · Delhi / Mumbai</div><div class="sp-job-tags"><span class="sp-job-tag">B2B Sales</span><span class="sp-job-tag">Corporate</span><span class="sp-job-tag">Full-time</span></div></div><a href="contact.html" class="btn btn-outline btn-sm">Apply Now</a></div>
  <div class="sp-job-card sp-reveal sp-reveal-d1"><div class="sp-job-icon"><i class="fa-solid fa-palette"></i></div><div class="sp-job-info"><div class="sp-job-title">Senior UI/UX Designer</div><div class="sp-job-dept">Product · Remote</div><div class="sp-job-tags"><span class="sp-job-tag">Figma</span><span class="sp-job-tag">Design Systems</span><span class="sp-job-tag">Full-time</span></div></div><a href="contact.html" class="btn btn-outline btn-sm">Apply Now</a></div>
  <div class="sp-job-card sp-reveal sp-reveal-d2"><div class="sp-job-icon"><i class="fa-solid fa-users"></i></div><div class="sp-job-info"><div class="sp-job-title">Trainer Success Manager</div><div class="sp-job-dept">Operations · Bangalore / Remote</div><div class="sp-job-tags"><span class="sp-job-tag">L&D</span><span class="sp-job-tag">Account Management</span><span class="sp-job-tag">Full-time</span></div></div><a href="contact.html" class="btn btn-outline btn-sm">Apply Now</a></div>
</div>
<div class="sp-section-hdr center sp-reveal">
  <span class="sp-section-label">Why Work Here</span>
  <h2 class="sp-section-title">Culture & <span class="a">Benefits</span></h2>
</div>
$(Cards @(
  @{i='fa-solid fa-laptop-house';h='Remote-First Culture';p='Work from anywhere in India (or the world). We trust you to do your best work from wherever you are most productive.'},
  @{i='fa-solid fa-graduation-cap';h='Learning Budget';p='₹1 Lakh annual L&D budget to invest in courses, certifications, conferences, and books of your choice.'},
  @{i='fa-solid fa-heart-pulse';h='Health & Wellness';p='Comprehensive health insurance, mental health support, and wellness allowance for you and your family.'},
  @{i='fa-solid fa-chart-line';h='Equity & Growth';p='ESOPs for senior hires, performance bonuses, and a clear career growth path in a fast-scaling startup.'},
  @{i='fa-solid fa-people-group';h='Diverse & Inclusive Team';p='A team of 60+ people from 12 states and 5 countries — built on mutual respect, diversity of thought, and psychological safety.'},
  @{i='fa-solid fa-plane';h='Annual Offsite';p='A fully paid annual team offsite for all employees — bonding, strategy, and celebration.'}
) 3)
</div></section>
$(Cta "Don't See Your Role?" "We're always looking for extraordinary people. Send us your resume and tell us how you'd contribute." "Send Open Application" "contact.html" "About Us" "about.html")
"@
MakePage "careers.html" "Careers at World Trainer Forum — Join Our Mission-Driven Team" "Explore career opportunities at World Trainer Forum. Join a remote-first, mission-driven team building the world's most trusted marketplace for professional trainers, coaches, and L&D experts." `
  (Bc @(@{label='Careers'})) "Join Our Team" "Build the Future of" "Professional Learning" "We're hiring exceptional people who are passionate about transforming how professionals learn, grow, and develop worldwide." "View Open Positions" "#" "About Our Culture" "about.html" $careersBody

# Press
$pressBody = @"
<section class="sp-section"><div class="sp-container">
<div class="sp-section-hdr center sp-reveal">
  <span class="sp-section-label">In the News</span>
  <h2 class="sp-section-title">World Trainer Forum in <span class="a">the Press</span></h2>
</div>
<div class="sp-grid-3" style="margin-bottom:52px;">
  <div class="sp-card sp-reveal"><div style="font-size:.72rem;color:var(--tm);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Economic Times · May 2026</div><h3>"The Platform Disrupting India's Corporate Training Market"</h3><p style="font-size:.82rem;color:var(--ts);margin-top:8px;">How World Trainer Forum is connecting 50,000+ trainers with enterprise clients across 120 countries.</p><a href="#" style="color:var(--gold);font-size:.78rem;margin-top:12px;display:inline-block;">Read Article →</a></div>
  <div class="sp-card sp-reveal sp-reveal-d1"><div style="font-size:.72rem;color:var(--tm);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Forbes India · March 2026</div><h3>"30 Under 30: The Entrepreneurs Reimagining Education"</h3><p style="font-size:.82rem;color:var(--ts);margin-top:8px;">World Trainer Forum founders featured in Forbes India's annual list of young innovators in education technology.</p><a href="#" style="color:var(--gold);font-size:.78rem;margin-top:12px;display:inline-block;">Read Article →</a></div>
  <div class="sp-card sp-reveal sp-reveal-d2"><div style="font-size:.72rem;color:var(--tm);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">YourStory · January 2026</div><h3>"How This Platform Helped 10,000 Trainers Earn ₹1 Cr+"</h3><p style="font-size:.82rem;color:var(--ts);margin-top:8px;">In-depth feature on World Trainer Forum's impact on the freelance training economy in India and beyond.</p><a href="#" style="color:var(--gold);font-size:.78rem;margin-top:12px;display:inline-block;">Read Article →</a></div>
</div>
<div class="sp-info-panel sp-reveal" style="max-width:640px;margin:0 auto;text-align:center;">
  <i class="fa-solid fa-newspaper" style="font-size:2rem;color:var(--gold);margin-bottom:16px;"></i>
  <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;margin-bottom:10px;">Press & Media Inquiries</h3>
  <p style="color:var(--ts);font-size:.88rem;line-height:1.7;margin-bottom:20px;">For interviews, data requests, press kit downloads, or media partnerships, please reach our communications team directly.</p>
  <a href="mailto:press@worldtrainerforum.com" style="color:var(--gold);font-weight:600;">press@worldtrainerforum.com</a><br>
  <a href="media-kit.html" class="btn btn-outline" style="margin-top:16px;">Download Media Kit</a>
</div>
</div></section>
$(Cta "Want to Cover Our Story?" "We'd love to speak with journalists, podcasters, and content creators covering the future of work and L&D." "Contact Our Press Team" "contact.html" "Download Media Kit" "media-kit.html")
"@
MakePage "press.html" "Press & Media | World Trainer Forum — News, Coverage & Press Kit" "Press page for World Trainer Forum — news coverage, media inquiries, press releases, and downloadable media kit for journalists and content creators." `
  (Bc @(@{label='Press'})) "Media & Coverage" "World Trainer Forum" "in the News" "Find our latest press coverage, press releases, company announcements, and media resources." "Download Media Kit" "media-kit.html" "Contact Press Team" "contact.html" $pressBody

# Affiliate Program
$affBody = @"
<section class="sp-section"><div class="sp-container">
$(Stats @(@{n='₹2,000–₹10,000';l='Per Trainer Referral'}, @{n='5%';l='Commission on Client Bookings'}, @{n='30 Days';l='Cookie Window'}, @{n='Real-time';l='Earnings Dashboard'}))
$(Sec "How to Earn" "Three Ways to" "Earn as an Affiliate" "" `
  (Steps @(
    @{h='Join the Affiliate Program';p='Sign up for free and receive your unique referral link and marketing materials within 24 hours of approval.'},
    @{h='Refer Trainers & Clients';p='Share your link on your website, social media, email list, or with your network. Earn on every verified signup that comes through your link.'},
    @{h='Get Paid Monthly';p='Commissions are tracked in real-time and paid monthly via bank transfer, UPI, or PayPal — no minimum threshold for payout.'}
  )))
$(Sec "What You Earn" "Affiliate" "Commission Structure" "" `
  (Cards @(
    @{i='fa-solid fa-user-plus';h='Trainer Referral';p='Earn ₹2,000 when a trainer you refer gets verified and completes their first booking. Earn ₹10,000 for Elite tier trainer referrals.'},
    @{i='fa-solid fa-building';h='Corporate Client Referral';p='Earn 3% commission on the total contract value when a corporate client you refer completes a training program (up to ₹1 Lakh).'},
    @{i='fa-solid fa-repeat';h='Recurring Commissions';p='Earn 2% on every rebooking from clients you referred — for as long as they remain active on the platform.'},
    @{i='fa-solid fa-trophy';h='Top Affiliate Bonuses';p='Our top 10 affiliates each month receive additional performance bonuses, exclusive perks, and co-marketing opportunities.'}
  ) 4))
<div class="sp-info-panel sp-reveal" style="max-width:560px;margin:0 auto;text-align:center;">
  <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;margin-bottom:10px;">Apply to Become an Affiliate</h3>
  <p style="color:var(--ts);font-size:.88rem;margin-bottom:20px;">Bloggers, coaches, HR professionals, LinkedIn influencers, and education platforms welcome.</p>
  <form onsubmit="return false;" style="display:flex;flex-direction:column;gap:12px;">
    <input class="sp-form-input" type="text" placeholder="Your Full Name">
    <input class="sp-form-input" type="email" placeholder="Your Email">
    <input class="sp-form-input" type="url" placeholder="Your Website or Social Profile URL">
    <button class="btn btn-gold" style="padding:12px;">Apply Now →</button>
  </form>
</div>
</div></section>
$(Cta "Start Earning Today" "Join our affiliate program and earn premium commissions for every trainer and client you refer." "Apply Now" "#" "Partner Program" "partner-program.html")
"@
MakePage "affiliate-program.html" "Affiliate Program | World Trainer Forum — Earn by Referring Trainers & Clients" "Join World Trainer Forum's affiliate program and earn ₹2,000–₹10,000 per trainer referral, plus 5% commission on client bookings. Free to join, real-time tracking, monthly payouts." `
  (Bc @(@{label='Affiliate Program'})) "Earn with Us" "Join Our" "Affiliate Program" "Earn generous commissions by referring professional trainers and corporate clients to World Trainer Forum — one of the fastest-growing trainer marketplaces in the world." "Apply Now" "#" "Partner Program" "partner-program.html" $affBody

# Partners
$partBody = @"
$(Sec "Our Partners" "Trusted by Global" "Organizations" "World Trainer Forum partners with leading organizations across HR tech, consulting, academia, and enterprise to deliver exceptional training outcomes." `
  "<div class='sp-grid-4 sp-reveal'><div class='sp-partner-logo'>Coursera for Business</div><div class='sp-partner-logo'>NASSCOM</div><div class='sp-partner-logo'>SHRM India</div><div class='sp-partner-logo'>ICF South Asia</div><div class='sp-partner-logo'>ATD India</div><div class='sp-partner-logo'>NIIT Foundation</div><div class='sp-partner-logo'>LinkedIn Learning</div><div class='sp-partner-logo'>Udemy Business</div></div>")
$(Sec "Partner Categories" "How We" "Partner" "" `
  (Cards @(
    @{i='fa-solid fa-building-columns';h='Academic Partners';p='Business schools, universities, and training institutes who co-brand programs and provide alumni access to our marketplace.'},
    @{i='fa-solid fa-briefcase';h='HR Consulting Partners';p='HR consultancies and talent development firms who recommend World Trainer Forum to their corporate clients.'},
    @{i='fa-solid fa-laptop';h='Technology Partners';p='LMS, HRMS, and talent tech platforms who integrate our trainer marketplace through API.'},
    @{i='fa-solid fa-globe';h='International Distribution';p='Training agencies outside India who license our platform for their local markets.'}
  ) 4))
$(Cta "Become a Platform Partner" "Join our growing ecosystem of global partners." "Apply to Partner" "contact.html" "Affiliate Program" "affiliate-program.html")
"@
MakePage "partners.html" "Our Partners | World Trainer Forum — Global Partnership Ecosystem" "World Trainer Forum's global partner network includes HR consulting firms, academic institutions, technology platforms, and international training organizations." `
  (Bc @(@{label='Partners'})) "Global Partnerships" "Our Partner" "Ecosystem" "We work with leading organizations across academia, HR consulting, technology, and enterprise to deliver world-class training outcomes." "Become a Partner" "contact.html" "Affiliate Program" "affiliate-program.html" $partBody

# Media Kit
$mediaBody = @"
<section class="sp-section"><div class="sp-container">
$(Sec "Brand Assets" "Download Our" "Media Kit" "All brand assets, logos, screenshots, and editorial guidelines for use by journalists, bloggers, and media partners." `
  (Cards @(
    @{i='fa-solid fa-image';h='Logo Pack';p='SVG, PNG, and transparent versions of the World Trainer Forum logo in light, dark, and single-color variants.'},
    @{i='fa-solid fa-palette';h='Brand Guidelines';p='Official color codes, typography, tone of voice, and usage rules for consistent representation of our brand.'},
    @{i='fa-solid fa-chart-bar';h='Company Fact Sheet';p='Key statistics, milestones, market presence, and company overview for use in editorial and research content.'},
    @{i='fa-solid fa-newspaper';h='Press Releases';p='Archive of all official press releases, product announcements, and funding news from World Trainer Forum.'},
    @{i='fa-solid fa-camera';h='Photography & Screenshots';p='High-resolution platform screenshots, team photos, and event imagery approved for editorial use.'},
    @{i='fa-solid fa-play';h='Video & B-Roll';p='Brand videos, platform demo clips, and founder interview footage available for licensed media use.'}
  )))
<div class="sp-info-panel sp-reveal" style="max-width:560px;margin:0 auto;text-align:center;">
  <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;margin-bottom:10px;">Request Full Media Kit</h3>
  <p style="color:var(--ts);font-size:.88rem;margin-bottom:20px;">All files are provided as a ZIP download upon request. For custom requests, email our team directly.</p>
  <form onsubmit="return false;" style="display:flex;flex-direction:column;gap:12px;">
    <input class="sp-form-input" type="text" placeholder="Your Name & Publication">
    <input class="sp-form-input" type="email" placeholder="Press Email Address">
    <button class="btn btn-gold" style="padding:12px;">Request Download →</button>
  </form>
  <p style="font-size:.75rem;color:var(--tm);margin-top:12px;">Or email: <a href="mailto:press@worldtrainerforum.com" style="color:var(--gold);">press@worldtrainerforum.com</a></p>
</div>
</div></section>
$(Cta "Have a Story to Tell?" "We welcome editorial coverage of our platform, trainers, and impact on global learning." "Contact Press Team" "contact.html" "View Press Page" "press.html")
"@
MakePage "media-kit.html" "Media Kit | World Trainer Forum — Brand Assets, Logos & Press Resources" "Download World Trainer Forum's official media kit including logos, brand guidelines, fact sheet, press releases, and photography for editorial and media use." `
  (Bc @(@{label='Media Kit'})) "Press Resources" "Download Our" "Media Kit" "All brand assets, press materials, and editorial resources for journalists, bloggers, and media partners covering World Trainer Forum." "Request Media Kit" "#" "Press Page" "press.html" $mediaBody

# Help Center
$helpBody = @"
<section class="sp-section"><div class="sp-container">
<div class="sp-section-hdr center sp-reveal">
  <span class="sp-section-label">Help Topics</span>
  <h2 class="sp-section-title">Browse Help by <span class="a">Category</span></h2>
</div>
$(Cards @(
  @{i='fa-solid fa-user';h='Getting Started';p='Account setup, profile creation, and first booking guide for clients and trainers on World Trainer Forum.'},
  @{i='fa-solid fa-credit-card';h='Payments & Billing';p='How to pay, refund policies, invoice downloads, and payment security on our platform.'},
  @{i='fa-solid fa-calendar';h='Booking & Scheduling';p='How to book sessions, reschedule, cancel, and manage your training calendar efficiently.'},
  @{i='fa-solid fa-star';h='Trainer Profiles';p='How to create, optimize, and get your trainer profile verified for maximum visibility.'},
  @{i='fa-solid fa-building';h='Corporate Accounts';p='Setting up team accounts, managing multiple bookings, and enterprise billing for corporate clients.'},
  @{i='fa-solid fa-headset';h='Contact Support';p='Reach our support team via chat, email, or phone. We respond within 2 hours during business hours.'}
) 3)
$(Faqs @(
  @{q="How do I book a training session?";a="Browse trainers, click 'Book Session' on a trainer's profile, select your preferred date and time, complete payment, and receive an instant confirmation email with session details."},
  @{q="What is the cancellation policy?";a="You can cancel and receive a full refund up to 24 hours before your session. Cancellations within 24 hours receive a 50% refund. No-shows are non-refundable."},
  @{q="How do I become a verified trainer?";a="Go to your trainer dashboard, click 'Apply for Verification', submit your credentials and references, and our team will review your application within 5 business days."},
  @{q="How do I contact a trainer before booking?";a="Each trainer profile has a 'Send Message' button. You can also contact trainers directly via WhatsApp using the button on their profile page."},
  @{q="Is my payment information secure?";a="Yes. All payments are processed through Razorpay (India) or Stripe (International) — both PCI-DSS compliant. We never store your card details."},
  @{q="Can I get a receipt or invoice for corporate billing?";a="Yes. After every completed session, you can download a GST-compliant invoice from your dashboard under 'Billing History'."}
))
</div></section>
$(Cta "Can't Find What You're Looking For?" "Our support team is available 7 days a week to help you." "Chat with Support" "contact.html" "Browse FAQs" "faqs.html")
"@
MakePage "help-center.html" "Help Center | World Trainer Forum — Support, Guides & FAQs" "Get help with your World Trainer Forum account. Booking guides, payment support, trainer resources, cancellation policies, and live customer support available 7 days a week." `
  (Bc @(@{label='Help Center'})) "Support Center" "How Can We" "Help You?" "Browse our help guides, FAQs, and tutorials — or reach our friendly support team directly." "Chat with Support" "contact.html" "View FAQs" "faqs.html" $helpBody

# FAQs
$faqBody = @"
<section class="sp-section"><div class="sp-container">
<div class="sp-grid-2" style="gap:48px;">
<div>
<h3 style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--gold);margin-bottom:20px;">For Clients</h3>
<div class="sp-faq-list">
  <div class="sp-faq-item"><button class="sp-faq-q">How do I find the right trainer? <i class="fa-solid fa-chevron-down sp-faq-arrow"></i></button><div class="sp-faq-a">Use our smart search filters — filter by category, specialty, price, delivery mode, rating, and availability. Read verified reviews and watch intro videos before booking.</div></div>
  <div class="sp-faq-item"><button class="sp-faq-q">How much do sessions cost? <i class="fa-solid fa-chevron-down sp-faq-arrow"></i></button><div class="sp-faq-a">Sessions range from ₹1,500 for individual coaching to ₹50,000+ for senior executive coaching. Corporate programs are custom-priced based on scope and team size.</div></div>
  <div class="sp-faq-item"><button class="sp-faq-q">Can I book a trial session before committing? <i class="fa-solid fa-chevron-down sp-faq-arrow"></i></button><div class="sp-faq-a">Yes — many trainers offer 30-minute discovery calls. Look for the 'Discovery Call' option on individual trainer profiles.</div></div>
  <div class="sp-faq-item"><button class="sp-faq-q">Are trainers background-checked? <i class="fa-solid fa-chevron-down sp-faq-arrow"></i></button><div class="sp-faq-a">Verified trainers go through identity verification, credential review, reference checks, and an expert panel evaluation before receiving their verified badge.</div></div>
  <div class="sp-faq-item"><button class="sp-faq-q">What is the refund policy? <i class="fa-solid fa-chevron-down sp-faq-arrow"></i></button><div class="sp-faq-a">Full refund for cancellations 24+ hours before the session. 50% refund within 24 hours. If a trainer cancels, you receive a 100% refund automatically.</div></div>
</div>
</div>
<div>
<h3 style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--gold);margin-bottom:20px;">For Trainers</h3>
<div class="sp-faq-list">
  <div class="sp-faq-item"><button class="sp-faq-q">How do I create a trainer profile? <i class="fa-solid fa-chevron-down sp-faq-arrow"></i></button><div class="sp-faq-a">Click 'List Your Profile' in the footer, complete the registration form, upload your credentials and portfolio, and your profile goes live within 24 hours after basic review.</div></div>
  <div class="sp-faq-item"><button class="sp-faq-q">What commission does the platform charge? <i class="fa-solid fa-chevron-down sp-faq-arrow"></i></button><div class="sp-faq-a">0% commission for your first 3 months. After that, we charge 10% on sessions booked through the platform — one of the lowest rates in the industry.</div></div>
  <div class="sp-faq-item"><button class="sp-faq-q">When do I get paid? <i class="fa-solid fa-chevron-down sp-faq-arrow"></i></button><div class="sp-faq-a">Payment is released to your account within 48 hours of session completion — after the client confirms the session took place successfully.</div></div>
  <div class="sp-faq-item"><button class="sp-faq-q">Can I set my own pricing? <i class="fa-solid fa-chevron-down sp-faq-arrow"></i></button><div class="sp-faq-a">Yes — you have full control over your rates. You can set different prices for different session types, durations, and delivery formats.</div></div>
  <div class="sp-faq-item"><button class="sp-faq-q">Is verification mandatory? <i class="fa-solid fa-chevron-down sp-faq-arrow"></i></button><div class="sp-faq-a">No — you can list without verification. But verified trainers get 4× more inquiries and appear higher in search results. We strongly recommend getting verified.</div></div>
</div>
</div>
</div>
</div></section>
$(Cta "Still Have Questions?" "Our support team responds within 2 hours — 7 days a week." "Contact Support" "contact.html" "Help Center" "help-center.html")
"@
MakePage "faqs.html" "FAQs | World Trainer Forum — Frequently Asked Questions" "Find answers to the most frequently asked questions about World Trainer Forum — for clients, trainers, corporate accounts, payments, bookings, and platform policies." `
  (Bc @(@{label='FAQs'})) "Got Questions?" "Frequently Asked" "Questions" "Everything you need to know about World Trainer Forum — for clients, trainers, and corporate organizations." "Contact Us" "contact.html" "Help Center" "help-center.html" $faqBody

# Privacy Policy
$privBody = "<section class='sp-section'><div class='sp-container'><div style='max-width:800px;margin:0 auto;' class='sp-reveal'>"
$privBody += "<p style='color:var(--ts);font-size:.88rem;margin-bottom:32px;'>Last updated: June 1, 2026</p>"
$sections = @(
  @{h="1. Information We Collect";p="We collect information you provide directly (name, email, phone, professional credentials, payment details), information generated by platform use (booking history, session ratings, communication logs), and technical data (IP address, device type, browser, cookies)."},
  @{h="2. How We Use Your Information";p="We use your information to provide and improve our services, process payments, verify trainer credentials, facilitate bookings, send service-related communications, prevent fraud, and comply with legal obligations."},
  @{h="3. Information Sharing";p="We do not sell your personal information. We share information with trainers/clients as necessary to complete bookings, with payment processors (Razorpay, Stripe) for transactions, and with service providers under strict data processing agreements."},
  @{h="4. Data Security";p="We implement industry-standard security including SSL/TLS encryption, AES-256 data encryption at rest, multi-factor authentication, and regular security audits. Payment information is handled by PCI-DSS compliant processors."},
  @{h="5. Cookies & Tracking";p="We use essential cookies for platform functionality, analytics cookies (with consent) for service improvement, and marketing cookies (with consent) for personalization. You can manage cookie preferences in your browser settings."},
  @{h="6. Your Rights (GDPR & DPDP)";p="Depending on your jurisdiction, you have the right to access, correct, delete, or port your personal data. You may also object to processing or withdraw consent. To exercise these rights, email privacy@worldtrainerforum.com."},
  @{h="7. Data Retention";p="We retain your data for as long as your account is active or as needed to provide services. After account deletion, we retain minimal data for fraud prevention and legal compliance for up to 3 years."},
  @{h="8. International Transfers";p="World Trainer Forum operates globally. Your data may be processed in countries with different data protection laws. We ensure appropriate safeguards through standard contractual clauses and partner agreements."},
  @{h="9. Children's Privacy";p="Our platform is not intended for users under 18 years of age. We do not knowingly collect personal information from minors."},
  @{h="10. Contact Us";p="For privacy questions, data requests, or concerns, contact our Data Protection Officer at: privacy@worldtrainerforum.com or World Trainer Forum Technologies Pvt. Ltd., BKC, Mumbai 400051, India."}
)
foreach ($s in $sections) {
  $privBody += "<h2 style='font-family:Outfit,sans-serif;font-size:1.05rem;font-weight:700;color:var(--tp);margin:28px 0 10px;'>$($s.h)</h2><p style='color:var(--ts);font-size:.88rem;line-height:1.85;'>$($s.p)</p>"
}
$privBody += "</div></div></section>"
$privBody += (Cta "Questions About Your Data?" "Contact our Data Protection Officer within 30 days for a response." "Contact Privacy Team" "contact.html" "Help Center" "help-center.html")
MakePage "privacy-policy.html" "Privacy Policy | World Trainer Forum — Data Protection & Privacy" "Read World Trainer Forum's Privacy Policy. We are committed to protecting your personal data in compliance with GDPR, India's DPDP Act, and global best practices." `
  (Bc @(@{label='Privacy Policy'})) "Data Protection" "Our Privacy" "Policy" "We are committed to protecting your personal information and being transparent about how we use it." "Contact Privacy Team" "contact.html" "Help Center" "help-center.html" $privBody

# Terms & Conditions
$termsBody = "<section class='sp-section'><div class='sp-container'><div style='max-width:800px;margin:0 auto;' class='sp-reveal'>"
$termsBody += "<p style='color:var(--ts);font-size:.88rem;margin-bottom:32px;'>Last updated: June 1, 2026 · Effective: June 1, 2026</p>"
$tSecs = @(
  @{h="1. Acceptance of Terms";p="By accessing or using World Trainer Forum ('Platform'), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our Platform."},
  @{h="2. Platform Description";p="World Trainer Forum is an online marketplace connecting clients (individuals and organizations) with professional trainers, coaches, mentors, and speakers. We facilitate bookings but are not a party to the training service contract between clients and trainers."},
  @{h="3. User Accounts";p="You must provide accurate information when registering. You are responsible for maintaining the confidentiality of your account credentials and all activities under your account. Users must be 18 years or older."},
  @{h="4. Trainer Obligations";p="Trainers listed on the platform must: hold the qualifications they claim, deliver sessions as booked, maintain professional standards, and comply with our Code of Conduct. Misrepresentation may result in immediate suspension."},
  @{h="5. Client Obligations";p="Clients agree to: provide accurate booking information, attend sessions as scheduled, treat trainers with professional respect, and provide honest and fair reviews. Abuse of the review system is prohibited."},
  @{h="6. Payments & Commission";p="All payments are processed through Razorpay or Stripe. World Trainer Forum charges trainers a platform commission (currently 10% after the first 3 free months). Prices displayed are inclusive of all applicable taxes unless otherwise stated."},
  @{h="7. Cancellations & Refunds";p="Clients may cancel sessions with full refund 24+ hours before the scheduled time. Within 24 hours: 50% refund. Trainer cancellations result in 100% refund to client. No-show policy: no refund without documented emergency."},
  @{h="8. Intellectual Property";p="All content on the Platform (design, code, copy, logos) is owned by World Trainer Forum Technologies Pvt. Ltd. Training materials shared by trainers remain their IP. You may not reproduce, distribute, or create derivative works without written permission."},
  @{h="9. Limitation of Liability";p="World Trainer Forum is a marketplace — we are not liable for the quality, accuracy, or outcomes of training sessions. Our maximum liability to any party is limited to the total fees paid in the preceding 12 months."},
  @{h="10. Governing Law";p="These Terms are governed by the laws of India. Disputes shall be resolved through arbitration in Mumbai under the Arbitration and Conciliation Act, 1996, before seeking court remedies."}
)
foreach ($s in $tSecs) {
  $termsBody += "<h2 style='font-family:Outfit,sans-serif;font-size:1.05rem;font-weight:700;color:var(--tp);margin:28px 0 10px;'>$($s.h)</h2><p style='color:var(--ts);font-size:.88rem;line-height:1.85;'>$($s.p)</p>"
}
$termsBody += "</div></div></section>"
$termsBody += (Cta "Questions About These Terms?" "Our legal team is available to clarify any terms or policies." "Contact Legal Team" "contact.html" "Privacy Policy" "privacy-policy.html")
MakePage "terms-conditions.html" "Terms & Conditions | World Trainer Forum — Platform Rules & Policies" "Read World Trainer Forum's Terms and Conditions governing the use of our trainer marketplace platform — for clients, trainers, and corporate organizations." `
  (Bc @(@{label='Terms & Conditions'})) "Platform Policies" "Terms &" "Conditions" "Please read these terms carefully before using World Trainer Forum. By using our platform, you agree to these terms." "Contact Legal Team" "contact.html" "Privacy Policy" "privacy-policy.html" $termsBody

# Sitemap
$sitemapBody = @"
<section class="sp-section"><div class="sp-container">
<div class="sp-grid-4 sp-reveal">
  <div><h3 style="color:var(--gold);font-size:.84rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid rgba(197,160,89,0.2);">Main Pages</h3>
  <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;"><li><a href="index.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;transition:color .2s;">Home</a></li><li><a href="about.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">About Us</a></li><li><a href="find-trainers.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Find Trainers</a></li><li><a href="categories.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">All Categories</a></li><li><a href="pricing.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Pricing</a></li><li><a href="blog.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Blog</a></li><li><a href="dashboard.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Trainer Dashboard</a></li></ul></div>
  <div><h3 style="color:var(--gold);font-size:.84rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid rgba(197,160,89,0.2);">For Clients</h3>
  <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;"><li><a href="corporate-training.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Corporate Training</a></li><li><a href="leadership-training.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Leadership Training</a></li><li><a href="sales-training.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Sales Training</a></li><li><a href="soft-skills-training.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Soft Skills Training</a></li><li><a href="technology-training.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Technology Training</a></li><li><a href="executive-coaching.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Executive Coaching</a></li><li><a href="team-building.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Team Building</a></li><li><a href="gift-a-session.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Gift a Session</a></li><li><a href="request-custom-training.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Request Custom Training</a></li></ul></div>
  <div><h3 style="color:var(--gold);font-size:.84rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid rgba(197,160,89,0.2);">For Trainers</h3>
  <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;"><li><a href="trainer-resources.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Trainer Resources</a></li><li><a href="community-forum.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Community Forum</a></li><li><a href="success-stories.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Success Stories</a></li><li><a href="verification-process.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Verification Process</a></li><li><a href="become-verified.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Become Verified</a></li><li><a href="trainer-academy.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Trainer Academy</a></li><li><a href="learning-center.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Learning Center</a></li><li><a href="certification-support.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Certification Support</a></li><li><a href="events-workshops.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Events & Workshops</a></li><li><a href="earnings-program.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Earnings Program</a></li><li><a href="partner-program.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Partner Program</a></li></ul></div>
  <div><h3 style="color:var(--gold);font-size:.84rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid rgba(197,160,89,0.2);">Company</h3>
  <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;"><li><a href="contact.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Contact Us</a></li><li><a href="careers.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Careers</a></li><li><a href="press.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Press</a></li><li><a href="privacy-policy.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Privacy Policy</a></li><li><a href="terms-conditions.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Terms & Conditions</a></li><li><a href="faqs.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">FAQs</a></li><li><a href="help-center.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Help Center</a></li><li><a href="affiliate-program.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Affiliate Program</a></li><li><a href="partners.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Partners</a></li><li><a href="media-kit.html" style="color:var(--ts);font-size:.84rem;text-decoration:none;">Media Kit</a></li></ul></div>
</div>
<div style="margin-top:48px;"><h3 style="color:var(--gold);font-size:.84rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid rgba(197,160,89,0.2);">Training Categories</h3>
<div class="footer-chips" style="margin-top:8px;"><a href="leadership.html" class="footer-chip">Leadership</a><a href="communication-skills.html" class="footer-chip">Communication Skills</a><a href="ai-technology.html" class="footer-chip">AI & Technology</a><a href="sales-marketing.html" class="footer-chip">Sales & Marketing</a><a href="hr-training.html" class="footer-chip">HR Training</a><a href="public-speaking.html" class="footer-chip">Public Speaking</a><a href="personal-development.html" class="footer-chip">Personal Development</a><a href="business-strategy.html" class="footer-chip">Business Strategy</a><a href="finance-training.html" class="footer-chip">Finance</a><a href="health-wellness.html" class="footer-chip">Health & Wellness</a></div></div>
</div></section>
$(Cta "Ready to Start Your Learning Journey?" "Browse trainers, explore categories, and book your first session today." "Find Trainers" "find-trainers.html" "Explore Categories" "categories.html")
"@
MakePage "sitemap.html" "Sitemap | World Trainer Forum — All Pages Directory" "Complete sitemap of World Trainer Forum — all pages organized by category for easy navigation." `
  (Bc @(@{label='Sitemap'})) "Site Directory" "Complete" "Sitemap" "Navigate all pages of World Trainer Forum — from trainer categories to company information." "Find Trainers" "find-trainers.html" "Explore Categories" "categories.html" $sitemapBody

Write-Host "Company pages done."

# ════════════════════════════════════════════════════════
# 404 PAGE
# ════════════════════════════════════════════════════════
$p404 = @"
<!DOCTYPE html>
<html lang="en" class="dark-mode">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found | World Trainer Forum</title>
  <meta name="robots" content="noindex">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css"><link rel="stylesheet" href="css/pages.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <div id="nav-inject"></div>
  <main class="sp-page" style="display:flex;align-items:center;justify-content:center;min-height:80vh;text-align:center;padding:60px 5%;">
    <div>
      <div style="font-size:8rem;font-family:'Cormorant Garamond',serif;font-weight:700;color:rgba(197,160,89,0.15);line-height:1;margin-bottom:16px;">404</div>
      <i class="fa-solid fa-map-location-dot" style="font-size:3rem;color:var(--gold);margin-bottom:24px;display:block;"></i>
      <h1 style="font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);color:var(--tp);margin-bottom:14px;">Page Not Found</h1>
      <p style="color:var(--ts);font-size:1rem;max-width:480px;margin:0 auto 36px;line-height:1.8;">The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
      <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
        <a href="index.html" class="btn btn-gold btn-lg"><i class="fa-solid fa-house" style="margin-right:8px;"></i>Go Home</a>
        <a href="find-trainers.html" class="btn btn-ghost btn-lg">Find Trainers</a>
        <a href="contact.html" class="btn btn-ghost btn-lg">Get Help</a>
      </div>
    </div>
  </main>
  <div id="footer-inject"></div>
  <script src="js/shared.js"></script>
</body>
</html>
"@
Set-Content -Path "$base\404.html" -Value $p404 -Encoding UTF8
Write-Host "Created: 404.html"

Write-Host ""
Write-Host "ALL PAGES GENERATED SUCCESSFULLY!"
Write-Host "Total pages created in batch 2: $(Get-ChildItem $base -Filter '*.html' | Where-Object {$_.LastWriteTime -gt (Get-Date).AddMinutes(-10)} | Measure-Object | Select-Object -ExpandProperty Count)"
