import { MarketingNav } from "@/features/marketing/components/nav";
import { Hero } from "@/features/marketing/components/hero";
import { Features } from "@/features/marketing/components/features";
import { HowItWorks } from "@/features/marketing/components/how-it-works";
import { Testimonials } from "@/features/marketing/components/testimonials";
import { Faq } from "@/features/marketing/components/faq";
import { CtaAndFooter } from "@/features/marketing/components/cta-footer";

export default function LandingPage() {
  return (
    <>
      <MarketingNav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Faq />
        <CtaAndFooter />
      </main>
    </>
  );
}
