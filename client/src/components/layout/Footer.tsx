import { Link } from "wouter";
import { 
  TwitterIcon, 
  FacebookIcon, 
  InstagramIcon, 
  GithubIcon 
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold tracking-wider font-['Bebas_Neue']">
                MANGA<span className="text-primary">VERSE</span>
              </span>
            </Link>
            <p className="text-muted-foreground mt-2 max-w-md">
              Your go-to platform for all your manga needs. Read, discover, and enjoy thousands of manga titles across various genres.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/browse" className="hover:text-primary transition-colors">
                    Browse All
                  </Link>
                </li>
                <li>
                  <Link href="/browse" className="hover:text-primary transition-colors">
                    Genres
                  </Link>
                </li>
                <li>
                  <Link href="/browse?sort=latest" className="hover:text-primary transition-colors">
                    New Releases
                  </Link>
                </li>
                <li>
                  <Link href="/browse?sort=popular" className="hover:text-primary transition-colors">
                    Popular
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Information</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4 text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors text-xl">
                  <TwitterIcon className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-primary transition-colors text-xl">
                  <FacebookIcon className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-primary transition-colors text-xl">
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-primary transition-colors text-xl">
                  <GithubIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} MangaVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
