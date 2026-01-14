<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-grid">
        <!-- About Section -->
        <div class="footer-section">
          <div class="footer-logo">
            <img src="../img/logo.png" alt="Blue Zone Twente Logo" class="footer-logo-icon" />
            <span class="footer-logo-text">Blue Zone Twente</span>
          </div>
          <p class="footer-description">
            {{ $t('footer.description') }}
          </p>
          <div class="footer-social">
            <a href="#" class="footer-social-link" aria-label="Facebook">
              <Facebook :size="20" />
            </a>
            <a href="#" class="footer-social-link" aria-label="Twitter">
              <Twitter :size="20" />
            </a>
            <a href="#" class="footer-social-link" aria-label="Instagram">
              <Instagram :size="20" />
            </a>
            <a href="#" class="footer-social-link" aria-label="LinkedIn">
              <Linkedin :size="20" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-section">
          <h3 class="footer-title">{{ $t('footer.quickLinks') }}</h3>
          <ul class="footer-links">
            <li><a href="#" @click.prevent="navigate('home')">{{ $t('nav.home') }}</a></li>
            <li><a href="#" @click.prevent="navigate('story')">{{ $t('nav.story') }}</a></li>
            <li><a href="#" @click.prevent="navigate('events')">{{ $t('nav.events') }}</a></li>
            <li><a href="#" @click.prevent="navigate('forum')">{{ $t('nav.forum') }}</a></li>
            <li><a href="#" @click.prevent="navigate('map')">{{ $t('nav.map') }}</a></li>
          </ul>
        </div>

        <!-- Community -->
        <div class="footer-section">
          <h3 class="footer-title">{{ $t('footer.community') }}</h3>
          <ul class="footer-links">
            <li><a href="#" @click.prevent="navigate('newsletter')">{{ $t('nav.newsletter') }}</a></li>
            <li><a href="#">{{ $t('footer.blog') }}</a></li>
            <li><a href="#">{{ $t('footer.resources') }}</a></li>
            <li><a href="#">{{ $t('footer.partnerships') }}</a></li>
            <li><a href="#">{{ $t('footer.volunteer') }}</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="footer-section">
          <h3 class="footer-title">{{ $t('footer.contact') }}</h3>
          <ul class="footer-contact">
            <li class="footer-contact-item">
              <Mail :size="16" />
              <span>info@bluezonetwente.nl</span>
            </li>
            <li class="footer-contact-item">
              <MapPin :size="16" />
              <span>Enschede, Twente, Netherlands</span>
            </li>
            <li class="footer-contact-item">
              <Phone :size="16" />
              <span>+31 (0) 123 456 789</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <p class="footer-copyright">
          {{ $t('footer.copyright', { year: currentYear }) }}
        </p>
        <div class="footer-legal">
          <a href="#">{{ $t('footer.privacyPolicy') }}</a>
          <a href="#">{{ $t('footer.termsOfService') }}</a>
          <a href="#">{{ $t('footer.cookiePolicy') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-vue-next'

export default {
  name: 'Footer',
  components: {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  },
  methods: {
    navigate(page) {
      this.$router.push({ name: page })
    }
  }
}
</script>

<style scoped>
.footer {
  background: rgb(var(--color-text-primary));
  color: white;
  padding: 3rem 0 1.5rem;
  margin-top: auto;
}

.footer-container {
  max-width: 1536px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .footer-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .footer-container {
    padding: 0 2rem;
  }
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (min-width: 640px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .footer-grid {
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 3rem;
  }
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Logo */
.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.footer-logo-icon {
  height: 48px;
  width: 48px;
  object-fit: contain;
}

.footer-logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.footer-description {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  font-size: 0.875rem;
}

/* Social Links */
.footer-social {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.footer-social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.2s ease;
}

.footer-social-link:hover {
  background: rgb(var(--color-primary));
  transform: translateY(-2px);
}

/* Footer Title */
.footer-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

/* Footer Links */
.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li a {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.footer-links li a:hover {
  color: rgb(var(--color-primary));
}

/* Contact */
.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-contact-item {
  display: flex;
  align-items: start;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.footer-contact-item svg {
  margin-top: 0.125rem;
  flex-shrink: 0;
  color: rgb(var(--color-primary));
}

/* Footer Bottom */
.footer-bottom {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  align-items: center;
  text-align: center;
}

@media (min-width: 768px) {
  .footer-bottom {
    flex-direction: row;
    justify-content: space-between;
  }
}

.footer-copyright {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin: 0;
}

.footer-legal {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-legal a {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.footer-legal a:hover {
  color: white;
}
</style>
