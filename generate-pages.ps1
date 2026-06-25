# World Trainer Forum — Bulk Page Generator
# Creates all remaining inner pages with full SEO content

$base = "c:\Users\The Mars\Desktop\trainers"

function Page($file, $title, $metaDesc, $keywords, $canonical, $breadcrumb, $heroLabel, $h1, $h1Gold, $heroDesc, $heroCta1Label, $heroCta1Href, $heroCta2Label, $heroCta2Href, $bodyHtml) {
@"
<!DOCTYPE html>
<html lang="en" class="dark-mode">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$title | World Trainer Forum</title>
  <meta name="description" content="$metaDesc">
  <meta name="keywords" content="$keywords">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.worldtrainerforum.com/$canonical">
  <meta property="og:title" content="$title | World Trainer Forum">
  <meta property="og:description" content="$metaDesc">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css"><link rel="stylesheet" href="css/pages.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <div id="nav-inject"></div>
  <main class="sp-page">
    <nav class="sp-breadcrumb">$breadcrumb</nav>
    <section class="sp-hero">
      <div class="sp-hero-inner">
        <span class="sp-hero-label">$heroLabel</span>
        <h1>$h1 <span class="gld">$h1Gold</span></h1>
        <p class="sp-hero-desc">$heroDesc</p>
        <div class="sp-hero-ctas">
          <a href="$heroCta1Href" class="btn btn-gold btn-lg">$heroCta1Label</a>
          <a href="$heroCta2Href" class="btn btn-ghost btn-lg">$heroCta2Label</a>
        </div>
      </div>
    </section>
    $bodyHtml
  </main>
  <div id="footer-inject"></div>
  <script src="js/shared.js"></script>
</body>
</html>
"@
}

# ── Helper: standard CTA band ──
function CtaBand($h, $p, $b1t, $b1h, $b2t, $b2h) {
  return @"
<section class="sp-cta-band">
  <h2>$h</h2><p>$p</p>
  <div class="sp-cta-btns">
    <a href="$b1h" class="btn btn-gold btn-lg">$b1t</a>
    <a href="$b2h" class="btn btn-ghost btn-lg">$b2t</a>
  </div>
</section>
"@
}

function Cards3($c) {
  # c = array of @{icon;h3;p}
  $html = '<div class="sp-grid-3" style="margin-bottom:52px;">'
  $i = 0
  foreach ($x in $c) {
    $d = if ($i % 3 -eq 0) { '' } elseif ($i % 3 -eq 1) { ' sp-reveal-d1' } else { ' sp-reveal-d2' }
    $html += "<div class='sp-card sp-reveal$d'><div class='sp-card-icon'><i class='$($x.icon)'></i></div><h3>$($x.h3)</h3><p>$($x.p)</p></div>"
    $i++
  }
  $html += '</div>'
  return $html
}

function Stats4($s) {
  $html = '<div class="sp-stats sp-reveal">'
  foreach ($x in $s) { $html += "<div class='sp-stat'><span class='sp-stat-num'>$($x.n)</span><span class='sp-stat-lbl'>$($x.l)</span></div>" }
  $html += '</div>'
  return $html
}

function Steps3($s) {
  $html = '<div class="sp-steps sp-reveal">'
  $i = 1
  foreach ($x in $s) { $html += "<div class='sp-step'><div class='sp-step-num'>0$i</div><h3>$($x.h)</h3><p>$($x.p)</p></div>"; $i++ }
  $html += '</div>'
  return $html
}

function FaqList($items) {
  $html = '<div class="sp-section sp-section--alt"><div class="sp-container"><div class="sp-section-hdr center sp-reveal"><span class="sp-section-label">FAQs</span><h2 class="sp-section-title">Common <span class="a">Questions</span></h2></div><div class="sp-faq-list" style="max-width:720px;margin:0 auto;">'
  foreach ($x in $items) {
    $html += "<div class='sp-faq-item'><button class='sp-faq-q'>$($x.q) <i class='fa-solid fa-chevron-down sp-faq-arrow'></i></button><div class='sp-faq-a'>$($x.a)</div></div>"
  }
  $html += '</div></div></div>'
  return $html
}

function SectionHdr($label, $title, $gold, $sub) {
  return @"
<div class="sp-section-hdr center sp-reveal">
  <span class="sp-section-label">$label</span>
  <h2 class="sp-section-title">$title <span class="a">$gold</span></h2>
  <p class="sp-section-sub">$sub</p>
</div>
"@
}

# ════════════════════════════════════════════════════════
# TRAINING SERVICE PAGES
# ════════════════════════════════════════════════════════

# Sales Training
$salesBody = @"
<section class="sp-section"><div class="sp-container">
$(Stats4 @(@{n='1,800+';l='Sales Trainers'},@{n='85%';l='Avg. Revenue Uplift'},@{n='30K+';l='Sales Pros Trained'},@{n='4.9★';l='Average Rating'}))
$(SectionHdr 'What We Cover' 'Sales Training That' 'Closes Deals' 'From prospecting to closing, our certified sales trainers deliver results-driven programs for every industry.')
$(Cards3 @(
  @{icon='fa-solid fa-handshake';h3='Consultative Selling';p='Move beyond pitching. Train your team to ask the right questions, uncover needs, and position solutions that resonate.'},
  @{icon='fa-solid fa-comments-dollar';h3='Negotiation Mastery';p='Win deals without discounting. Proven negotiation frameworks used by top sales professionals worldwide.'},
  @{icon='fa-solid fa-funnel-dollar';h3='Sales Pipeline Management';p='Build healthy pipelines, reduce churn, and improve forecast accuracy with structured sales process training.'},
  @{icon='fa-solid fa-phone-volume';h3='Cold Outreach & Prospecting';p='Modern prospecting techniques across email, LinkedIn, phone, and video — that actually generate qualified meetings.'},
  @{icon='fa-solid fa-chart-bar';h3='Data-Driven Sales Coaching';p='Use CRM data, call analytics, and sales scorecards to coach teams based on what the numbers reveal.'},
  @{icon='fa-solid fa-people-arrows';h3='Account Management & Upsell';p='Retain and grow existing accounts through relationship-based selling, QBRs, and strategic account planning.'}
))
$(Steps3 @(
  @{h='Define Your Sales Challenge';p='Tell us your sales cycle, average deal size, team size, and the specific challenges holding back revenue growth.'},
  @{h='Get Matched with Experts';p='We shortlist certified sales trainers with proven industry experience and documented revenue impact.'},
  @{h='Train, Measure, Scale';p='Run sessions, track KPIs through our dashboard, and scale what works across your entire revenue team.'}
))
</div></section>
$(FaqList @(
  @{q='How soon can we see results from sales training?';a='Most clients report measurable improvement in lead conversion within 30 days. Full pipeline impact typically shows within 60–90 days post-training.'},
  @{q='Do trainers understand our specific industry?';a='Yes. We match you with trainers who have sold or trained in your exact vertical — SaaS, FMCG, B2B services, real estate, and more.'},
  @{q='Can training be delivered to remote sales teams?';a='Absolutely. All our trainers are equipped for virtual sales training with interactive tools, role-plays, and digital assessments.'}
))
$(CtaBand 'Ready to Supercharge Your Sales Team?' 'Connect with a certified sales trainer and unlock your team''s revenue potential.' 'Find Sales Trainers' 'find-trainers.html' 'Corporate Sales Programs' 'corporate-training.html')
"@

$content = Page 'sales-training.html' 'Sales Training Programs' 'Find certified sales trainers on World Trainer Forum. Boost revenue, improve close rates, and build high-performance sales teams with proven sales training programs.' 'sales training programs, sales coaching, sales enablement, sales skills training, revenue training, B2B sales training, closing techniques training' 'sales-training' '<a href="index.html">Home</a><span class="bc-sep">›</span><a href="categories.html">Categories</a><span class="bc-sep">›</span><span class="bc-cur">Sales Training</span>' 'Sales Enablement' 'Sales Training That' 'Drives Revenue' 'Work with world-class sales coaches and trainers who specialize in turning your sales team into a revenue-generating powerhouse.' 'Find Sales Trainers' 'find-trainers.html' 'Corporate Programs' 'corporate-training.html' $salesBody
Set-Content -Path "$base\sales-training.html" -Value $content -Encoding UTF8
Write-Host "Created: sales-training.html"

# Soft Skills Training
$softBody = @"
<section class="sp-section"><div class="sp-container">
$(Stats4 @(@{n='3,200+';l='Soft Skills Trainers'},@{n='1M+';l='Professionals Trained'},@{n='120+';l='Countries'},@{n='4.8★';l='Average Rating'}))
$(SectionHdr 'Core Programs' 'Soft Skills That' 'Set You Apart' 'The human skills that AI cannot replace — and that separate good professionals from great ones.')
$(Cards3 @(
  @{icon='fa-solid fa-comments';h3='Business Communication';p='Master written, verbal, and digital communication that commands attention, builds relationships, and drives action.'},
  @{icon='fa-solid fa-heart-pulse';h3='Emotional Intelligence';p='Develop self-awareness, empathy, and social skills to lead, collaborate, and resolve conflicts effectively.'},
  @{icon='fa-solid fa-people-group';h3='Team Collaboration';p='Build high-trust, high-performance teams through shared accountability, clear communication, and mutual respect.'},
  @{icon='fa-solid fa-lightbulb';h3='Critical Thinking & Problem Solving';p='Develop analytical frameworks to tackle complex challenges with clarity, creativity, and structured reasoning.'},
  @{icon='fa-solid fa-clock';h3='Time & Priority Management';p='Work smarter with proven time management systems — from deep work techniques to delegation and boundary-setting.'},
  @{icon='fa-solid fa-star';h3='Professional Presence & Influence';p='Project confidence, credibility, and gravitas in meetings, presentations, and high-stakes conversations.'}
))
</div></section>
$(FaqList @(
  @{q='What soft skills programs are most popular for corporates?';a='Business communication, emotional intelligence, and leadership presence are our most requested programs — often delivered as a bundled soft skills bootcamp.'},
  @{q='How are soft skills assessed before and after training?';a='We use pre/post assessments, 360° peer feedback, and behavioral observation tools to measure soft skills development quantitatively.'},
  @{q='Can soft skills programs be integrated with leadership training?';a='Yes — we frequently bundle soft skills with leadership development for a comprehensive people skills program.'}
))
$(CtaBand 'Invest in Skills That Last a Lifetime' 'Soft skills are the foundation of every successful career. Start building them today.' 'Browse Soft Skills Trainers' 'find-trainers.html' 'Request Custom Program' 'request-custom-training.html')
"@
$content = Page 'soft-skills-training.html' 'Soft Skills Training Programs' 'Develop essential soft skills with certified trainers on World Trainer Forum. Communication, emotional intelligence, leadership, and professional presence programs for individuals and teams.' 'soft skills training, communication skills training, emotional intelligence training, professional development programs, interpersonal skills, workplace skills training' 'soft-skills-training' '<a href="index.html">Home</a><span class="bc-sep">›</span><span class="bc-cur">Soft Skills Training</span>' 'Professional Development' 'Soft Skills Training for' 'Modern Professionals' 'Master the human skills that drive career success — communication, collaboration, emotional intelligence, and professional presence.' 'Find Soft Skills Trainers' 'find-trainers.html' 'Corporate Programs' 'corporate-training.html' $softBody
Set-Content -Path "$base\soft-skills-training.html" -Value $content -Encoding UTF8
Write-Host "Created: soft-skills-training.html"

# Technology Training
$techBody = @"
<section class="sp-section"><div class="sp-container">
$(Stats4 @(@{n='5,000+';l='Tech Trainers'},@{n='140+';l='Tech Topics Covered'},@{n='80K+';l='Tech Pros Trained'},@{n='4.9★';l='Average Rating'}))
$(SectionHdr 'What We Cover' 'Technology Training for' 'Every Level' 'From digital literacy to advanced AI and cloud — certified tech trainers for every skill gap.')
$(Cards3 @(
  @{icon='fa-solid fa-robot';h3='AI & Machine Learning';p='Understand, build, and apply AI solutions. From AI literacy for business leaders to deep learning for data scientists.'},
  @{icon='fa-solid fa-cloud';h3='Cloud Computing (AWS/Azure/GCP)';p='Architect, deploy, and manage cloud infrastructure with certified AWS, Azure, and Google Cloud trainers.'},
  @{icon='fa-solid fa-shield-halved';h3='Cybersecurity Fundamentals';p='Train your team to identify threats, apply security protocols, and protect your organization from cyber attacks.'},
  @{icon='fa-solid fa-chart-pie';h3='Data Analytics & Visualization';p='Turn raw data into business insights using Excel, Power BI, Tableau, Python, and SQL.'},
  @{icon='fa-solid fa-code';h3='Software Development';p='Python, JavaScript, React, APIs, and agile development — for technical teams and business analysts.'},
  @{icon='fa-solid fa-mobile-screen';h3='Digital Transformation';p='Guide your organization through digital change — tools adoption, process automation, and culture transformation.'}
))
</div></section>
$(FaqList @(
  @{q='Do trainers customize content for non-technical audiences?';a='Yes. We have trainers who specialize in tech literacy for business leaders — explaining complex concepts in plain language with real business applications.'},
  @{q='Are certifications included in the training?';a='Several programs include prep for globally recognized certifications (AWS, Azure, Google, CompTIA, etc.). Your trainer will advise on the right path.'},
  @{q='Can we run hands-on lab sessions virtually?';a='Yes. Our tech trainers use virtual lab environments, sandbox accounts, and real-world projects to make learning practical and applied.'}
))
$(CtaBand 'Future-Proof Your Team with Technology Skills' 'The future belongs to organizations that invest in technology fluency today.' 'Find Tech Trainers' 'find-trainers.html' 'Explore AI & Tech' 'ai-technology.html')
"@
$content = Page 'technology-training.html' 'Technology Training Programs' 'Find certified technology trainers for AI, cloud, cybersecurity, data analytics, and software development on World Trainer Forum. Upskill your team with expert-led tech training programs.' 'technology training programs, AI training, cloud computing training, cybersecurity training, data analytics training, digital transformation training, tech upskilling' 'technology-training' '<a href="index.html">Home</a><span class="bc-sep">›</span><span class="bc-cur">Technology Training</span>' 'Tech Upskilling' 'Technology Training for' 'the Digital Age' 'Connect with certified technology trainers who specialize in AI, cloud, cybersecurity, and digital transformation programs for teams and individuals.' 'Find Tech Trainers' 'find-trainers.html' 'AI & Tech Category' 'ai-technology.html' $techBody
Set-Content -Path "$base\technology-training.html" -Value $content -Encoding UTF8
Write-Host "Created: technology-training.html"

# Executive Coaching
$execBody = @"
<section class="sp-section"><div class="sp-container">
$(Stats4 @(@{n='800+';l='Executive Coaches'},@{n='C-Suite';l='& Senior Leader Focus'},@{n='62';l='Countries Covered'},@{n='4.9★';l='Average Rating'}))
$(SectionHdr 'Who We Serve' 'Executive Coaching for' 'Senior Leaders' 'Tailored 1:1 coaching for C-suite executives, founders, board members, and senior directors navigating complexity and scale.')
$(Cards3 @(
  @{icon='fa-solid fa-landmark';h3='CEO & Founder Coaching';p='Navigate the unique challenges of organizational leadership — from vision clarity and board relationships to scaling culture and personal resilience.'},
  @{icon='fa-solid fa-briefcase';h3='C-Suite Alignment Programs';p='Align your executive team on strategy, communication style, and collaborative decision-making to accelerate organizational performance.'},
  @{icon='fa-solid fa-arrow-up-right-dots';h3='Leadership Transition Coaching';p='Support leaders moving into new roles, geographies, or levels of responsibility with focused onboarding coaching.'},
  @{icon='fa-solid fa-sitemap';h3='Board Presence & Governance';p='Develop gravitas, strategic clarity, and communication skills to lead board meetings and stakeholder engagements with confidence.'},
  @{icon='fa-solid fa-person-chalkboard';h3='Succession Planning';p='Identify, develop, and coach high-potential leaders for future executive roles with structured succession coaching programs.'},
  @{icon='fa-solid fa-scale-balanced';h3='Work-Life Integration for Executives';p='Sustainable high performance — coaching that balances peak career ambition with personal energy, health, and relationships.'}
))
$(Steps3 @(
  @{h='Discovery & Assessment';p='A comprehensive leadership assessment combined with a deep discovery session to understand your goals, challenges, and blind spots.'},
  @{h='Structured Coaching Engagement';p='Regular 1:1 sessions (typically 6–12 months) with a dedicated executive coach, supported by tools, frameworks, and accountability structures.'},
  @{h='Measure, Reflect & Sustain';p='Track leadership growth with 360° feedback and impact assessments, and build habits that sustain growth beyond the coaching engagement.'}
))
</div></section>
$(FaqList @(
  @{q='How is executive coaching different from leadership training?';a='Executive coaching is personalized 1:1 development — tailored entirely to you. Leadership training is group learning. Coaching addresses your specific leadership challenges, goals, and context.'},
  @{q='How long does an executive coaching engagement last?';a='Most engagements run 6–12 months for meaningful transformation. Some leaders opt for ongoing monthly coaching for continued growth.'},
  @{q='Is executive coaching confidential?';a='Absolutely. All sessions are strictly confidential. Our executive coaches adhere to the ICF Code of Ethics and treat all conversations with complete discretion.'}
))
$(CtaBand 'Unlock Your Full Leadership Potential' 'Work with a world-class executive coach who has walked in your shoes.' 'Find Your Executive Coach' 'find-trainers.html' 'Explore Leadership Training' 'leadership-training.html')
"@
$content = Page 'executive-coaching.html' 'Executive Coaching Services' 'World-class executive coaching for C-suite leaders, founders, and senior executives on World Trainer Forum. Personalized 1:1 coaching to elevate strategic thinking, leadership presence, and organizational impact.' 'executive coaching, CEO coaching, C-suite coaching, leadership coaching, senior leader development, executive leadership coach, founder coaching' 'executive-coaching' '<a href="index.html">Home</a><span class="bc-sep">›</span><span class="bc-cur">Executive Coaching</span>' 'C-Suite Development' 'Executive Coaching for' 'World-Class Leaders' 'Personalized 1:1 executive coaching for CEOs, founders, and senior leaders. Achieve peak performance, strategic clarity, and lasting leadership transformation.' 'Find Executive Coaches' 'find-trainers.html' 'Leadership Programs' 'leadership-training.html' $execBody
Set-Content -Path "$base\executive-coaching.html" -Value $content -Encoding UTF8
Write-Host "Created: executive-coaching.html"

# Team Building
$teamBody = @"
<section class="sp-section"><div class="sp-container">
$(Stats4 @(@{n='1,200+';l='Team Building Facilitators'},@{n='500+';l='Corporate Clients'},@{n='50K+';l='Teams Energized'},@{n='4.9★';l='Average Rating'}))
$(SectionHdr 'Our Programs' 'Team Building That' 'Actually Works' 'Evidence-based programs that build trust, improve communication, and drive measurable team performance.')
$(Cards3 @(
  @{icon='fa-solid fa-puzzle-piece';h3='Experiential Team Workshops';p='Hands-on activities and challenges designed to break silos, build trust, and foster collaboration in a fun, engaging environment.'},
  @{icon='fa-solid fa-comments';h3='Communication & Trust Building';p='Structured workshops that improve how teams communicate, give feedback, handle disagreement, and support each other.'},
  @{icon='fa-solid fa-globe';h3='Virtual Team Cohesion Programs';p='Purpose-built programs for remote and hybrid teams — building connection across time zones and geographies.'},
  @{icon='fa-solid fa-lightbulb';h3='Innovation & Ideation Workshops';p='Structured creative sessions that unlock collective intelligence and generate breakthrough ideas from diverse teams.'},
  @{icon='fa-solid fa-people-roof';h3='Cultural Integration Programs';p='Help diverse teams from different backgrounds, departments, or post-merger organizations build a shared identity and culture.'},
  @{icon='fa-solid fa-trophy';h3='High Performance Team Accelerator';p='A comprehensive 3-month program to transform average teams into high-performing, self-directed units with clear accountability.'}
))
</div></section>
$(FaqList @(
  @{q='What team sizes do your programs accommodate?';a='We design programs for teams of 5 to 500+. Large programs are delivered in cohorts with coordinated facilitation across breakout groups.'},
  @{q='Do you offer outdoor team building activities?';a='Yes. Many of our facilitators specialize in outdoor experiential learning — from adventure-based workshops to community service activities.'},
  @{q='How do we measure the impact of team building programs?';a='We use pre/post team health surveys, collaboration indices, and follow-up 360° assessments to quantify team cohesion improvement.'}
))
$(CtaBand 'Build a Team That Wins Together' 'Great teams are built — not found. Start your team transformation today.' 'Browse Team Facilitators' 'find-trainers.html' 'Request Custom Program' 'request-custom-training.html')
"@
$content = Page 'team-building.html' 'Team Building Programs' 'Strengthen team cohesion, trust, and performance with certified team building facilitators on World Trainer Forum. Virtual, in-person, and hybrid team building programs for corporate teams.' 'team building programs, corporate team building, team cohesion training, virtual team building, team performance programs, employee engagement workshops' 'team-building' '<a href="index.html">Home</a><span class="bc-sep">›</span><span class="bc-cur">Team Building Programs</span>' 'Team Performance' 'Team Building Programs That' 'Deliver Results' 'Work with expert team building facilitators to create high-trust, high-performance teams through engaging, evidence-based programs.' 'Find Team Facilitators' 'find-trainers.html' 'Corporate Training' 'corporate-training.html' $teamBody
Set-Content -Path "$base\team-building.html" -Value $content -Encoding UTF8
Write-Host "Created: team-building.html"

# Gift a Session
$giftContent = @"
<!DOCTYPE html>
<html lang="en" class="dark-mode">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gift a Training Session | World Trainer Forum — The Perfect Professional Gift</title>
  <meta name="description" content="Gift a world-class training session to someone you care about. Choose from 50,000+ expert trainers across leadership, wellness, technology, and more. Delivered as a beautiful digital gift card.">
  <meta name="keywords" content="gift a training session, gift coaching session, professional gift card, training gift voucher, gift mentoring session, online coaching gift">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.worldtrainerforum.com/gift-a-session">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css"><link rel="stylesheet" href="css/pages.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <div id="nav-inject"></div>
  <main class="sp-page">
    <nav class="sp-breadcrumb"><a href="index.html">Home</a><span class="bc-sep">›</span><span class="bc-cur">Gift a Session</span></nav>
    <section class="sp-hero">
      <div class="sp-hero-inner">
        <span class="sp-hero-label">The Perfect Professional Gift</span>
        <h1>Give the Gift of <span class="gld">World-Class Learning</span></h1>
        <p class="sp-hero-desc">Celebrate someone's growth journey with a premium training session from our global roster of 50,000+ expert trainers. A gift that transforms careers and inspires lives.</p>
        <div class="sp-hero-ctas">
          <a href="find-trainers.html" class="btn btn-gold btn-lg"><i class="fa-solid fa-gift" style="margin-right:8px;"></i>Buy a Gift Session</a>
          <a href="pricing.html" class="btn btn-ghost btn-lg">View Pricing</a>
        </div>
      </div>
    </section>
    <section class="sp-section"><div class="sp-container">
      <div class="sp-section-hdr center sp-reveal">
        <span class="sp-section-label">How It Works</span>
        <h2 class="sp-section-title">Three Steps to the <span class="a">Perfect Gift</span></h2>
      </div>
      <div class="sp-steps sp-reveal">
        <div class="sp-step"><div class="sp-step-num">01</div><h3>Choose a Trainer or Topic</h3><p>Browse our curated roster of experts across leadership, wellness, technology, career coaching, and more — and select the perfect match.</p></div>
        <div class="sp-step"><div class="sp-step-num">02</div><h3>Customize Your Gift Card</h3><p>Add a personal message, select a delivery date, and choose a gift value from ₹1,500 to ₹50,000 for a flexible open-session voucher.</p></div>
        <div class="sp-step"><div class="sp-step-num">03</div><h3>Recipient Books Their Session</h3><p>Your recipient gets a beautiful digital gift card and books their session at their convenience — full flexibility, zero hassle.</p></div>
      </div>
      <div class="sp-section-hdr center sp-reveal" style="margin-top:60px;">
        <span class="sp-section-label">Popular Gift Categories</span>
        <h2 class="sp-section-title">Choose the <span class="a">Right Program</span></h2>
      </div>
      <div class="sp-grid-3 sp-reveal">
        <div class="sp-card" style="text-align:center;"><div class="sp-card-icon" style="margin:0 auto 16px;"><i class="fa-solid fa-crown"></i></div><h3>Leadership Coaching</h3><p>For the rising leader in your life. 1:1 executive coaching sessions from ₹5,000.</p><a href="leadership-training.html" class="btn btn-outline" style="margin-top:16px;font-size:.8rem;">Explore</a></div>
        <div class="sp-card" style="text-align:center;"><div class="sp-card-icon" style="margin:0 auto 16px;"><i class="fa-solid fa-heart-pulse"></i></div><h3>Wellness Coaching</h3><p>Give the gift of health — mindfulness, nutrition, fitness, and life balance coaching.</p><a href="health-wellness.html" class="btn btn-outline" style="margin-top:16px;font-size:.8rem;">Explore</a></div>
        <div class="sp-card" style="text-align:center;"><div class="sp-card-icon" style="margin:0 auto 16px;"><i class="fa-solid fa-graduation-cap"></i></div><h3>Career Mentoring</h3><p>Help someone navigate their career transition, job switch, or professional growth.</p><a href="find-trainers.html" class="btn btn-outline" style="margin-top:16px;font-size:.8rem;">Explore</a></div>
      </div>
    </div></section>
    <section class="sp-cta-band">
      <h2>The Most Meaningful Gift You'll Give This Year</h2>
      <p>Invest in someone's future with a premium learning experience from World Trainer Forum.</p>
      <div class="sp-cta-btns">
        <a href="find-trainers.html" class="btn btn-gold btn-lg"><i class="fa-solid fa-gift" style="margin-right:8px;"></i>Buy a Gift Session</a>
        <a href="contact.html" class="btn btn-ghost btn-lg">Need Help Choosing?</a>
      </div>
    </section>
  </main>
  <div id="footer-inject"></div>
  <script src="js/shared.js"></script>
</body>
</html>
"@
Set-Content -Path "$base\gift-a-session.html" -Value $giftContent -Encoding UTF8
Write-Host "Created: gift-a-session.html"

# Request Custom Training
$reqCustom = @"
<!DOCTYPE html>
<html lang="en" class="dark-mode">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Request Custom Training | World Trainer Forum — Bespoke Learning Programs</title>
  <meta name="description" content="Request a fully customized corporate training program on World Trainer Forum. Tell us your objectives, team size, and timeline — our experts design a bespoke learning journey for you.">
  <meta name="keywords" content="custom training program, bespoke corporate training, customized learning program, tailored training solutions, custom L&D programs, training request">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.worldtrainerforum.com/request-custom-training">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css"><link rel="stylesheet" href="css/pages.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <div id="nav-inject"></div>
  <main class="sp-page">
    <nav class="sp-breadcrumb"><a href="index.html">Home</a><span class="bc-sep">›</span><a href="corporate-training.html">Corporate Training</a><span class="bc-sep">›</span><span class="bc-cur">Request Custom Training</span></nav>
    <section class="sp-hero">
      <div class="sp-hero-inner">
        <span class="sp-hero-label">Bespoke Learning Design</span>
        <h1>Your Training, <span class="gld">Completely Customized</span></h1>
        <p class="sp-hero-desc">Tell us what you need — we design, source, and deliver a bespoke training program tailored to your industry, culture, objectives, and team.</p>
      </div>
    </section>
    <section class="sp-section"><div class="sp-container">
      <div class="sp-split sp-split--2-3 sp-reveal">
        <div>
          <span class="sp-section-label">Why Custom Training?</span>
          <h2 class="sp-section-title">Off-the-Shelf Doesn't <span class="a">Fit Everyone</span></h2>
          <p style="color:var(--ts);line-height:1.8;margin-bottom:24px;">Generic programs produce generic results. Our custom training design process ensures your program maps directly to your business challenges, KPIs, and cultural context.</p>
          <ul class="sp-check-list">
            <li><i class="fa-solid fa-circle-check"></i>Industry-specific case studies and role plays</li>
            <li><i class="fa-solid fa-circle-check"></i>Trainer matched to your exact domain and culture</li>
            <li><i class="fa-solid fa-circle-check"></i>Flexible delivery — online, in-person, or hybrid</li>
            <li><i class="fa-solid fa-circle-check"></i>Pre/post assessment and ROI measurement included</li>
            <li><i class="fa-solid fa-circle-check"></i>Content translated into your team's language</li>
            <li><i class="fa-solid fa-circle-check"></i>Programs from 1 day to 6-month journeys</li>
          </ul>
        </div>
        <div class="sp-info-panel">
          <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:var(--tp);margin-bottom:6px;">Submit Your Training Brief</h3>
          <p style="font-size:.82rem;color:var(--ts);margin-bottom:24px;">Our L&D specialists will respond within 4 business hours with a tailored proposal.</p>
          <form onsubmit="return false;">
            <div class="sp-form-grid" style="margin-bottom:16px;">
              <div class="sp-form-group"><label class="sp-form-label">Organization Name</label><input class="sp-form-input" type="text" placeholder="Acme Corp India"></div>
              <div class="sp-form-group"><label class="sp-form-label">Your Name</label><input class="sp-form-input" type="text" placeholder="Priya Sharma"></div>
              <div class="sp-form-group"><label class="sp-form-label">Work Email</label><input class="sp-form-input" type="email" placeholder="priya@acmecorp.com"></div>
              <div class="sp-form-group"><label class="sp-form-label">Phone</label><input class="sp-form-input" type="tel" placeholder="+91 98765 43210"></div>
              <div class="sp-form-group"><label class="sp-form-label">Training Topic</label>
                <select class="sp-form-select"><option>Leadership Development</option><option>Sales Training</option><option>Soft Skills</option><option>AI & Technology</option><option>Compliance Training</option><option>Other / Custom</option></select>
              </div>
              <div class="sp-form-group"><label class="sp-form-label">Team Size</label>
                <select class="sp-form-select"><option>10–25</option><option>26–100</option><option>101–500</option><option>500+</option></select>
              </div>
              <div class="sp-form-group"><label class="sp-form-label">Preferred Timeline</label>
                <select class="sp-form-select"><option>Within 2 weeks</option><option>Within 1 month</option><option>1–3 months</option><option>Flexible</option></select>
              </div>
              <div class="sp-form-group"><label class="sp-form-label">Budget Range</label>
                <select class="sp-form-select"><option>Under ₹1 Lakh</option><option>₹1–5 Lakhs</option><option>₹5–20 Lakhs</option><option>₹20 Lakhs+</option><option>Let's discuss</option></select>
              </div>
              <div class="sp-form-group full"><label class="sp-form-label">Describe Your Training Objectives</label><textarea class="sp-form-textarea" placeholder="What business challenge are you solving? What outcomes do you expect? Any specific constraints or requirements?"></textarea></div>
            </div>
            <button class="btn btn-gold" style="width:100%;padding:14px;">Submit Training Brief →</button>
          </form>
        </div>
      </div>
    </div></section>
    <section class="sp-cta-band">
      <h2>Start with a Free Consultation</h2>
      <p>Our L&D experts will help you define the right learning architecture for your organization.</p>
      <div class="sp-cta-btns">
        <a href="contact.html" class="btn btn-gold btn-lg">Book Free Consultation</a>
        <a href="corporate-training.html" class="btn btn-ghost btn-lg">Browse Corporate Programs</a>
      </div>
    </section>
  </main>
  <div id="footer-inject"></div>
  <script src="js/shared.js"></script>
</body>
</html>
"@
Set-Content -Path "$base\request-custom-training.html" -Value $reqCustom -Encoding UTF8
Write-Host "Created: request-custom-training.html"

# ════════════════════════════════════════════════════════
# TRAINER PAGES
# ════════════════════════════════════════════════════════

# Trainer Resources
$trRes = @"
<!DOCTYPE html>
<html lang="en" class="dark-mode">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trainer Resources | World Trainer Forum — Tools & Guides for Professional Trainers</title>
  <meta name="description" content="Access free and premium resources exclusively for trainers on World Trainer Forum — templates, guides, business tools, pricing calculators, and professional development content.">
  <meta name="keywords" content="trainer resources, training tools, trainer guides, training templates, professional trainer toolkit, L&D resources, trainer business tools">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.worldtrainerforum.com/trainer-resources">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css"><link rel="stylesheet" href="css/pages.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <div id="nav-inject"></div>
  <main class="sp-page">
    <nav class="sp-breadcrumb"><a href="index.html">Home</a><span class="bc-sep">›</span><span class="bc-cur">Trainer Resources</span></nav>
    <section class="sp-hero">
      <div class="sp-hero-inner">
        <span class="sp-hero-label">Trainer Toolkit</span>
        <h1>Everything You Need to <span class="gld">Succeed as a Trainer</span></h1>
        <p class="sp-hero-desc">Handpicked resources, templates, and tools to help you grow your training business, deliver better programs, and position yourself as a thought leader.</p>
        <div class="sp-hero-ctas">
          <a href="dashboard.html" class="btn btn-gold btn-lg">Access Your Dashboard</a>
          <a href="trainer-academy.html" class="btn btn-ghost btn-lg">Trainer Academy</a>
        </div>
      </div>
    </section>
    <section class="sp-section"><div class="sp-container">
      <div class="sp-section-hdr center sp-reveal">
        <span class="sp-section-label">Resource Library</span>
        <h2 class="sp-section-title">Free Resources for <span class="a">Professional Trainers</span></h2>
      </div>
      <div class="sp-grid-3" style="margin-bottom:52px;">
        <div class="sp-card sp-reveal"><div class="sp-card-icon"><i class="fa-solid fa-file-lines"></i></div><h3>Training Proposal Templates</h3><p>Professional proposal templates tailored for corporate clients, SMEs, and individual learners. Editable in Word and Google Docs.</p><span style="color:var(--gold);font-size:.78rem;margin-top:12px;display:inline-block;">📥 Free Download</span></div>
        <div class="sp-card sp-reveal sp-reveal-d1"><div class="sp-card-icon"><i class="fa-solid fa-calculator"></i></div><h3>Pricing Calculator</h3><p>Determine your optimal training rates based on experience level, market, delivery mode, and program length.</p><span style="color:var(--gold);font-size:.78rem;margin-top:12px;display:inline-block;">🛠 Interactive Tool</span></div>
        <div class="sp-card sp-reveal sp-reveal-d2"><div class="sp-card-icon"><i class="fa-solid fa-chart-bar"></i></div><h3>Training Needs Analysis</h3><p>Client assessment questionnaire templates to uncover training gaps and define measurable learning objectives.</p><span style="color:var(--gold);font-size:.78rem;margin-top:12px;display:inline-block;">📥 Free Download</span></div>
        <div class="sp-card sp-reveal sp-reveal-d1"><div class="sp-card-icon"><i class="fa-solid fa-star"></i></div><h3>Profile Optimization Guide</h3><p>Step-by-step guide to building a compelling World Trainer Forum profile that attracts premium corporate clients.</p><span style="color:var(--gold);font-size:.78rem;margin-top:12px;display:inline-block;">📖 Read Guide</span></div>
        <div class="sp-card sp-reveal sp-reveal-d2"><div class="sp-card-icon"><i class="fa-solid fa-video"></i></div><h3>Virtual Delivery Toolkit</h3><p>Best practices, tech setup guides, and engagement techniques for delivering exceptional online training sessions.</p><span style="color:var(--gold);font-size:.78rem;margin-top:12px;display:inline-block;">📥 Free Download</span></div>
        <div class="sp-card sp-reveal sp-reveal-d3"><div class="sp-card-icon"><i class="fa-solid fa-scale-balanced"></i></div><h3>Training Contract Template</h3><p>Legally vetted contract templates for freelance trainers — covering scope, IP, payments, and cancellation policies.</p><span style="color:var(--gold);font-size:.78rem;margin-top:12px;display:inline-block;">📥 Free Download</span></div>
      </div>
      <div class="sp-section-hdr center sp-reveal">
        <span class="sp-section-label">Grow Your Business</span>
        <h2 class="sp-section-title">Premium Resources for <span class="a">Elite Trainers</span></h2>
      </div>
      <div class="sp-grid-4 sp-reveal">
        <div class="sp-card"><div class="sp-card-icon"><i class="fa-solid fa-graduation-cap"></i></div><h3>Trainer Academy Courses</h3><p>Structured online courses to master training design, facilitation, and business development.</p><a href="trainer-academy.html" style="color:var(--gold);font-size:.78rem;margin-top:10px;display:inline-block;">Explore →</a></div>
        <div class="sp-card"><div class="sp-card-icon"><i class="fa-solid fa-certificate"></i></div><h3>Certification Support</h3><p>Guidance on ICF, HRCI, ATD, and other globally recognized certifications for trainers.</p><a href="certification-support.html" style="color:var(--gold);font-size:.78rem;margin-top:10px;display:inline-block;">Learn More →</a></div>
        <div class="sp-card"><div class="sp-card-icon"><i class="fa-solid fa-calendar"></i></div><h3>Events & Workshops</h3><p>Live sessions, masterclasses, and networking events exclusively for World Trainer Forum members.</p><a href="events-workshops.html" style="color:var(--gold);font-size:.78rem;margin-top:10px;display:inline-block;">View Events →</a></div>
        <div class="sp-card"><div class="sp-card-icon"><i class="fa-solid fa-wallet"></i></div><h3>Earnings Program</h3><p>Maximize your income with referral bonuses, premium tier access, and our trainer earnings accelerator.</p><a href="earnings-program.html" style="color:var(--gold);font-size:.78rem;margin-top:10px;display:inline-block;">Start Earning →</a></div>
      </div>
    </div></section>
    <section class="sp-cta-band">
      <h2>Ready to Scale Your Training Business?</h2>
      <p>Join 50,000+ trainers who use World Trainer Forum to grow their practice globally.</p>
      <div class="sp-cta-btns">
        <a href="dashboard.html" class="btn btn-gold btn-lg">List Your Profile</a>
        <a href="become-verified.html" class="btn btn-ghost btn-lg">Get Verified</a>
      </div>
    </section>
  </main>
  <div id="footer-inject"></div>
  <script src="js/shared.js"></script>
</body>
</html>
"@
Set-Content -Path "$base\trainer-resources.html" -Value $trRes -Encoding UTF8
Write-Host "Created: trainer-resources.html"

Write-Host "Batch 1 complete."
