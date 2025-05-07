export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} AR you buying this. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6 md:ml-auto">
          <nav className="flex gap-4 sm:gap-6">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              About
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Terms
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
