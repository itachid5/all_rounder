import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Enterprise Resource Planning
        </h1>
        <p className="text-xl text-muted-foreground">
          A powerful, multi-tenant ERP platform designed to streamline your business operations and accelerate growth.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/platform/login" 
            className="w-full sm:w-auto px-8 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
          >
            Platform Admin
          </Link>
          <Link 
            href="/business-login" 
            className="w-full sm:w-auto px-8 py-3 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium transition-colors"
          >
            Business Login
          </Link>
        </div>
      </div>
    </div>
  );
}
