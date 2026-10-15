import React from 'react';
import { CalendarDays, Home, LayoutGrid, Loader2, Settings, Store } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { useDemoEntry } from '../../hooks/useDemoEntry';
import { summarisePortfolio } from '../../utils/finance';
import { computeInsights } from '../../utils/insights';
import { formatNairaCompact } from '../../utils/money';
import { isPast } from '../../utils/dates';
import { EventCard } from '../events/EventCard';
import { DemoTag } from '../ui/DemoTag';
import { btn, cx } from '../../utils/styles';
export function ProductPreviewSection() {
  const db = useDb();
  const {
    enter,
    pending
  } = useDemoEntry();
  const active = db.events.filter((e) => e.managed && e.status === 'published' && !isPast(e.endsAt)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const p = summarisePortfolio(db, active.map((e) => e.id));
  const openTasks = db.tasks.filter((t) => active.some((e) => e.id === t.eventId) && t.status !== 'done').length;
  const alerts = computeInsights(db).length;
  const stats = [{
    label: 'Active events',
    value: String(active.length)
  }, {
    label: 'Open tasks',
    value: String(openTasks)
  }, {
    label: 'Owed to vendors',
    value: formatNairaCompact(p.outstanding)
  }, {
    label: 'Needs attention',
    value: String(alerts)
  }];
  return <section className="border-t-2 border-ink bg-paper" aria-labelledby="preview-title">
      
    </section>;
}