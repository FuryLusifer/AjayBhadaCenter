import { Link } from "react-router-dom";
import { Music, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          {/* <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ajay Bhada Center
            </h3>
            <p className="text-sm text-muted-foreground">
              Your trusted destination for quality kitchen tools, utensils, and appliances. Serving homes and
              businesses with excellence.
            </p>
          </div> */}

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/orders" className="text-muted-foreground hover:text-primary transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                {/* <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Shipping Policy
                </a> */}
              </li>
              <li>
                <Link to="/returns" className="text-muted-foreground hover:text-primary transition-colors">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span><a href="https://www.google.com/maps/place/Ajay+Bhada+Center/@27.4311863,85.0312695,17z/data=!4m15!1m8!3m7!1s0x39eb490012e0f235:0x5459d038f4108f6d!2sAjay+Bhada+Center!8m2!3d27.431307!4d85.031312!10e5!16s%2Fg%2F11mkdzdghm!3m5!1s0x39eb490012e0f235:0x5459d038f4108f6d!8m2!3d27.431307!4d85.031312!16s%2Fg%2F11mkdzdghm!5m1!1e1?entry=ttu&g_ep=EgoyMDI1MTAyMi4wIKXMDSoASAFQAw%3D%3D">Raptiroad, Hetauda-1, Makawanpur</a></span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+9779763776991" className="hover:text-primary transition-colors">
                  +977 9763776991
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Music className="h-4 w-4 flex-shrink-0" />
                <a href="https://www.tiktok.com/@ajay.bhada.center" className="hover:text-primary transition-colors">
                  ajay.bhada.center
                </a>
              </li>
            </ul>
            {/* <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Facebook className="h-4 w-4 text-primary" />
              </a>
              <a
                href="#"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Instagram className="h-4 w-4 text-primary" />
              </a>
              <a
                href="#"
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Twitter className="h-4 w-4 text-primary" />
              </a>
            </div> */}
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center md:justify-between gap-2">
          <p className="text-center md:text-left">&copy; {new Date().getFullYear()} Ajay Bhada Center. All rights reserved.</p>
          <span className="text-center md:text-right">
            Developed By:&nbsp;
            <a
              href="https://www.piyushkayastha.com.np"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Piyush Kayastha
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;