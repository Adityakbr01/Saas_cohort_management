import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = useMemo(() => ({
    "Quick Links": [
      { name: "Home", href: "/" },
      { name: "Courses", href: "/courses" },
      { name: "Subscription", href: "/subscription" },
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
    Support: [
      { name: "Help Center", href: "/help" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Use", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
    Community: [
      { name: "Student Forum", href: "/forum" },
      { name: "Blog", href: "/blog" },
      { name: "Success Stories", href: "/stories" },
      { name: "Become Instructor", href: "/teach" },
    ],
  }), [])

  const socialLinks = useMemo(() => [
    { name: "Facebook", href: "#", icon: Facebook },
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "Instagram", href: "#", icon: Instagram },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "YouTube", href: "#", icon: Youtube },
  ], [])

  return (
    <footer className="bg-muted/30 border-t" aria-label="Site Footer">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1" aria-labelledby="footer-brand">
            <Link to="/" className="flex items-center space-x-2 mb-4" id="footer-brand">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">EL</span>
              </div>
              <span className="font-bold text-xl">EduLaunch</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Empowering learners worldwide with high-quality online education. Join thousands of students advancing
              their careers through our platform.
            </p>
            <div className="flex space-x-4" aria-label="Social media links">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`Follow us on ${social.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} aria-labelledby={`footer-${category.replace(/\s+/g, '').toLowerCase()}`}>
              <h3 id={`footer-${category.replace(/\s+/g, '').toLowerCase()}`} className="font-semibold mb-4">
                {category}
              </h3>
              <ul className="space-y-3" role="list">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      aria-label={`${category} - ${link.name}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div
          className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
          aria-label="Copyright and legal links"
        >
          <p className="text-muted-foreground text-sm">
            © {currentYear} EduLaunch. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
              aria-label="Terms of Use"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
