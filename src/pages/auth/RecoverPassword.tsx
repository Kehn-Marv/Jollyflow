import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { FormField, fieldA11y } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { auth } from '../../services';
import { isEmail } from '../../utils/validation';
import { btn, cx, inputClass } from '../../utils/styles';

export function RecoverPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (!isEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setPending(true);
    try {
      await auth.requestPasswordReset(email);
      setSent(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We’ll help you get back into your workspace.">
      {sent ?
      <div role="status" className="rounded-2xl border-2 border-ink bg-white p-6 shadow-pop">
          <MailCheck className="h-8 w-8 text-forest" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-semibold text-ink">Check your inbox</h2>
          <p className="mt-2 text-sm text-smoke">If an account exists for <span className="font-semibold text-ink">{email}</span>, a reset link would be sent.</p>
          <p className="mt-3 rounded-xl bg-sand p-3 text-xs text-smoke">Prototype: no email is actually sent. Passwords aren’t stored in this demo, so you can sign in with any 8+ character password.</p>
          <Link to="/signin" className={cx(btn.base, btn.ink, btn.md, 'mt-5')}>Back to sign in</Link>
        </div> :

      <form onSubmit={submit} noValidate className="space-y-4">
          <FormField label="Email" htmlFor="email" error={error}>
            <Input {...fieldA11y('email', error)} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </FormField>
          <Button type="submit" disabled={pending} className={cx(btn.base, btn.ink, btn.lg, 'w-full')}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Send reset link
          </Button>
          <p className="text-center text-sm text-smoke"><Link to="/signin" className="font-semibold text-ink hover:underline">Back to sign in</Link></p>
        </form>
      }
    </AuthLayout>);

}