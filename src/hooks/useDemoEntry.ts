import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

/** One-click entry into the seeded planner workspace for judges and visitors. */
export function useDemoEntry() {
  const { enterDemo } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  async function enter(to = '/app') {
    if (pending) return;
    setPending(true);
    try {
      await enterDemo();
      toast.success('Welcome to the live demo. Everything here is sample data.');
      navigate(to);
    } catch {
      toast.error('Couldn’t open the demo. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return { enter, pending };
}