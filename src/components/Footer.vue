<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-grid">
        <!-- About Section -->
        <div class="footer-section">
          <div class="footer-logo">
            <Sprout :size="32" class="footer-logo-icon" />
            <span class="footer-logo-text">Blue Zone Twente</span>
          </div>
          <p class="footer-description">
            A vibrant community dedicated to healthy, social, and sustainable living
            in the beautiful Twente region.
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
          <h3 class="footer-title">Quick Links</h3>
          <ul class="footer-links">
            <li><a href="#" @click.prevent="navigate('home')">Home</a></li>
            <li><a href="#" @click.prevent="navigate('story')">Our Story</a></li>
            <li><a href="#" @click.prevent="navigate('events')">Events</a></li>
            <li><a href="#" @click.prevent="navigate('forum')">Forum</a></li>
            <li><a href="#" @click.prevent="navigate('map')">Map</a></li>
          </ul>
        </div>

        <!-- Community -->
        <div class="footer-section">
          <h3 class="footer-title">Community</h3>
          <ul class="footer-links">
            <li><a href="#" @click.prevent="navigate('newsletter')">Newsletter</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Resources</a></li>
            <li><a href="#">Partnerships</a></li>
            <li><a href="#">Volunteer</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="footer-section">
          <h3 class="footer-title">Contact</h3>
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
          © {{ currentYear }} Blue Zone Twente. All rights reserved.
        </p>
        <div class="footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { Sprout, Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-vue-next'

export default {
  name: 'Footer',
  components: {
    Sprout,
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
  color: rgb(var(--color-primary));
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
