import { createFileRoute } from "@tanstack/react-router";
import { NavigationBar } from "@/components/navigation";
import { Footer } from "@/components/landing/footer";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Placeholder for charts - will be built in Phase 3C */}
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-4">Haryanvi Music Analytics</h1>
          <p className="text-muted-foreground">Charts coming soon...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
