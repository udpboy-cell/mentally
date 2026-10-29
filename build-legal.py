# Génère buy/, terms/, privacy/ et refund/ avec le même habillage que index.html.
# Usage : python build-legal.py   (depuis le dossier mentally.lol)
import os

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — Mentally</title>
<meta name="description" content="{title} — Mentally, the Rivals script.">
<link rel="icon" type="image/png" href="../assets/favicon.png">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../style.css">
</head>
<body>

<video class="site-bg-video" autoplay muted loop playsinline preload="auto" poster="../assets/background-poster.jpg" aria-hidden="true">
  <source src="../assets/background.mp4" type="video/mp4">
</video>
<div class="site-bg-tint"></div>
<div class="bg-fx"></div>
<div class="grain"></div>
<div class="scroll-progress" id="scrollProgress"></div>

<header>
  <nav class="nav-pill">
    <a href="../index.html" class="brand">
      <img src="../assets/logo.png" alt="Mentally">
      <span class="wordmark">mentally<em>.lol</em></span>
    </a>
    <div class="nav-links">
      <a href="../index.html">Home</a>
      <a href="../index.html#product">Product</a>
      <a href="../index.html#reviews">Reviews</a>
      <a href="../index.html#faq">FAQ</a>
    </div>
    <div class="nav-cta">
      <a href="../buy/index.html" class="btn btn-primary btn-sm">Get Mentally · 8 €<span class="cursor-glow"></span></a>
      <button class="burger" id="burgerBtn" aria-label="Menu"><span></span></button>
    </div>
  </nav>
  <div class="mobile-menu" id="mobileMenu">
    <a href="../index.html">Home</a>
    <a href="../index.html#product">Product</a>
    <a href="../index.html#reviews">Reviews</a>
    <a href="../index.html#faq">FAQ</a>
    <a href="../buy/index.html">Buy — 8 €</a>
  </div>
</header>

<main>
{main}
</main>

<footer>
  <div class="wrap footer-row">
    <a href="../index.html" class="brand"><img src="../assets/logo.png" alt="Mentally"><span class="wordmark">mentally<em>.lol</em></span></a>
    <nav class="footer-nav" aria-label="Footer">
      <a href="../buy/index.html">Buy</a>
      <a href="../terms/index.html">Terms</a>
      <a href="../privacy/index.html">Privacy</a>
      <a href="../refund/index.html">Refunds</a>
    </nav>
    <span class="footer-copy">© 2026 Mentally</span>
  </div>
</footer>

<script src="../app.js"></script>
<script src="../fx.js"></script>
</body>
</html>
"""

TERMS = """
  <p>Welcome to Mentally. By accessing mentally.lol or purchasing the Mentally script, you agree to these Terms of Service. Please read them carefully before buying.</p>

  <h2>1. Who we are</h2>
  <ul>
    <li>Mentally ("we", "us") sells a digital product: the Mentally script for Rivals on Roblox, sold as a single plan at <strong>8 €</strong> (one-time payment).</li>
    <li>We are an independent project. We are <strong>not affiliated with, sponsored by, or endorsed by Roblox Corporation or the developers of Rivals</strong>, or any executor developer.</li>
  </ul>

  <h2>2. Eligibility</h2>
  <ul>
    <li>You must be at least 13 years old to use our services, or have the explicit consent of a parent or legal guardian.</li>
    <li>By making a purchase you confirm that you are the authorised owner of the payment method used.</li>
  </ul>

  <h2>3. Purchase, price and delivery</h2>
  <ul>
    <li>The price displayed at checkout (8 €) is the full price. Payment processor fees, if any, are shown before you confirm.</li>
    <li>Your licence key is generated and delivered automatically once the payment is confirmed. Delivery is considered complete when the key is shown or sent to you.</li>
    <li>Prices may change in the future; a change never affects a purchase already completed.</li>
  </ul>

  <h2>4. Licence and acceptable use</h2>
  <ul>
    <li>Your purchase grants you a personal, non-transferable licence to use the Mentally script. <strong>One key, one user.</strong></li>
    <li>You may not share, resell, lease, publish or redistribute your key or the script, in whole or in part.</li>
    <li>You may not reverse engineer, decompile, modify or create derivative works from the script.</li>
    <li>You are responsible for how you use the script and for complying with the rules of any platform or game you use it in.</li>
  </ul>

  <h2>5. Account security</h2>
  <ul>
    <li>You are responsible for keeping your key and any account details confidential.</li>
    <li>Keys found shared or leaked may be revoked without refund.</li>
  </ul>

  <h2>6. Updates and availability</h2>
  <ul>
    <li>We work to keep the script updated after game patches, but we cannot guarantee uninterrupted availability or compatibility with every executor or game update.</li>
    <li>Features may be added, changed or removed over time.</li>
  </ul>

  <h2>7. Refunds</h2>
  <p>Because the product is digital and delivered instantly, sales are final once delivered, except in the cases described in our <a href="../refund/index.html">Refund Policy</a>.</p>

  <h2>8. Termination</h2>
  <ul>
    <li>We may suspend or revoke a licence if these terms are breached (for example key sharing, chargebacks opened without contacting support, or abuse of our support).</li>
  </ul>

  <h2>9. Disclaimer and limitation of liability</h2>
  <ul>
    <li>The script is provided "as is", without warranty of any kind.</li>
    <li>To the fullest extent permitted by law, we are not liable for any indirect, incidental or consequential damages, including loss of accounts, data or in-game items, arising from the use of the script.</li>
    <li>Our total liability for any claim is limited to the amount you paid for the product (8 €).</li>
  </ul>

  <h2>10. Changes to these terms</h2>
  <p>We may update these terms from time to time. The date at the top of this page shows the latest revision. Continued use after a change means you accept the new terms.</p>

  <h2>11. Contact</h2>
  <p>Questions about these terms can be sent through the support channel linked on our website.</p>
"""

PRIVACY = """
  <p>This Privacy Policy explains what information Mentally collects when you visit mentally.lol or buy the Mentally script, and how we use it.</p>

  <h2>1. What we collect</h2>
  <ul>
    <li><strong>Order information:</strong> the e-mail address you give at checkout, the product bought, the price paid, the date, and the licence key generated for you.</li>
    <li><strong>Payment data:</strong> payments are handled by our payment processor. We never see or store your full card number or wallet private keys. The processor may share a transaction ID and payment status with us.</li>
    <li><strong>Technical data:</strong> standard server logs (IP address, browser type, pages requested) kept for security and to keep the site running.</li>
    <li><strong>Support messages:</strong> what you send us when you ask for help.</li>
  </ul>

  <h2>2. How we use it</h2>
  <ul>
    <li>To deliver your key and provide the product you paid for.</li>
    <li>To answer support requests and handle refunds or replacements.</li>
    <li>To prevent fraud, key sharing and abuse.</li>
    <li>To comply with legal obligations (for example accounting records).</li>
  </ul>

  <h2>3. What we do not do</h2>
  <ul>
    <li>We do not sell or rent your personal data.</li>
    <li>We do not use advertising trackers on this site.</li>
    <li>We do not send marketing e-mails unless you explicitly opt in.</li>
  </ul>

  <h2>4. Cookies</h2>
  <p>mentally.lol itself does not set tracking cookies. Our payment processor may use cookies on its own checkout pages; their policy applies there.</p>

  <h2>5. Third parties</h2>
  <p>We share data only with the services needed to run the shop: our payment processor (to take the payment) and our hosting provider (to serve the site). Each of them processes data under its own privacy policy.</p>

  <h2>6. Retention</h2>
  <p>Order records are kept for as long as required for accounting and fraud prevention. Server logs are rotated regularly. Support messages are kept until the request is resolved and for a reasonable time afterwards.</p>

  <h2>7. Your rights</h2>
  <ul>
    <li>You can ask what data we hold about you, ask for a correction, or ask for deletion where we are not legally required to keep it.</li>
    <li>If you are in the EU/EEA, you also have the right to lodge a complaint with your local data protection authority.</li>
  </ul>

  <h2>8. Children</h2>
  <p>Our services are not intended for children under 13. If you believe a child has given us personal data, contact us and we will delete it.</p>

  <h2>9. Changes</h2>
  <p>We may update this policy. The date at the top shows the latest version.</p>

  <h2>10. Contact</h2>
  <p>Privacy requests can be sent through the support channel linked on our website.</p>
"""

REFUND = """
  <p>Mentally sells a digital product (the Mentally script, 8 €) delivered instantly after payment. Because of that, our refund policy is strictly defined as follows.</p>

  <h2>1. Digital goods</h2>
  <ul>
    <li>Once your licence key has been generated and delivered, <strong>the sale is final</strong>.</li>
    <li>No refund is issued for a change of mind, for not reading the FAQ, or for an executor that is not supported.</li>
  </ul>

  <h2>2. Cryptocurrency payments</h2>
  <ul>
    <li>Cryptocurrency transactions are <strong>non-refundable</strong> because blockchain transfers are irreversible. Please double-check every detail before sending funds.</li>
  </ul>

  <h2>3. When we do refund or replace</h2>
  <p>At our discretion, a refund or a replacement key may be granted when:</p>
  <ul>
    <li>Your key was not delivered because of a technical error on our side, and we cannot deliver it within a reasonable time.</li>
    <li>You were charged twice for a single order. The duplicate charge is refunded to the original payment method (crypto network fees excluded).</li>
    <li>The script does not work at all on a supported setup and our support cannot fix it.</li>
  </ul>

  <h2>4. How to ask</h2>
  <ul>
    <li>Contact support first, with your order e-mail and a short description of the problem, within <strong>7 days</strong> of your purchase.</li>
    <li>We will try to fix the issue before anything else. Most problems are solved with a replacement key or a setup fix.</li>
  </ul>

  <h2>5. Disputes and chargebacks</h2>
  <ul>
    <li>Opening a dispute or chargeback <strong>without contacting support first</strong> results in an immediate and permanent revocation of your key and a ban from our services.</li>
    <li>If something is wrong with your order, write to us: it is faster for you and for us.</li>
  </ul>
"""

CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/></svg>'

BUY = """
<div class="wrap buy-page">
  <a href="../index.html" class="legal-back">← Back to home</a>
  <div class="buy-grid">

    <div class="buy-info">
      <h1 data-fx="split" data-fx-start="load">Get <span class="chrome-static">Mentally</span>.</h1>
      <p class="lede" data-fx="blur" data-fx-start="load" data-fx-delay="0.3">The premium Rivals script. Pay once, get your key instantly, and start playing in under a minute.</p>

      <div class="buy-visual">
        <div class="glow"></div>
        <div class="logo3d" id="logo3d">
          <div class="logo3d-stage">
            <img class="logo3d-shadow" src="../assets/logo-depth.png" alt="" aria-hidden="true">
            <div class="logo3d-depth" aria-hidden="true"></div>
            <img class="logo3d-face" src="../assets/logo.png" alt="Mentally logo">
            <canvas class="logo3d-shine" aria-hidden="true"></canvas>
          </div>
        </div>
      </div>

      <h2 class="buy-sub">What you get</h2>
      <ul class="feature-list">
        <li>The full Mentally Rivals script</li>
        <li>Clean, readable menu</li>
        <li>Fast updates</li>
        <li>Priority support</li>
        <li>High-end executors</li>
        <li>Instant key</li>
      </ul>

      <h2 class="buy-sub">How it works</h2>
      <ol class="steps steps-compact">
        <li class="step"><span class="step-n">01</span><div><h4>Pay 8 €</h4><p>One payment, with the method you prefer.</p></div></li>
        <li class="step"><span class="step-n">02</span><div><h4>Get your key</h4><p>Delivered automatically, right after payment.</p></div></li>
        <li class="step"><span class="step-n">03</span><div><h4>Play</h4><p>Run the loader, enter your key, you're in.</p></div></li>
      </ol>
    </div>

    <aside class="order-card spotlight-card" aria-label="Your order">
      <div class="order-product">
        <img src="../assets/logo.png" alt="">
        <strong>Mentally — Rivals Script</strong>
        <span class="order-price">8 €</span>
      </div>

      <div class="order-lines">
        <div class="order-line"><span>Updates</span><span class="ok">Included</span></div>
        <div class="order-line"><span>Support</span><span class="ok">Included</span></div>
        <div class="order-line"><span>Delivery</span><span class="ok">Instant</span></div>
      </div>

      <div class="order-total">
        <span>Total</span>
        <span class="amount-sm"><span data-fx="count" data-to="8" data-fx-start="load">8</span> €</span>
      </div>

      <label class="agree">
        <input type="checkbox" id="agreeTerms">
        <span class="agree-box" aria-hidden="true">""" + CHECK + """</span>
        <span>I agree to the <a href="../terms/index.html">Terms</a> and the <a href="../refund/index.html">Refund Policy</a>.</span>
      </label>

      <a id="checkoutBtn" class="btn btn-primary btn-block btn-lg is-disabled" href="#" aria-disabled="true">Continue to payment<span class="cursor-glow"></span></a>
      <p class="checkout-note" id="checkoutNote" role="status"></p>
    </aside>

  </div>
</div>
<script src="../assets/logo-shape.js"></script>
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module" src="../logo3d.js"></script>
"""


def legal(title, body):
    return ('<div class="wrap legal-page">\n'
            '  <a href="../index.html" class="legal-back">← Back to home</a>\n'
            f'  <h1 data-fx="split" data-fx-start="load">{title}</h1>\n'
            '  <p class="legal-updated">Last updated: October 2026</p>\n'
            f'{body}\n</div>')


pages = {
    'buy': ('Checkout', BUY),
    'terms': ('Terms of Service', legal('Terms of Service', TERMS)),
    'privacy': ('Privacy Policy', legal('Privacy Policy', PRIVACY)),
    'refund': ('Refund Policy', legal('Refund Policy', REFUND)),
}
here = os.path.dirname(os.path.abspath(__file__))
for folder, (title, main) in pages.items():
    os.makedirs(os.path.join(here, folder), exist_ok=True)
    with open(os.path.join(here, folder, 'index.html'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(HEAD.replace('{title}', title).replace('{main}', main))
    print('wrote', folder)
