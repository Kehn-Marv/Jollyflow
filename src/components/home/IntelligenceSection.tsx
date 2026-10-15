import React from 'react';
import { Loader2, Radar } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { computeInsights } from '../../utils/insights';
import { InsightCard } from '../insights/InsightCard';
import { useDemoEntry } from '../../hooks/useDemoEntry';
import { btn, cx } from '../../utils/styles';
const RULES = ['Deposits due within 3 days', 'Balances due within a week', 'Overdue tasks', 'Bookings not yet confirmed', 'Low RSVP response', 'Commitments over budget', 'Failed payments'];
export function IntelligenceSection() {
  const db = useDb();
  const insights = computeInsights(db).slice(0, 4);
  const {
    enter,
    pending
  } = useDemoEntry();
  return <section className="on-dark border-t-2 border-ink bg-forest text-paper" aria-labelledby="intel-title">
      
    </section>;
}