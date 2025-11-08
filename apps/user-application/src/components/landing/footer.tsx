import { FaXTwitter, FaGithub } from "react-icons/fa6";

const social = [
  {
    name: "GitHub",
    href: "#",
    icon: FaGithub,
  },
  {
    name: "X",
    href: "#",
    icon: FaXTwitter,
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col items-center space-y-4">
        <div className="flex space-x-6">
          {social.map((item) => {
            const IconComponent = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="sr-only">{item.name}</span>
                <IconComponent className="h-5 w-5" />
              </a>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} Haryanvi-Slang. MIT Licensed.
        </p>
      </div>
    </footer>
  );
}
