import React from 'react';
import { HeroSection } from '../../components/home/HeroSection';
import { ProblemSection } from '../../components/home/ProblemSection';
import { WorkflowSection } from '../../components/home/WorkflowSection';
import { FeatureStory } from '../../components/home/FeatureStory';
import { MoneyVisual } from '../../components/home/visuals/MoneyVisual';
import { GiftVisual } from '../../components/home/visuals/GiftVisual';
import { IntelligenceSection } from '../../components/home/IntelligenceSection';
import { ProductPreviewSection } from '../../components/home/ProductPreviewSection';
import { UseCasesSection } from '../../components/home/UseCasesSection';
import { TestimonialsSection } from '../../components/home/TestimonialsSection';
import { FaqSection } from '../../components/home/FaqSection';
import { ClosingCta } from '../../components/home/ClosingCta';

export function Home() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <WorkflowSection />
      <div id="product" className="scroll-mt-16">
        <FeatureStory
          tone="lime"
          reverse
          eyebrow="Money"
          title={<>Follow<br />every naira.</>}
          body="Planned, committed, paid and pending stay in their own lanes. A pending transfer is never shown as paid, and a failed one never disappears quietly."
          points={['Budget categories with planned vs. committed', 'Outstanding vendor balances in one number', 'Contributions tracked separately from spending']}
          visual={<MoneyVisual />} />
        
        <FeatureStory
          tone="pink"
          eyebrow="Gifting"
          title={<>Gift and contribute with clarity.</>}
          body="Wishlists for physical gifts and cash funds for bigger dreams. Guests see what’s taken; hosts see who gave what."
          points={['Reserve a physical gift so nobody doubles up', 'Cash funds with targets and contributor records', 'Only confirmed contributions count towards a target']}
          visual={<GiftVisual />}
          cta={{ to: '/features/gifting', label: 'See gifting features' }} />
        
      </div>
      <IntelligenceSection />
      <ProductPreviewSection />
      <UseCasesSection />
      <TestimonialsSection />
      <FaqSection />
      <ClosingCta />
    </>);

}